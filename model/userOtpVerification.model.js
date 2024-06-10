const mongoose = require("mongoose");

const userOtpVerificationSchema = new mongoose.Schema(
  { 
    userId:String,
    email: String,
    code: String,
    expireIn: String,
  },
  
  { timestamps: true }
);
module.exports = mongoose.model("userOtpVerificationSchema", userOtpVerificationSchema);