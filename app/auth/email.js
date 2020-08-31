/**
 * Created by horvath on 2017. 05. 10.
 */
let express = require('express');
let nodemailer = require('nodemailer');
let User = require('../models/user');
let Group = require('../models/group');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adam.attrecto@gmail.com',
        pass: 'YHx69c86'
    }
});

let rand, mailOptions, host, link;

let getTransporter = () => {
    return transporter;
};

let sendMail = (req, res) => {
    rand = Math.floor((Math.random() * 1000000) + 54321);
    host = req.get('host');
    link = "https://imhotep.nyme.hu:14433/api/verify?id=" + rand;
    mailOptions = {
        from: 'Cost Family',
        to: req.body.email,
        subject: "email-cím megerősítése",
        html: "Hello,<br> Kérlek kattints a linkre, hogy megerősítsd az email-címedet.<br><a href=" + link + ">Kattints ide</a>"
    };
    transporter.sendMail(mailOptions, (err, result) => {
        if (err) {
            console.log(3000, err.message);
            return res.status(500).send({success: true, 'message': err.message});
        } else {
            console.log(3001, 'Message sent to ' + req.body.email);
            return res.status(200).send({success: true, 'message': 'Message sent.'})
        }
    });
};

let verify = (req, res) => {
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        if (req.query.id == rand) {
            User.findOne({
                email: mailOptions.to
            }, (err, user) => {
                if (err) {
                    console.log(3002, err.message);
                    return res.status(404).send({success: false, msg: 'User not found.'});
                }
                if (!user) {
                    console.log(3003, 'User not found.');
                    return res.status(404).send({success: false, msg: 'User not found.'});
                } else {
                    Group.findById(user.group_id, (err, group) => {
                        if (err || !group) {
                            console.log(3004, 'Group not found');
                            return res.status(404).send({success: false, msg: 'Group not found.'});
                        }
                        if (group.admin == user.id) {
                            user.account_type = 'ACKNOWLEDGED';
                            user.save((err) => {
                                if (err) {
                                    console.log(3005, err.message);
                                    throw err;
                                }
                                console.log(3006, mailOptions.to + ' verified.');
                                return res.status(200).send({
                                    'email': mailOptions.to,
                                    'message': 'A(z) ' + mailOptions.to + ' címet sikeresen megerősítetted. Te vagy a csoport adminisztrátora.'
                                });
                            });
                        }
                        else {
                            user.account_type = 'CONFIRMED';
                            // notify admin about the user's request
                            group.pending_requests.push(user.id);
                            group.save((err) => {
                                if (err) {
                                    console.log(3007, err.message);
                                    return res.status(500).send({success: false, msg: 'Error while saving group.'});
                                }
                                user.save((err) => {
                                    if (err) {
                                        console.log(3008, err.message);
                                        throw err;
                                    }
                                    console.log(3009, mailOptions.to + ' verified.');
                                    return res.status(200).send({
                                        'email': mailOptions.to,
                                        'message': 'A(z) ' + mailOptions.to + ' címet sikeresen megerősítetted. Várj, amíg az admin elfogadja a csatlakozási kérésedet!'
                                    });
                                });
                            });
                        }

                    });
                }
            });
        }
        else {
            console.log(3010, 'Bad request.');
            return res.status(400).send({success: false, 'message': 'Bad request'});
        }
    }
    else {
        console.log(3011, 'Request is from unknown source.');
        return res.status(500).send({success: false, 'message': 'Request is from unknown source.'});
    }
};

module.exports = {
    sendMail,
    verify,
    getTransporter,
};
