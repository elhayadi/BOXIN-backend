const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const _ = require("lodash");
const db = require("../../models");
const User = db.user;
const Service = db.service;
const Op = db.Op;
const Post = db.post;
const Storie = db.storie;
const express = require("express");
const isleader = require("../../middleware/isleader");
const ismember = require("../../middleware/ismember");
const canSee = require("../../middleware/canSee");
const paginate = require("../../middleware/paginate");
const router = express.Router();
const multer = require("multer");
const { uuid } = require("uuidv4");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/stories/");
  },
  filename: function (req, file, cb) {
    cb(null, uuid() + ".jpg");
  },
});

const upload = multer({
  storage: storage,
});
router.post(
  "/broadcast",
  [auth, admin],
  upload.single("media"),
  async (req, res) => {
    User.findOne({
      where: {
        _id: req.user._id,
      },
    })
      .then((user) => {
        Storie.create({
          media: req.file.path,
          due: req.body.due,
          status: true,
        })
          .then((storie) => {
            storie.setAuthor(user);
            res.send(storie);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Status n'est pas créer" });
          });
      })
      .catch((err) => {
        res.status(500).send({ message: "Internal server error" });
      });
  }
);
router.get("/all", [auth], async (req, res) => {
  console.log("getallstories");
  Storie.findAll({
    where: {
      status: true,
    },
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        as: "author",
      },
    ],
  })
    .then((results) => {
      const data = _.chain(results)
        .groupBy("author")
        .map((value, key) => ({ author: value[0].author, stories: value }))
        .value();
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: err.message });
    });
});
router.post("/seen", [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const storie = await Storie.findById(req.body._id);
    storie.seenBy.push(user);
    await storie.save();
    res.send(storie);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
module.exports = router;
