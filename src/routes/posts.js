const router = require("express").Router();
const {
  create_a_post,
  updatePost,
  deletePost,
  likePost,
  allPost,
  singlePost,
} = require("../controller/posts");
const verifyToken = require("../private/privateRoute");

router.post("/", verifyToken, create_a_post);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", likePost);
router.get("/timeline/all", allPost);
router.get("/:id", singlePost);

module.exports = router;
