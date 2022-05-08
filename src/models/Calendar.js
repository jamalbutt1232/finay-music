const mongoose = require("mongoose");

const CalendarSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    events: [
      {
        time: { type: String },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Calendar", CalendarSchema);
