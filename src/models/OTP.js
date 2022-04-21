const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  type: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "1m",
  },
  code: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("OTP", OTPSchema);
