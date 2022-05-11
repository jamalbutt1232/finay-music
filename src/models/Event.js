const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const EventsSchema = new mongoose.Schema(
  {
    ownerId: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    orgOwnerId: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    itemId: {
      type: ObjectID,
      ref: "NFT",
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
    eventTime: {
      type: Date,
    },
    eventType: {
      type: String,
    },
    // eventLocation: {
    //   type: String,
    // },
    genre: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Events", EventsSchema);
