const mongoose = require("mongoose");
const Schema = require("mongoose")
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // default role if not specified
    },
    phoneNumber: {
      type: String, // Changed from Number to String to handle various phone formats
      default: null,
      unique: true,
    },
    city: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    avatarUrl:{
      type: String,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    coverLetter: {
      type: String,
      default: null,
    },
    niches: {
      firstNiche: {
        type: String,
        default: null,
      },
      secondNiche: {
        type: String,
        default: null,
      },
      thirdNiche: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
