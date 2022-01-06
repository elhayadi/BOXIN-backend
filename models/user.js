const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { jwtPrivateKey } = process.env;
const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    photoURL: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: Number,
      min: 8,
    },
    country: {
      type: String,
      max: 50,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
      max: 50,
    },
    zipCode: {
      type: Number,
      max: 10,
    },
    about: {
      type: String,
      max: 50,
    },
    fonction: {
      type: String,
      max: 50,
      default: "",
    },
    services: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      default: "pending",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    token: { type: String },
    role: {
      type: String,
      default: "simpleUser",
    },
  },
  { timestamps: true, strict: false }
);
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, role: this.role }, jwtPrivateKey, {
    expiresIn: "2h",
  });
  return token;
};
module.exports = mongoose.model("user", userSchema);
