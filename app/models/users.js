const mongoose = require("mongoose");

const user = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  type: { type: String, required: true, default: "user" },
  status: { type: Boolean, default: true },
  password: { type: String, required: true },
  about: { type: String, required: false },
  displayName: { type: String, required: false },
  website: { type: String, required: false },
  customer_url: { type: String, required: false },
  bio: { type: String, required: false },
  experience: { type: String, required: false },
  social_link_instagram: { type: String, required: false },
  social_link_facebook: { type: String, required: false },
  social_link_twitter: { type: String, required: false },
  phone: { type: String, required: false },
  two_factor: { type: Boolean, required: false, default: false },
  two_factor_secret: { type: Boolean, required: false },
  online_status: { type: Boolean, required: false, default: true },
  follow_request: { type: Boolean, required: false, default: false },
  review_tagged_post: { type: Boolean, required: false, default: false },
  enable_location: { type: Boolean, required: false, default: false },
  email_notifications: { type: Boolean, required: false, default: true },
  permissions: {
    post_view: { type: String, required: false, default: "everyone" },
    media_view: { type: String, required: false, default: "everyone" },
    friendlist_view: { type: String, required: false, default: "everyone" },
    followerlist_view: { type: String, required: false, default: "everyone" },
    contactinfo_view: { type: String, required: false, default: "" },
  },
});

module.exports = mongoose.model("user", user);
