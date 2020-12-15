/**
 * Created by horvath on 2017. 05. 08.
 */
let express = require('express');
let passport = require('passport');
let dashboard = require('../app/main/dashboard');
let auth = require('../app/auth/auth');
let email = require('../app/auth/email');
let admin = require('../app/admin/admin');
let query = require('../app/main/query');
let chart = require('../app/main/chart');
let geolocation = require('../app/geolocation/geolocation');

let router = express.Router();

/*
 * Routes that can be accessed by anyone
 */
router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/verify', email.verify);
router.get('/geocode', geolocation.getCity);

/*
 * Routes that can be accessed only by authenticated users
 */
router.post('/v1/acknowledge', admin.acknowledge);
router.get('/v1/admin', admin.getAdminData);
router.delete('/v1/user/:id', admin.deleteUser);

router.post('/v1/main', dashboard.getMainDashboard);
router.post('/v1/stats', dashboard.getStats);

router.post('/v1/item', dashboard.addItem);
router.delete('/v1/item/:id', dashboard.deleteItem);
router.put('/v1/item', dashboard.updateItem);

router.post('/v1/query', query.query);
router.post('/v1/query-list', query.queryList);

// router.get('/v1/hack', dashboard.hack);
router.get('/v1/archive', admin.archive);

router.post('/v1/chart', chart.getChartData);

module.exports = router;
