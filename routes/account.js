const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const User = require("../models/user");
const Service = require("../models/service");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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
  const user = await User.findById(req.user._id);

  const result = await Service.find({ _id: { $in: user.servicesLeader } });
  const members = await Service.find({ _id: { $in: user.servicesMember } });
  res.send({
    user: _.omit(user, ["password"]),
    services: result,
    servicesMember: members,
  });
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
router.put(
  "/update",
  [auth, upload.single("profileImage")],
  async (req, res) => {
    console.log(req.body.displayName);

    const user = await User.findById(req.user._id);

    if (req.file) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          displayName: req.body.displayName,
          phoneNumber: req.body.phoneNumber,
          country: req.body.country,
          address: req.body.address,
          state: req.body.state,
          city: req.body.city,
          zipCode: req.body.zipCode,
          about: req.body.about,
          fonction: req.body.fonction,
          photoURL: req.file.path,
        },
        {
          new: true,
        }
      );
      console.log(req.file);
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          displayName: req.body.displayName,
          phoneNumber: req.body.phoneNumber,
          country: req.body.country,
          address: req.body.address,
          state: req.body.state,
          city: req.body.city,
          zipCode: req.body.zipCode,
          about: req.body.about,
          fonction: req.body.fonction,
        },
        {
          new: true,
        }
      );
    }

    res.send(_.omit(user, ["password"]));
  }
);
module.exports = router;
