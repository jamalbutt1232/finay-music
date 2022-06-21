const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const NFTSchema = new mongoose.Schema(
  {
    ownerId: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    holders: {
      type: Array,
      default: [],
    },
    price: {
      type: Number,
      required: true,
    },
    productID: {
      type: String,
    },
    genre: {
      type: String,
    },
    totalQuantity: {
      type: Number,
    },
    availableQuantity: {
      type: Number,
    },
    album: {
      type: String,
    },
    song: {
      type: String,
    },
    artist: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
      required: true,
    },
    imgFile: {
      type: String,
      required: true,
    },
    audioFile: {
      type: String,
    },
    type: {
      // Access or Regular
      type: String,
      required: true,
    },
    category: {
      // Song or Event
      type: String,
      required: true,
    },
    eventTime: {
      type: Date,
    },
    eventType: {
      type: String,
    },
    // eventLocation: {
    //   type: String,
    // },
    likes: {
      type: Array,
      default: [],
    },
    reports: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NFT", NFTSchema);
