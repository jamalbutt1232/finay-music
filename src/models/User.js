const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },

    name: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    personalSite: {
      type: String,
      default: "",
    },
    customURL: {
      type: String,
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      max: 300,
      default: "",
    },
    experience: {
      type: String,
      max: 100,
      default: "",
    },
    socialMediaLinks: {
      type: Array,
      default: [],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    location: {
      type: Object,
      default: undefined,
    },
    lastOnlineTimestamp: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);