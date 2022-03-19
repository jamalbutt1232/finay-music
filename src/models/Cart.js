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
        // quantity: {
        //   type: Number,
        //   required: true,
        //   min: 1,
        //   default: 1,
        // },
        price: {
          type: Number,
        },
        imgFile: {
          type: String,
        },
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
