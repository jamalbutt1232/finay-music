const router = require("express").Router();
const { getNotifications } = require("../controller/notification");
const verifyToken = require("../private/privateRoute");

router.get("/", verifyToken, getNotifications);
// router.post("/login", login);

module.exports = router;

//

//
