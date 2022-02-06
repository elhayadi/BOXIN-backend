const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { jwtPrivateKey } = process.env;
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "service" },
    media: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      min: 3,
    },
    isSurvey: {
      type: Boolean,
      default: false,
    },
    choices: {
      type: Array,
      default: [],
    },
    personAnswers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        answer: { type: Number },
        time: { type: Date, default: Date.now },
      },
    ],
    personLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        time: { type: Date, default: Date.now },
        message: { type: String },
      },
    ],
    status: {
      type: String,
      default: "published",
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("post", postSchema);
