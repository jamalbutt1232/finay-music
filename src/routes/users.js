const {
  updateUser,
  deleteUser,
  singleUser,
  followUser,
  unfollowUser,
  allUser,
  currentUser,
  search,
  getFollowers,
  getFollowings,
} = require("../controller/users");
const router = require("express").Router();
const verifyToken = require("../private/privateRoute");

router.put("/updateuser", verifyToken, updateUser);
router.delete("/:id", deleteUser);
router.get("/singleuser/:id", verifyToken, singleUser);
router.put("/follow", verifyToken, followUser);
router.put("/unfollow", verifyToken, unfollowUser);
router.get("/currentuser", verifyToken, currentUser);
router.get("/timeline/allusers", verifyToken, allUser);
router.get("/search", verifyToken, search);
router.get("/getfollowers", verifyToken, getFollowers);
router.get("/getfollowings", verifyToken, getFollowings);
module.exports = router;
