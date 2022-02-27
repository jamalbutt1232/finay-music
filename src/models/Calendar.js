const mongoose = require("mongoose");

const CalendarSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    // time format will maisam provide?
    starttime: { type: Date, required: true },
    endtime: { type: Date, required: true },
    desc: {
      type: String,
      required: true,
      max: 250,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Calendar", CalendarSchema);
