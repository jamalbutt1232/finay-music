const router = require("express").Router();

const { createEvent, getEvents } = require("../controller/event");
const verifyToken = require("../private/privateRoute");

router.post("/create_event", verifyToken, createEvent);
router.get("/get_events", verifyToken, getEvents);

module.exports = router;
