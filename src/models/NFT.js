const mongoose = require("mongoose");

const NFTSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
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
