const router = require("express").Router();
const { create_a_post } = require("../controller/posts");
const verifyToken = require("../private/privateRoute");

router.post("/", verifyToken, create_a_post);
// router.post("/login", login);

module.exports = router;

//
