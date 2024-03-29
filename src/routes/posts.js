const router = require("express").Router();
const {
  create_a_post,
  updatePost,
  deletePost,
  likePost,
  allPost,
  singlePost,
  singleuserpost,
  uploadPost,
  deleteUploadPost,
  flagPost,
  sharePost,
} = require("../controller/posts");
const verifyToken = require("../private/privateRoute");

const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});
const file_upload = multer({ storage }).single("file");

router.post("/", verifyToken, create_a_post);
router.post("/uploadpost", verifyToken, file_upload, uploadPost);
router.delete("/deleteuploadpost", verifyToken, deleteUploadPost);
router.put("/updatepost", verifyToken, updatePost);
router.delete("/deletepost", verifyToken, deletePost);
router.put("/like", verifyToken, likePost);
router.put("/flagpost", verifyToken, flagPost);
router.get("/timeline/all", verifyToken, allPost);
router.get("/singleuserpost/:id", verifyToken, singleuserpost);
router.get("/singlepost", verifyToken, singlePost);
router.post("/sharepost", verifyToken, sharePost);

module.exports = router;
