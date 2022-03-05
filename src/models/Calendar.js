const mongoose = require("mongoose");

// {
//   "date": "2-2-2022",
//   "events": [
//     {"time": "5:00", "description": "Insult Jamal"},
//     {"time": "13:00", "description": "Beat Jamal's ass"},
//     {"time": "18:00", "description": "Say Jamal is gay"}
//   ]
// }

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
