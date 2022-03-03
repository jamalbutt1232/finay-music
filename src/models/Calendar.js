const mongoose = require("mongoose");

const CalendarSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    // time format will maisam provide?
    starttime: { type: Array, required: true, default: [Date] },
    desc: {
      type: Array,
      required: true,
      max: 250,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Calendar", CalendarSchema);
