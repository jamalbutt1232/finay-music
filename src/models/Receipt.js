const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const ReceiptSchema = new mongoose.Schema(
  {
    userID: {
      type: ObjectID,
      required: true,
      ref: "User",
    },
    app: {
      type: String,
    },
    environment: {
      type: String,
    },
    productID: {
      type: String,
      required: true,
    },
    txID: {
      type: String,
      required: true,
    },
    validationRes: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", ReceiptSchema);
