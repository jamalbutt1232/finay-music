const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 1500,
      required: true,
    },
    subject: {
      type: String,
      max: 150,
      required: true,
    },
    file: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    flag: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", AdSchema);
