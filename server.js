let express     = require('express');
let bodyParser  = require('body-parser');
let morgan      = require('morgan');
let mongoose    = require('mongoose');
let passport	= require('passport');
let config      = require('./config/database'); // get db config file
let port        = process.env.PORT || 8080;
let app         = express();

// for logging
let fs = require('fs');
let util = require('util');
let date = new Date();
let month = date.getMonth() + 1;
let fileName = './log/' + date.getFullYear() + '-' + month + '-' + date.getDate() +'.log';
let log_file = null;
if (!fs.existsSync(fileName)) {
    log_file = fs.createWriteStream(fileName, {flags: 'w'});
}
let log_stdout = process.stdout;

console.log = (d) => {
    let date = new Date();
    let month = date.getMonth() + 1;
    let fileName = './log/' + date.getFullYear() + '-' + month + '-' + date.getDate() +'.log';
    if (!fs.existsSync(fileName)) {
        log_file = fs.createWriteStream(fileName, {flags: 'w'});
        log_file.write(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '\t' + util.format(d) + '\r\n');
    }
    else {
        log_file = fs.appendFileSync(fileName, date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '\t' + util.format(d) + '\r\n');
    }
    log_stdout.write(util.format(d) + '\n');
};

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);


app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.all('/api/v1/*', [require('./app/auth/validateRequest')]);

app.use('/api', require('./routes/index'));

// If no route is matched by now, it must be a 404
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    console.log(404, 'Not found');
    next(err);
});

// Start the server
app.listen(port);
console.log('App started on http://localhost:' + port);
