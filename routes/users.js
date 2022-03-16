const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send({ message: "User already registered." });
    cb(null, "./uploads/avatars/");
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + ".jpg");
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === ".png" &&
    file.mimetype === ".jpg" &&
    file.mimetype === ".gif" &&
    file.mimetype === ".jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
});
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

router.put(
  "/add",
  [auth, admin, upload.single("profileImage")],
  async (req, res) => {
    console.log("add admin");
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send({ message: "User already registered." });

    var photo = "";
    if (req.file) {
      photo = req.file.path;
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    user = await new User({
      email: req.body.email,
      displayName: req.body.displayName,
      status: "active",
      role: "admin",
      password: password,
      photoURL: photo,
      phoneNumber: req.body.phoneNumber,
      fonction: req.body.fonction,
    });
    await user.save();

    res.send(_.omit(user, ["password"]));
  }
);

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
