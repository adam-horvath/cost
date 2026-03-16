const User = require('../models/user');
const Group = require('../models/group');
const jwt = require('jsonwebtoken');
const emailSvc = require('./email');

// Saves a new user, or reactivates a previously REJECTED user.
// Throws a 409 error if the user already exists with a non-REJECTED status.
const saveUserRecord = async ({ email, password, name, group_id }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        if (existingUser.account_type !== 'REJECTED') {
            const err = new Error('Ez a felhasználó már létezik.');
            err.status = 409;
            throw err;
        }
        existingUser.password = password;
        existingUser.account_type = 'REGISTERED';
        existingUser.group_id = group_id;
        if (name) existingUser.name = name;
        return existingUser.save();
    }
    const newUser = new User({ email, password, account_type: 'REGISTERED', group_id });
    if (name) newUser.name = name;
    return newUser.save();
};

const register = async (req, res) => {
    const { email, password, group_name, name, existing_group } = req.body;
    if (!email || !password || !group_name) {
        return res.status(400).json({ success: false, msg: 'Please pass correct parameters.' });
    }
    if (!validateEmail(email)) {
        return res.status(400).json({ success: false, msg: 'Invalid email address.' });
    }
    try {
        if (existing_group === 'true') {
            const group = await Group.findOne({ name: group_name });
            if (!group) {
                return res.status(404).json({ success: false, msg: `${group_name} csoport nem létezik.` });
            }
            await saveUserRecord({ email, password, name, group_id: group._id });
        } else {
            const existingGroup = await Group.findOne({ name: group_name });
            if (existingGroup) {
                return res.status(400).json({ success: false, msg: 'Group already exists.' });
            }
            const newGroup = await new Group({ name: group_name }).save();
            try {
                const user = await saveUserRecord({ email, password, name, group_id: newGroup._id });
                newGroup.admin = user._id;
                await newGroup.save();
            } catch (err) {
                await Group.findByIdAndDelete(newGroup._id);
                throw err;
            }
        }
    } catch (err) {
        if (err.status === 409) {
            return res.status(409).json({ success: false, msg: err.message });
        }
        throw err;
    }
    try {
        await emailSvc.sendMail(email, req.get('host'));
    } catch (e) {
        console.log('Warning: verification email failed to send:', e.message);
    }
    return res.status(200).json({ success: true, msg: 'User created successfully.' });
};

const login = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).send({ success: false, msg: 'Authentication failed. User not found.' });
    }
    user.comparePassword(req.body.password, (err, isMatch) => {
        if (err || !isMatch) {
            return res.send({ success: false, msg: 'Authentication failed. Wrong password.' });
        }
        if (user.account_type === 'REGISTERED') {
            return res.status(403).send({ success: false, msg: 'Erősítsd meg az email-címedet!' });
        }
        if (user.account_type === 'CONFIRMED') {
            return res.status(403).send({ success: false, msg: 'Várj, amíg az admin elfogadja a csatlakozási kérésedet!' });
        }
        if (user.account_type === 'REJECTED') {
            return res.status(403).send({ success: false, msg: 'Az admin visszautasította a csatlakozási kérésedet!' });
        }
        // Encode only non-sensitive identity claims — NOT the full user document
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        return res.json({ success: true, token: 'JWT ' + token, id: user.id });
    });
};

const getToken = (headers) => {
    if (headers && headers.authorization) {
        const parted = headers.authorization.split(' ');
        return parted.length === 2 ? parted[1] : null;
    }
    return null;
};

const getUserAndGroup = async (token) => {
    if (!token) {
        const err = new Error('Authentication failed.');
        err.status = 401;
        throw err;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            const err = new Error('User not found.');
            err.status = 403;
            throw err;
        }
        const group = await Group.findById(user.group_id);
        if (!group) {
            const err = new Error('Group not found.');
            err.status = 403;
            throw err;
        }
        return { user, group };
    } catch (err) {
        if (!err.status) err.status = 403;
        throw err;
    }
};

const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

module.exports = { register, login, getToken, getUserAndGroup };
