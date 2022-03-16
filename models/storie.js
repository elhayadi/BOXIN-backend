const mongoose = require("mongoose");
const storieSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    media: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: true,
    },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    due: {
      type: String,
      default: "day",
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("storie", storieSchema);
