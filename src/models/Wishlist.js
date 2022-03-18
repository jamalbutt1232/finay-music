const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    nft: {
        type: Object
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
