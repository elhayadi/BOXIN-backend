
const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true
    },
    message: {
      type: String,
      max: 50,
    }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("comment", commentSchema);
