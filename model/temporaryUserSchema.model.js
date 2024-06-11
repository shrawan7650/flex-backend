const mongoose = require('mongoose');

const temporaryUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '5m' } // TTL index to expire documents after 5 minutes
});

const TemporaryUser = mongoose.model('TemporaryUser', temporaryUserSchema);

module.exports = TemporaryUser;

