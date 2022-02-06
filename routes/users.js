const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const User = require("../models/user");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const users = await User.find({ role: req.query.role })
    .select("-password")
    .exec();
  res.send(users);
});

router.get("/allUsersByStatus", [auth, admin], async (req, res) => {
  let users = await User.find({ status: req.query.status }).exec();
  // Using the _.filter() method
  users = _.filter(users, function (o) {
    return o.role !== "admin";
  });
  res.send(users);
});

router.post("/validate", [auth, admin], async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.body._id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!user)
    return res.status(300).send("The user with the given ID was not found.");

  res.send(_.omit(user, ["password"]));
});

module.exports = router;
