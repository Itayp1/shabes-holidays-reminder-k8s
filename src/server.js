const conf = require("../server.config");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const logger = (msg) => console.log(msg, new Date());
const express = require("express");
const app = express();

const tasks = require("./services/cronjob");
// Health Check endpoints
app.get("/health", async (req, res) => {
  res.status(200).send({ status: "UP" }).end();
});

// Enable Cross Origin Resource Sharing to all origins by default
app.use(cors());
// Middleware that transforms the raw string of req.body into json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//register other security protections
app.use(helmet());
//register gzip compression
app.use(compression());

/// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger(`message:${err.message || err}`);
  // Any request to this server will get here, and will send an HTTP
  const status = err.status || 500;

  logger(err);
  res.status(status).json({ status: err.message });
});

// tasks.beforeShabesReminder.start();
tasks.msgReminder.start();
app.listen(conf.PORT, () => {
  logger(`Server has started - port ${conf.PORT}`);
});
