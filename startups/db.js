const mongoose = require('mongoose');
const config = require('config');

const db = config.get("db");
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => { console.log('Connected to MongoDB.') })
  .catch((err) => { throw new Error(err) });
