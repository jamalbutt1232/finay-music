const router = require("express").Router();
const {
  create_a_post,
  updatePost,
  deletePost,
  likePost,
  allPost,
  singlePost,
  singleuserpost,
} = require("../controller/posts");
const verifyToken = require("../private/privateRoute");

router.post("/", verifyToken, create_a_post);
router.put("/updatepost", verifyToken, updatePost);
router.delete("/deletepost", verifyToken, deletePost);
router.put("/like", verifyToken, likePost);
router.get("/timeline/all", verifyToken, allPost);
router.get("/singlepost", verifyToken, singlePost);
router.get("/singleuserpost", verifyToken, singleuserpost);

module.exports = router;
