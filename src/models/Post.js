const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
    },
    file: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    type: {
      type: String,
      required: true,
    },
    flag: {
      type: Array,
      default: [],
    },
    shared: {
      type: Array,
      default: [],
    },
    author: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
