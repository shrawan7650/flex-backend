const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: { expires: '5m' } } // TTL index
});

const Otp = mongoose.model('forgotOtp', otpSchema);

module.exports = Otp;
