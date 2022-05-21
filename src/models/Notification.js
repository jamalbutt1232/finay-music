const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    currentId: {
      type: String,
      required: true,
    },
    // otherId: post.userId,
    otherId: {
      type: String,
      required: true,
    },
    postId: { type: String },
    message: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
