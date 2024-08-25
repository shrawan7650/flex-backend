const mongoose = require("mongoose");

const userNotificationSchema = new mongoose.Schema(
  {
    messageTitle: {
      type: String,
      default: "New job posted",
    },
    messageContent: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ['read', 'unread'],
      default: 'unread',
    },
  },
  { timestamps: true }
);

const UserNotification = mongoose.model("UserNotification", userNotificationSchema);

module.exports = UserNotification;
