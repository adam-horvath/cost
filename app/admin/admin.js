/**
 * Created by horvath on 2017. 05. 15.
 */
let User = require('../models/user');
let Group = require('../models/group');
let auth = require('../auth/auth');
let jwt = require('jwt-simple');
let config = require('../../config/database'); // get db config file
let url = require('url');
let nodemailer = require('nodemailer');
let email = require('../auth/email');

let archive = (req, res) => {
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let user = result.user;
            if (user.email == 'horvath@inf.uni-sopron.hu') {
                const mailOptions = {
                    from: 'Cost Family',
                    to: 'horvath@inf.uni-sopron.hu',
                    subject: "adatbázis-mentés",
                    html: "Csatolva a legfrissebb archívum.<br>",
                    attachments: [
                        {
                            filename: 'archive.tar.gz',
                            path: '/var/www/dump/archive.tar.gz'
                        }
                    ]
                };
                email.getTransporter().sendMail(mailOptions, (err, result) => {
                    if (err) {
                        console.log(err);
                        console.log(300077, err.message);
                        return res.status(500).send({success: false, message: err.message});
                    } else {
                        console.log(300177, 'Message sent to superadmin.');
                        return res.status(200).send({success: true, message: 'Message sent to superadmin.'})
                    }
                });
            }
            else {
                return res.status(403).send({success: false, message: 'Az archiválást csak superadmin kérheti.'});
            }
        });
};

let acknowledge = (req, res) => {
    let token = auth.getToken(req.headers);
    if (token) {
        let decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: decoded.email
        }, (err, admin) => {
            // req.body.email is the email address of the request sender
            if (err || !admin || !req.body || !req.body.email) {
                console.log(1000, 'Bad request (admin).');
                return res.status(400).send({success: false, msg: 'Bad request (admin).'});
            }
            User.findOne({
                email: req.body.email
            }, (err, user) => {
                if (err || !user || user.account_type !== 'CONFIRMED') {
                    console.log(1001, 'Bad request (user).');
                    return res.status(400).send({success: false, msg: 'Bad request (user).'});
                }
                Group.findById(user.group_id, (err, group) => {
                    if (err || !group) {
                        console.log(1002, 'Group not found');
                        return res.status(404).send({success: false, msg: 'Group not found.'});
                    }
                    if (group.admin != admin.id) {
                        console.log(1003, 'Unauthorized.');
                        return res.status(403).send({success: false, msg: 'Unauthorized.'});
                    }
                    group.pending_requests.pull(user.id);
                    group.save((err) => {
                        if (err) {
                            console.log(1004, err.message);
                            return res.status(500).send({success: false, msg: 'Error while saving group.'});
                        }
                        if (req.body.acknowledged == true || req.body.acknowledged == 'true') {
                            user.account_type = 'ACKNOWLEDGED';
                            user.save((err) => {
                                if (err) {
                                    console.log(1005, err.message);
                                    return res.status(500).send({success: false, msg: 'Error while saving user.'});
                                }
                                console.log(1006, user.email + ' has been successfully acknowledged.');
                                return res.status(200).send({success: true, msg: 'Elfogadtad a felhasználó csatlakozási kérését.'});
                            });
                        }
                        else {
                            user.account_type = 'REJECTED';
                            user.save((err) => {
                                if (err) {
                                    console.log(1095, err.message);
                                    return res.status(500).send({success: false, msg: 'Error while saving user.'});
                                }
                                console.log(1007, user.email + ' has been rejected.');
                                return res.status(200).send({success: true, msg: 'A felhasználó kérését visszautasítottad.'});
                            });
                        }
                    });
                });
            });
        });
    } else {
        console.log(1008, 'No token provided');
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
};

let deleteUser = (req, res) => {
    let pathParts = url.parse(req.url).pathname.split('/');
    let userId = pathParts[3];
    if (!userId) {
        console.log(1009, 'No user ID provided.');
        return res.status(400).send({success: false, msg: 'No user ID provided.'});
    }
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let requirerGroup = result.group;
            let requirer = result.user;
            User.findById(userId, (err, userToDelete) => {
                if (err || !userToDelete) {
                    console.log(1010, 'User not found');
                    return res.status(400).send({success: false, msg: 'User not found.'});
                }
                // if the requirer is a group admin of the same group as userToDelete
                if (requirer.id == requirerGroup.admin && userToDelete.group_id == requirerGroup.id) {
                    // if the admin wants to delete another user from the group
                    if (userId != requirer.id) {
                        userToDelete.account_type = 'REJECTED';
                        userToDelete.save((err) => {
                            if (err) {
                                console.log(1011, 'User not found');
                                return res.status(400).send({success: false, msg: 'User not found.'});
                            }
                            console.log(1012, 'The user state is REJECTED now.');
                            return res.status(200).send({success: true, msg: 'A felhasználót törölted a csoportból.'});
                        });
                    }
                    // deletion is not allowed while other users are present in the admin's group
                    else {
                        User.find({
                            group_id: requirer.group_id
                        }, (err, users) => {
                            if (users.length > 1) {
                                console.log(1013, 'Deletion is not allowed while other users are present in the group.');
                                return res.status(400).send({success: false, msg: 'A profil törlése nem engedélyezett amíg más felhasználók is vannak a csoportban.'});
                            }
                            else {
                                User.findByIdAndRemove(requirer.id, (err, deletedUser) => {
                                    if (err || !deletedUser) {
                                        console.log(1014, 'User not found.');
                                        return res.status(400).send({success: false, msg: 'User not found.'});
                                    }
                                    Group.findByIdAndRemove(deletedUser.group_id, (err, deletedGroup) => {
                                        if (err || !deletedGroup) {
                                            console.log(1015, 'Group not found.');
                                            return res.status(400).send({success: false, msg: 'Group not found.'});
                                        }
                                        console.log(1016, deletedUser.email + ' and ' + deletedGroup.name + ' group deleted.');
                                        return res.status(200).send({success: true, msg: 'A profil és a csoport törölve.', email: deletedUser.email});
                                    })
                                });
                            }
                        });
                    }
                }
                // the non-admin user wants to delete himself
                else if (requirer.id != requirerGroup.admin && userId == requirer.id) {
                    User.findByIdAndRemove(userId, (err, deletedUser) => {
                        if (err || !deletedUser) {
                            console.log(1017, 'User not found');
                            return res.status(400).send({success: false, msg: 'User not found.'});
                        }
                        console.log(1018, deletedUser.email + ' deleted.');
                        return res.status(200).send({success: true, msg: 'Profil törölve.', email: deletedUser.email});
                    });
                }
                // some error or malicious behavior
                else {
                    console.log(1019, 'Authorization failed.');
                    return res.status(400).send({success: false, msg: 'Authorization failed.'});
                }
            });
        })
        .catch((err) => {
            console.log(1020, err.message);
            return res.status(403).send({success: false, msg: err.message});
        });
};

let getAdminData = (req, res) => {
    auth.getUserAndGroup(auth.getToken(req.headers))
        .then((result) => {
            let group = result.group;
            User.find({
                group_id: group.id,
            }, (err, groupMembers) => {
                if (err) {
                    console.log(15001, 'No group members in this group.');
                    return res.status(500).send({success: false, msg: 'Nem találhatók felhasználók a csoportban.'});
                }
                let nonAdminUsers = [];
                groupMembers.forEach((member) => {
                    if (member.id != group.admin && member.account_type == 'ACKNOWLEDGED') {
                        member.password = 'hidden';
                        nonAdminUsers.push(member);
                    }
                });
                let tasksToGo = group.pending_requests.length;
                let onComplete = (users) => {
                    return res.status(200).send({
                        group_members: nonAdminUsers,
                        pending_requests: users
                    });
                };
                // if no pending requests are in the queue
                if (tasksToGo === 0) {
                    onComplete([]);
                }
                let pendingUsers = [];
                group.pending_requests.forEach((userId) => {
                    User.findById(userId, (err, pendingUser) => {
                        pendingUsers.push(pendingUser.email);
                        if (--tasksToGo === 0) {
                            onComplete(pendingUsers);
                        }
                    });
                });
            });

        })
        .catch((err) => {
            console.log(15003, err.message);
            return res.status(403).send({success: false, msg: err.message});
        });
};

module.exports = {
    acknowledge,
    deleteUser,
    getAdminData,
    archive,
};
