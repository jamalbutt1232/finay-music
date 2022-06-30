const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const CartSchema = new mongoose.Schema(
  {
    ownerID: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    items: [
      {
        itemId: {
          type: ObjectID,
          ref: "NFT",
          required: true,
        },
        artist: {
          type: String,
        },
        album: {
          type: String,
        },
        song: {
          type: String,
        },
        desc: {
          type: String,
        },
        genre: {
          type: String,
        },
        price: {
          type: Number,
        },
        productID: {
          type: String,
        },
        imgFile: {
          type: String,
        },
        audioFile: {
          type: String,
        },
        category: {
          type: String,
        },
        eventTime: {
          type: Date,
        },
        eventType: {
          type: String,
        },
        paypalMerchant: {
          type: String,
        }
      },
    ],
    bill: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
