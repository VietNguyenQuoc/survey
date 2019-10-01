const express = require('express');
const app = express();
require('express-async-errors');
const winston = require('winston');

require('./startups/logging');
require('./startups/db');
require('./startups/routes')(app);

winston.warn("Hello");
PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });

module.exports.server = server;
module.exports.app = app;



