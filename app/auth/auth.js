/**
 * Created by horvath on 2017. 05. 08.
 */
let User = require('../models/user'); // get the mongoose model
let Group = require('../models/group');
let config = require('../../config/database'); // get db config file
let jwt = require('jwt-simple');
let email = require('./email');

let register = (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.group_name) {
        console.log(2000, 'Please pass correct parameters.');
        return res.json({success: false, msg: 'Please pass correct parameters.'});
    }
    // email address validation
    if (!validateEmail(req.body.email)) {
        console.log(2001, 'Invalid email address: ' + req.body.email);
        return res.json({success: false, msg: 'Invalid email address.'});
    }
    // if the user connects to an existing group
    if (req.body.existing_group == 'true') {
        Group.findOne({
            name: req.body.group_name
        }, (err, group) => {
            if (err || !group) {
                console.log(2002, req.body.group_name + ' group does not exist.');
                return res.json({success: false, msg: req.body.group_name + ' csoport nem létezik.'});
            }
            let newUser = new User({
                email: req.body.email,
                password: req.body.password,
                account_type: 'REGISTERED',
                group_id: group.id
            });
            if (req.body.name) {
                newUser.name = req.body.name;
            }
            newUser.save((err) => {
                if (err) {
                    // if the user exists and rejected by the admin
                    User.findOne({
                        email: req.body.email
                    }, (err1, existingUser) => {
                        if (err1) {
                            console.log(2003, err1.message);
                            return res.json({success: false, msg: err1.message});
                        }
                        if (existingUser.account_type == 'REJECTED') {
                            existingUser.password = req.body.password;
                            existingUser.account_type = 'REGISTERED';
                            existingUser.group_id = group.id;
                            existingUser.save((err) => {
                                if (err) {
                                    console.log(20031, err.message);
                                    return res.json({success: false, msg: err.message});
                                }
                                console.log(20044, newUser.email + ' created successfully');
                                email.sendMail(req, res);
                                return res.json({success: true, msg: 'User created successfully.'});
                            });
                        }
                        else {
                            console.log(20032, err.message);
                            return res.json({success: false, msg: err.message});
                        }
                    });
                }
                else {
                    console.log(2004, newUser.email + ' created successfully');
                    email.sendMail(req, res);
                    return res.json({success: true, msg: 'User created successfully.'});
                }
            });
        })
    }
    // create new group
    else {
        let newGroup = new Group({
            name: req.body.group_name
        });
        newGroup.save((err) => {
            if (err) {
                console.log(2005, 'Group already exists.');
                return res.status(400).send({success: false, msg: 'Group already exists.'});
            }
            Group.findOne({
                name: req.body.group_name
            }, (err, group) => {
                if (err || !group) {
                    console.log(2006, err.message);
                    return res.status(404).send({success: false, msg: err.message});
                }
                let newUser = new User({
                    email: req.body.email,
                    password: req.body.password,
                    account_type: 'REGISTERED',
                    group_id: group.id
                });
                if (req.body.name) {
                    newUser.name = req.body.name;
                }
                // save the user
                newUser.save((err) => {
                    if (err) {
                        // if the user exists and rejected by the admin
                        User.findOne({
                            email: req.body.email
                        }, (err2, existingUser) => {
                            if (err2) {
                                Group.findByIdAndRemove(group.id, (err5, deletedGroup) => {
                                    err5 ? console.log(20079, err5.message) : console.log(20080);
                                });
                                console.log(20077, err2.message);
                                return res.json({success: false, msg: err2.message});
                            }
                            if (existingUser.account_type == 'REJECTED') {
                                existingUser.password = req.body.password;
                                existingUser.account_type = 'REGISTERED';
                                existingUser.group_id = group.id;
                                existingUser.save((err3) => {
                                    if (err3) {
                                        Group.findByIdAndRemove(group.id, (err5, deletedGroup) => {
                                            err5 ? console.log(20081, err5.message) : console.log(20082);
                                        });
                                        console.log(20071, err3.message);
                                        return res.json({success: false, msg: err3.message});
                                    }
                                    group.admin = existingUser.id;
                                    group.save((err4) => {
                                        if (err4) {
                                            Group.findByIdAndRemove(group.id, (err5, deletedGroup) => {
                                                err5 ? console.log(20083, err5.message) : console.log(20084);
                                            });
                                            console.log(2008, err4.message);
                                            return res.json({success: false, msg: err4.message});
                                        }
                                        console.log(2009, newUser.email + ' created successfully');
                                        email.sendMail(req, res);
                                        return res.json({success: true, msg: 'User created successfully.'});
                                    })
                                });
                            }
                            else {
                                Group.findByIdAndRemove(group.id, (err5, deletedGroup) => {
                                    err5 ? console.log(20085, err5.message) : console.log(20086);
                                });
                                console.log(20072, 'ExistingUser');
                                return res.json({success: false, msg: 'Ez a felhasználó már létezik.'});
                            }
                        });
                    }
                    else {
                        group.admin = newUser.id;
                        group.save((err41) => {
                            if (err41) {
                                Group.findByIdAndRemove(group.id, (err51, deletedGroup) => {
                                    err51 ? console.log(20083, err51.message) : console.log(20084);
                                });
                                console.log(2008, err41.message);
                                return res.json({success: false, msg: err41.message});
                            }
                            console.log(20099, newUser.email + ' created successfully');
                            email.sendMail(req, res);
                            return res.json({success: true, msg: 'User created successfully.'});
                        });
                    }
                });
            });
        });
    }
};

let login = (req, res) => {
    User.findOne({
        email: req.body.email
    }, (err, user) => {
        if (err) {
            console.log(2010, err.message);
            return res.status(404).send({success: false, msg: 'User not found.'});
        }
        if (!user) {
            console.log(2011, 'Authentication failed. User not found.');
            return res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if the user has not confirmed his/her email address
                    if (user.account_type == 'REGISTERED') {
                        console.log(2012, 'Please confirm your email address.');
                        return res.status(403).send({success: false, msg: 'Erősítsd meg az email-címedet!'});
                    }
                    // if the admin has not acknowledged the user yet
                    if (user.account_type == 'CONFIRMED') {
                        console.log(2012, 'Please wait for the admin to acknowledge your connection to the group.');
                        return res.status(403).send({success: false, msg: 'Várj, amíg az admin elfogadja a csatlakozási kérésedet!'});
                    }
                    // if the admin has not acknowledged the user yet
                    if (user.account_type == 'REJECTED') {
                        console.log(20120, 'The admin has rejected your connection to the group.');
                        return res.status(403).send({success: false, msg: 'Az admin visszautasította a csatlakozási kérésedet!'});
                    }
                    // if user is found and password is right create a token
                    let token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    console.log(2013, 'JWT provided.');
                    return res.json({success: true, token: 'JWT ' + token, id: user.id});
                } else {
                    console.log(2014, 'Wrong password');
                    return res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
};

let getToken = (headers) => {
    if (headers && headers.authorization) {
        let parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

let getUserAndGroup = (token) => {
    return new Promise((resolve, reject) => {
        if (token) {
            let decoded = jwt.decode(token, config.secret);
            User.findOne({
                email: decoded.email
            }, (err, user) => {
                if (err) {
                    return reject(err.message);
                }
                if (!user) {
                    return reject('User not found.');
                }
                Group.findById(user.group_id, (err, group) => {
                    if (err) {
                        return reject(err.message);
                    }
                    if (!group) {
                        return reject('Group not found.');
                    }
                    return resolve({
                        user: user,
                        group: group
                    });
                });
            });
        }
        else {
            return reject('Authentication failed.');
        }
    });
};

let validateEmail = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

module.exports = {
    register,
    login,
    getToken,
    getUserAndGroup,
};
