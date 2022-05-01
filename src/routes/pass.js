const router = require("express").Router();

const {
  createBackstagePass,
  getUserBackstagePass,
} = require("../controller/pass");
const verifyToken = require("../private/privateRoute");

router.post("/create_pass", verifyToken, createBackstagePass);
router.get("/get_pass/:id", verifyToken, getUserBackstagePass);

module.exports = router;
