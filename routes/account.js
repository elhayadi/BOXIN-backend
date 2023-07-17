const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
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
   User.findOne({
    where: { _id: req.user._id },
    include: [
      {
        model: Service,
        as: "services",
        // where: { displayName: { [Op.not]: "general" } },
      },
      {
        model: Post,
        as: "saves",
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
      { model: Service, as: "requests" },
    ],
  })
    .then((user) => {
      if (!user) {
        res.send({
          user: null,
        });
      }
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
          requests: user.requests,
          services: user.services,
          saves: user.saves,
        },
      });
    })
    .catch((err) => {
      res.send({
        user: null,
        message: err.message,
      });
    });
});
router.post("/links", auth, async (req, res) => {
  console.log(req.body);
  console.log(req.query);
  User.findOne({
    where: { _id: req.user._id },
  })
    .then(async (user) => {
      if (!user)
        return res.status(400).json({ message: "Utilisateur Introuvable" });

      user.set({
        facebookLink: req.body.facebookLink,
        instagramLink: req.body.instagramLink,
        linkedinLink: req.body.linkedinLink,
        twitterLink: req.body.twitterLink,
      });

      await user.save();

      res.send(_.omit(user, ["password"]));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });
});
router.post("/password", auth, async (req, res) => {
  User.findOne({
    where: { _id: req.user._id },
  })
    .then(async (user) => {
      if (!user)
        return res.status(400).json({ message: "Utilisateur Introuvable" });

      const validPassword = await bcrypt.compare(
        req.body.oldPassword,
        user.password
      );
      if (!validPassword)
        return res.status(400).send({ message: "Password incorrect" });

      const salt = await bcrypt.genSalt(10);
      const newpass = await bcrypt.hash(req.body.newPassword, salt);

      user.set({
        password: newpass,
      });

      await user.save();

      res.send(_.omit(user, ["password"]));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });
});
router.put(
  "/update",
  [auth, upload.single("profileImage")],
  async (req, res) => {
    User.findOne({
      where: { _id: req.user._id },
      include: [
        { model: Service, as: "services" },
        { model: Service, as: "requests" },
      ],
    })
      .then(async (user) => {
        if (!user)
          return res.status(400).json({ message: "Utilisateur Introuvable" });
        if (req.file) {
          user.set({
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
          });
        } else {
          user.set({
            displayName: req.body.displayName,
            phoneNumber: req.body.phoneNumber,
            country: req.body.country,
            address: req.body.address,
            state: req.body.state,
            city: req.body.city,
            zipCode: req.body.zipCode,
            about: req.body.about,
            fonction: req.body.fonction,
          });
        }

        await user.save();

        res.send(user);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ message: "Internal server error" });
      });
  }
);
module.exports = router;
