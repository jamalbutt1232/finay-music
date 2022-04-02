const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const SongsSchema = new mongoose.Schema(
  {
    ownerId: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    itemId: {
      type: ObjectID,
      ref: "NFT",
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
    imgFile: {
      type: String,
      required: true,
    },
    audioFile: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Songs", SongsSchema);
