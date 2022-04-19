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
      required: true,
    },
    genre: {
      type: String,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
    },
    album: {
      type: String,
      required: true,
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
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NFT", NFTSchema);
