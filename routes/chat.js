const bcrypt = require("bcrypt");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const _ = require("lodash");
const db = require("../../models");
const User = db.user;
const Message = db.message;
const Conversation = db.conversation;
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
    cb(null, "./uploads/chat/");
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
router.get("/conversations", [auth], async (req, res) => {
  let conversations = await Conversation.findAll();
  res.send(conversations);
});
router.get("/search", [auth], async (req, res) => {
  const { query } = req.params;

  User.findAll({
    where: { status: "active", role: "simpleUser" },
  })
    .then((contacts) => {
      let results = contacts;
      if (query) {
        const cleanQuery = query.toLowerCase().trim();
        results = results.filter((contact) =>
          contact.displayName.toLowerCase().includes(cleanQuery)
        );
      }
      res.send({ results });
    })
    .catch((err) => {
      res.send(err.message);
    });
  // Using the _.filter() method
});
router.get("/contacts", [auth], async (req, res) => {
  User.findAll({
    where: { status: "active", role: "simpleUser" },
  })
    .then((contacts) => {
      res.send(contacts);
    })
    .catch((err) => {
      res.send(err.message);
    });
  // Using the _.filter() method
});
router.post("/start", [auth], async (req, res) => {
  Message.findOne({
    where: {
      senderId: [req.user._id, req.body.sender],
      receiverId: [req.user._id, req.body.sender],
    },
  }).then((message) => {
    if (!message) {
        Conversation.create().then(()=>{

        })
    }

    Conversation.findOne({
        where: {
          _id: message.conversationId,
        },
        include: [
          {
            model: User,
            as: "participants",
          },
          {
            model: Message,
            as: "messages",
            include: [
              { model: User, as: "Sender" },
              { model: User, as: "Receiver" },
            ],
          },
        ],
      }).then((conversation) => {
        res.send(conversation);
      });
    
  });
  res.send(conversations);
});
module.exports = router;
