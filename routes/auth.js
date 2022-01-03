const bcrypt = require("bcrypt");
const _ = require("lodash");
const User = require("../models/user");
const express = require("express");
const router = express.Router();

router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ message: "Invalid email or password." });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Invalid email or password." });

  const accessToken = user.generateAuthToken();
  res.header("x-auth-token", accessToken).send({ accessToken, user });
});

router.post("/register", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send({ message: "User already registered." });

    user = new User(req.body);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const accessToken = user.generateAuthToken();
    res
      .header("x-auth-token", accessToken)
      .send({ accessToken, user: _.omit(user, ["password"]) });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

module.exports = router;
