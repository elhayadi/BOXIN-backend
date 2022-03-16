const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const Service = require("../models/service");
const User = require("../models/user");
const Post = require("../models/post");
const Storie = require("../models/storie");
const express = require("express");
const service = require("../models/service");
const isleader = require("../middleware/isleader");
const ismember = require("../middleware/ismember");
const canSee = require("../middleware/canSee");
const paginate = require("../middleware/paginate");
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
    try {
      const storie = new Storie();
      storie.author = req.user._id;
      storie.media = req.file.path;
      storie.due = req.body.due;
      await storie.save();
      res.send(storie);
    } catch (error) {
      console.log(error);
      res.status(400).send({ message: "Internal server error" });
    }
  }
);
router.get("/all", [auth], async (req, res) => {
  try {
    console.log("getallstories");
    const results = await Storie.find({ status: true })
      .populate("author")
      .exec();

    const data = _.chain(results)
      .groupBy("author")
      .map((value, key) => ({ author: value[0].author, stories: value }))
      .value();
    res.send(data);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
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
