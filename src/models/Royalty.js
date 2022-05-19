const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;

const RoyaltySchema = new mongoose.Schema(
  {
    nft_id: {
      type: ObjectID,
      required: true,
      ref: "NFT",
    },
    userId: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    price: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    subsq_sales_per: {
      type: String,
    },
    royalties: [
      {
        user_name: { type: String, required: true },
        percentage: { type: String, required: true },
        job: { type: String, required: true },
        paypal: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Royalty", RoyaltySchema);
