const router = require("express").Router();
const {
  createCalendarEvent,
  deleteCalendarEvent,
  allCalendarEvent,
} = require("../controller/calendar");
const verifyToken = require("../private/privateRoute");

router.post("/create", verifyToken, createCalendarEvent);
router.delete("/delete", verifyToken, deleteCalendarEvent);
router.get("/allcalendarevents/:id", verifyToken, allCalendarEvent);
module.exports = router;
