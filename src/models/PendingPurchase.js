const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const PendingSchema = new mongoose.Schema(
  {
    buyerID: {
      type: ObjectID,
      ref: "User",
      required: true,
    },
    itemId: {
      type: ObjectID,
      ref: "NFT",
    },
    price: {
      type: Number,
    },
    productID: {
      type: String,
    },
    genre: {
      type: String,
    },
    album: {
      type: String,
    },
    song: {
      type: String,
    },
    artist: {
      type: String,
    },
    desc: {
      type: String,
    },
    imgFile: {
      type: String,
    },
    audioFile: {
      type: String,
    },
    category: {
      // Song or Event or subscriber
      type: String,
    },
    eventTime: {
      type: Date,
    },
    eventType: {
      type: String,
    },
    subscribeID: {
      type: ObjectID,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pending", PendingSchema);
