const mongoose = require("mongoose");

const notificationModelAdmin = new mongoose.Schema(
  {
    messageTitle: {
      type: String,
      default: "New application received",
    },
    messageContent: {
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ['read', 'unread'],
      default: 'unread'
    }
  },
  { timestamps: true }
);

const AdminMessage = mongoose.model("AdminNotification", notificationModelAdmin);

module.exports = AdminMessage;
