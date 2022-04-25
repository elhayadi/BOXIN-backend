const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const db = require("../models");
const User = db.user;
const Service = db.service;
const Op = db.Op;
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
  const users = await User.findAll({
    where: { role: req.query.role },
  });
  res.send(users);
});

router.get("/allUsersByStatus", [auth, admin], async (req, res) => {
  let users = await User.findAll({
    where: { status: req.query.status },
  });
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
    User.findOne({
      where: {
        email: req.body.email,
      },
    })
      .then(async (user) => {
        if (user)
          return res.status(400).send({ message: "User already registered." });
        var photo = "";
        if (req.file) {
          photo = req.file.path;
        }
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        User.create({
          email: req.body.email,
          displayName: req.body.displayName,
          status: "active",
          role: "admin",
          password: password,
          photoURL: photo,
          phoneNumber: req.body.phoneNumber,
          fonction: req.body.fonction,
        })
          .then((user) => {
            res.send(_.omit(user, ["password"]));
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Email déja utilisé" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ message: "Email déja utilisé" });
      });
  }
);

router.post("/validate", [auth, admin], async (req, res) => {
  User.findOne({
    where: {
      _id: req.body._id,
    },
  })
    .then((user) => {
      if (user) {
        user
          .update({
            status: req.body.status,
          })
          .success(function () {
            res.send(_.omit(user, ["password"]));
          });
      } else {
        return res
          .status(500)
          .send("The user with the given ID was not found.");
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Email déja utilisé" });
    });
});

module.exports = router;
