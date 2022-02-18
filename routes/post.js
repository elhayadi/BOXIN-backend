const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const Service = require("../models/service");
const User = require("../models/user");
const Post = require("../models/post");
const express = require("express");
const service = require("../models/service");
const isleader = require("../middleware/isleader");
const ismember = require("../middleware/ismember");
const canSee = require("../middleware/canSee");
const router = express.Router();
const multer = require("multer");
const { uuid } = require("uuidv4");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.body);
    if (req.body.isImage) {
      cb(null, "./uploads/images/");
    } else {
      cb(null, "./uploads/files/");
    }
  },
  filename: function (req, file, cb) {
    cb(null, uuid() + ".jpg");
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
router.post(
  "/broadcast",
  [auth, admin],
  upload.array("media"),
  async (req, res) => {
    try {
      console.log(req.files);
      console.log(req.body);
      const post = new Post();
      post.message = req.body.message;
      post.author = req.user._id;
      if (req.body.isSurvey === "true") {
        post.isSurvey = req.body.isSurvey;
        post.choices = JSON.parse(req.body.choices);
      }
      post.isImage = req.body.isImage;
      post.isFile = req.body.isFile;
      post.media = req.files;
      await post.save();
      res.send(post);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Internal server error" });
    }
  }
);
router.post(
  "/service",
  [auth, ismember],
  upload.array("media"),
  async (req, res) => {
    try {
      console.log(req.files);
      console.log(req.body);
      const post = new Post();
      post.message = req.body.message;
      post.author = req.user._id;
      if (req.body.isSurvey === "true") {
        post.isSurvey = req.body.isSurvey;
        post.choices = JSON.parse(req.body.choices);
      }
      post.isImage = req.body.isImage;
      post.isFile = req.body.isFile;
      post.media = req.files;
      post.service = await Service.findById(req.body.service);
      console.log(post);
      await post.save();
      res.send(post);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Internal server error" });
    }
  }
);
router.get("/group", [auth, canSee], async (req, res) => {
  try {
    const posts = await Post.find({ service: req.query.service })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("author")
      .populate("personLikes")
      .populate("personAnswers.user")
      .populate("comments.author")
      .populate("service")
      .exec();
    res.send(posts.reverse());
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

router.get("/all", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const services = await _.map(user.servicesMember, "_id");
  const posts = await Post.find({ service: [null, ...services] })
    .populate("author")
    .populate("personLikes")
    .populate("personAnswers.user")
    .populate("comments.author")
    .populate("service")
    .sort({ createdAt: -1 })
    .limit(10);

  res.send(posts);
});
router.get("/more", auth, async (req, res) => {
  try {
    console.log(req.query.step);
    const user = await User.findById(req.user._id);
    const services = await _.map(user.servicesMember, "_id");
    const posts = await Post.find({ service: [null, ...services] })
      .populate("author")
      .populate("personLikes")
      .populate("personAnswers.user")
      .populate("comments.author")
      .populate("service")
      .sort({ createdAt: -1 })
      .limit(req.query.step);
    Post.count(function (err, count) {
      if (err) console.log(err);
      else {
        if (posts.length === count) {
          return res.send({ posts, hasMore: false });
        }
        console.log("Count is", count);
        res.send({ posts, hasMore: true });
      }
    });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

router.post("/survey", [auth], async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.body.post);
    const index = await _.findIndex(post.choices, { id: req.body.indice });
    console.log(index);
    // Replace item at index using native splice
    let newchoices = [];
    await post.choices.map((item) => {
      if (item.id === req.body.indice) {
        const tmp = {
          id: item.id,
          option: item.option,
          score: item.score + 1,
        };
        newchoices.push(tmp);
      } else {
        newchoices.push(item);
      }
    });
    console.log(newchoices);
    await Post.findByIdAndUpdate(req.body.post, {
      $set: {
        choices: newchoices,
      },
    });
    post.personAnswers.push({ user, answer: req.body.indice });
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

router.post("/like", [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.body._id);
    post.personLikes.push(user);
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.post("/unlike", [auth], async (req, res) => {
  try {
    console.log(req.body._id);
    const user = await User.findById(req.user._id);
    const post = await Post.findByIdAndUpdate(req.body._id, {
      $pull: { personLikes: user._id },
    });

    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.post("/comment", [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.body.post._id);
    post.comments.push({ author: user, message: req.body.message });
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
// --------------- LEADERS -----------------------
const CheckExist = async (members, _id) => {
  let result = false;
  const response = _.find(members, ["_id", _id]);
  if (response) {
    result = true;
  }
  return result;
};

module.exports = router;
