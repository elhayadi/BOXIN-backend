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

router.post("/broadcast", [auth, admin], async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.post("/service", [auth, ismember], async (req, res) => {
  try {
    const post = new Post(req.body.newpost);
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.get("/group", [auth, canSee], async (req, res) => {
  try {
    const posts = await Post.find({ service: req.query.service })
      .populate("author")
      .populate("service")
      .exec();
    res.send(posts.reverse());
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.get("/all", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const services = _.map(user.servicesMember, "_id");
  const posts = await Post.find({ service: [null, ...services] })
    .populate("author")
    .populate("service")
    .exec();

  res.send(posts.reverse());
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
