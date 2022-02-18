const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { jwtPrivateKey } = process.env;
const serviceSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    photoURL: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      max: 50,
    },
    leaders: [
      {
        leader: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        time: { type: Date, default: Date.now },
      },
    ],
    demands: [
      {
        member: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        time: { type: Date, default: Date.now },
      },
    ],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("service", serviceSchema);
