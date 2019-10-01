const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    maxlength: 255
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      isAdmin: this.isAdmin,
      email: this.email
    },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("user", UserSchema);

function ValidateRegister(user) {
  const schema = Joi.object().keys({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).max(50).required()
  });

  return Joi.validate(user, schema);
}

function ValidateLogin(user) {
  const schema = Joi.object().keys({
    email: Joi.string().max(255).required(),
    password: Joi.string().max(50).required()
  });

  return Joi.validate(user, schema);
}

module.exports.User = User;
module.exports.ValidateRegister = ValidateRegister;
module.exports.ValidateLogin = ValidateLogin;
