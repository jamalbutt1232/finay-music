const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const WishlistSchema = new mongoose.Schema(
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
        productID: {
          type: String,
        },
        price: {
          type: Number,
        },
        imgFile: {
          type: String,
        },
        audioFile: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
