require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const config = require("./config/database");
const fs = require("fs");
const util = require("util");

const port = process.env.PORT || 8080;
const app = express();

// File logger — writes every console.log call to a daily log file.
// TODO (step 5): replace with winston/pino.
const log_stdout = process.stdout;
console.log = (...args) => {
    const d = new Date();
    const fileName = `./log/${d.getFullYear()}-${
        d.getMonth() + 1
    }-${d.getDate()}.log`;
    const timestamp = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}\t`;
    const line = timestamp + args.map((a) => util.format(a)).join(" ") + "\r\n";
    fs.appendFileSync(fileName, line);
    log_stdout.write(args.map((a) => util.format(a)).join(" ") + "\n");
};

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

mongoose.connect(config.database);
mongoose.connection.on("error", (err) =>
    console.log("MongoDB connection error:", err.message)
);

require("./config/passport")(passport);

// CORS — restrict CORS_ORIGIN in production via .env
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-type,Accept,X-Access-Token,X-Key,Authorization"
    );
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// JWT auth middleware applied to all protected routes
app.use("/api/v1", require("./app/auth/validateRequest"));

app.use("/api", require("./routes/index"));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, msg: "Not found." });
});

// Central error handler — catches errors thrown from async route handlers (Express 5)
app.use((err, req, res, next) => {
    console.log("Unhandled error:", err.message);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        success: false,
        msg: err.message || "Internal server error.",
    });
});

app.listen(port, () => console.log(`App started on http://localhost:${port}`));
