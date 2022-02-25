const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  type: Date,
  expiresInAMin: {
    type: Date,
    default: Date.now,
    expires: 1,
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
