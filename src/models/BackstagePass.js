const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const PassSchema = new mongoose.Schema(
  {
    ownerId: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    holders: {
      type: Array,
      default: [],
    },
    price: {
      type: Number,
      required: true,
    },
    productID: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pass", PassSchema);
