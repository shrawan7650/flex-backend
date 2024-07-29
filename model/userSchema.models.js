const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      required: true,
      type: String,
      unique: true,
    },
    email: {
      required: true,
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      default:null,
    },
    password: {
      required: true,
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    collageName: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: Number,
      default: null,
    },
    githubLink: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    image: {
      type: String,
    },
    bio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bio",
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
