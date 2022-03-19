const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const NFTSchema = new mongoose.Schema(
  {
    ownerId: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    price: {
      type: Number,
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
    artist: {
      type: String,
    },
    desc: {
      type: String,
      max: 500,
    },
    imgFile: {
      type: String,
    },
    audioFile: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NFT", NFTSchema);
