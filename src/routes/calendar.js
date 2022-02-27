const router = require("express").Router();
const { createCalendarEvent } = require("../controller/calendar");
const verifyToken = require("../private/privateRoute");

router.post("/create", verifyToken, createCalendarEvent);

module.exports = router;
