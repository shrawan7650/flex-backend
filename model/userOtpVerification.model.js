const mongoose = require('mongoose');

const userOtpVerificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: { expires: '5m' } } // TTL index
});

const userOtpVerificationModel = mongoose.model('userOtpVerification', userOtpVerificationSchema);

module.exports = userOtpVerificationModel;
