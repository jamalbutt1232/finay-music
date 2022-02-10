const {
  updateUser,
  deleteUser,
  singleUser,
  followUser,
  unfollowUser,
  allUser,
  currentUser,
} = require("../controller/users");
const router = require("express").Router();
const verifyToken = require("../private/privateRoute");

router.put("/updateuser", verifyToken, updateUser);
router.delete("/:id", deleteUser);
router.get("/singleuser", verifyToken, singleUser);
router.put("/follow", verifyToken, followUser);
router.get("/currentuser", verifyToken, currentUser);
router.put("/:id/unfollow", unfollowUser);
router.get("/timeline/allusers", verifyToken, allUser);
module.exports = router;
