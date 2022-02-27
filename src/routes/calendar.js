const router = require("express").Router();
const { createCalendarEvent } = require("../controller/calendar");

router.post("/", createCalendarEvent);

module.exports = router;
