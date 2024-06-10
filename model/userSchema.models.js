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

    password: {
      required: true,
      type: String,
    },
    verified:{
      type:Boolean,
      default:false
    }
    // confirmpassword: {
    //   required: true,
    //   type: String,
    //   trim: true,
    // },
    // role: {
    //   // required: true,
    //   type: String,
    //   enum: ["user", "admin"],
    // },
    // image: {
    //   type:String
    // },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
