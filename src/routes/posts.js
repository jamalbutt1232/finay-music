const router = require("express").Router();
const {
  create_a_post,
  updatePost,
  deletePost,
  likePost,
  allPost,
  singlePost,
  singleuserpost,
  create_a_post_v2,
} = require("../controller/posts");
const verifyToken = require("../private/privateRoute");

const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});
const file_upload = multer({ storage }).single("file");

router.post("/", verifyToken, file_upload, create_a_post);
// router.post("/createpost", verifyToken, file_upload, create_a_post_v2);
router.put("/updatepost", verifyToken, updatePost);
router.delete("/deletepost", verifyToken, deletePost);
router.put("/like", verifyToken, likePost);
router.get("/timeline/all", verifyToken, allPost);
router.get("/singlepost", verifyToken, singlePost);
router.get("/singleuserpost/:id", verifyToken, singleuserpost);

module.exports = router;
