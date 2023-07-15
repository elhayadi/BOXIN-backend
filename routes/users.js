const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const db = require("../models");
const User = db.user;
const Service = db.service;
const Post = db.post;
const Choice = db.choice;
const Comment = db.comment;
const Media = db.media;
const ReplyComment = db.replyComment;
const Like = db.like;
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
router.get("/profile", auth, async (req, res) => {
  console.log(req.query);
  const user = await User.findOne({
    where: { _id: req.query._id },
    include: [
      { model: Service, as: "services" },
      {
        model: Post,
        as: "posts",
        where: { status: "published" },
        limit: 10,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: Service,
            as: "service",
          },
          {
            model: User,
            as: "author",
          },
          {
            model: Choice,
            as: "choices",
            include: [{ model: User, as: "voters" }],
          },
          {
            model: Comment,
            as: "comments",
            include: [
              { model: User, as: "author" },
              {
                model: ReplyComment,
                as: "replyComment",
                include: [{ model: User, as: "author" }],
              },
            ],
          },
          {
            model: Like,
            as: "likes",
            include: [{ model: User, as: "author" }],
          },
          {
            model: Media,
            as: "media",
          },
        ],
      },
    ],
  });
  res.send({
    user: {
      _id: user._id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      country: user.country,
      address: user.address,
      state: user.state,
      city: user.city,
      zipCode: user.zipCode,
      about: user.about,
      fonction: user.fonction,
      photoURL: user.photoURL,
      facebookLink: user.facebookLink,
      instagramLink: user.instagramLink,
      linkedinLink: user.linkedinLink,
      twitterLink: user.twitterLink,
      posts: user.posts,
      services: user.services,
    },
  });
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
