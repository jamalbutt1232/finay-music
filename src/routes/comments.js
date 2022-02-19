const router = require("express").Router();

const { create_a_comment, getAllComments } = require("../controller/comments");
const verifyToken = require("../private/privateRoute");

router.post("/createcomment", verifyToken, create_a_comment);
router.get("/postcomments/:id", verifyToken, getAllComments);

module.exports = router;
