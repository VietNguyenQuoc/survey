const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User, ValidateLogin, ValidateRegister } = require('../models/user');
const Auth = require('../middlewares/auth');
const Admin = require('../middlewares/admin');
const ValidateObjectId = require('../middlewares/objectid');

router.post('/register', async (req, res) => {
  const { error } = ValidateRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("Email has been registered.");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  user = new User({
    email: req.body.email,
    password: hashedPassword,
  });

  await user.save();

  return res.send(user);
});

router.post('/admin', [Auth, Admin], async (req, res) => {
  const { error } = ValidateRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("Email has been registered.");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  user = new User({
    email: req.body.email,
    password: hashedPassword,
    isAdmin: true
  });

  await user.save();

  return res.send(user);
});

router.post('/login', async (req, res) => {
  const { error } = ValidateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email or password is invalid.");

  const isPasswd = await bcrypt.compare(req.body.password, user.password);
  if (!isPasswd) return res.status(400).send("Email or password is invalid.");

  const token = user.generateAuthToken();

  return res.send(token);
});

router.delete('/admin/:id', [ValidateObjectId, Auth, Admin], async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).send("User is not found.");

  return res.send(user);
});

module.exports = router;

