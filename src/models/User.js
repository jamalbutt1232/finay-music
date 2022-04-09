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
    isValid: {
      type: Boolean,
      default: false,
    },
    uniqueCode: {
      type: String,
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
    number: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      max: 100,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isPost: {
      type: String,
      default: "public",
    },
    isMedia: {
      type: String,
      default: "public",
    },
    isFollowers: {
      type: String,
      default: "public",
    },
    isContact: {
      type: String,
      default: "public",
    },
    location: {
      type: Object,
      default: undefined,
    },
    deactive: {
      type: Boolean,
      default: false,
    },
    twofactor: {
      type: Boolean,
      default: false,
    },
    lastOnlineTimestamp: {
      type: String,
    },
    pushToken: {
      type: String,
    },
    badgeCount: {
      type: Number,
    },
    bioType: {
      type: String,
      default: "public",
    },
    followerType: {
      type: String,
      default: "public",
    },
    postType: {
      type: String,
      default: "public",
    },
    algorand: {
      type: Boolean,
      default: false,
    },
    algorandAddress: {
      type: String,
    },
    likedNft: {
      type: Array,
      default: [],
    },
    starredNft: {
      type: Array,
      default: [],
    },
    cartNFT: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
