const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const User = require("../models/user");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send(_.omit(user, ["password"]));
});
router.post("/password", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const validPassword = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );
  if (!validPassword)
    return res.status(400).send({ message: "Password incorrect" });

  const salt = await bcrypt.genSalt(10);
  const newpass = await bcrypt.hash(req.body.newPassword, salt);
  await User.findByIdAndUpdate(
    req.user._id,
    { password: newpass },
    {
      new: true,
    }
  );

  res.send(_.omit(user, ["password"]));
});
router.post("/update", auth, async (req, res) => {
  console.log(req.body);
  const user = await User.findById(req.user._id);

  await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  res.send(_.omit(user, ["password"]));
});
module.exports = router;
