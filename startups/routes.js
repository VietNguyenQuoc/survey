const express = require('express');
const survey = require('../routes/survey');
const auth = require('../routes/user');
const error = require('../middlewares/error');

module.exports = function (app) {
  app.use(express.json());
  app.use('/api/survey', survey);
  app.use('/api/auth', auth);
  app.use(error);
}