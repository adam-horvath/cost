/**
 * Created by horvath on 2017. 05. 10.
 */
let config = require('../../config/database'); // get db config file
let jwt = require('jwt-simple');
let auth = require('../auth/auth');
let User = require('../models/user');

module.exports = (req, res, next) => {
    let token = auth.getToken(req.headers);
    if (token) {
        try {
            let decoded = jwt.decode(token, config.secret);
            User.findOne({
                email: decoded.email
            }, (err, user) => {
                if (err || !user) {
                    console.log(4000, 'User not found');
                    return res.status(404).send({success: false, msg: 'User not found.'});
                }
                next();
            });
        } catch (err) {
            console.log(4001, 'Unauthorized');
            res.status(403);
            return res.json({'status': 403, 'message': 'Unauthorized', 'error': err});
        }
    }
    else {
        console.log(4002, 'Invalid token.');
        res.status(401);
        return res.json({'status': 401, 'message': 'Invalid token'});
    }
};
