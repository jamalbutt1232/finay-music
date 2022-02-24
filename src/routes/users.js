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
  deActive,
  deActiveStatus,
  active2f,
  sendSMS,
} = require("../controller/users");
const router = require("express").Router();
const verifyToken = require("../private/privateRoute");

router.put("/updateuser", verifyToken, updateUser);
// router.delete("/:id", deleteUser);
router.get("/singleuser/:id", verifyToken, singleUser);
router.put("/follow", verifyToken, followUser);
router.put("/unfollow", verifyToken, unfollowUser);
router.get("/currentuser", verifyToken, currentUser);
router.get("/timeline/allusers", verifyToken, allUser);
router.get("/search", verifyToken, search);
router.get("/getfollowers/:id", verifyToken, getFollowers);
router.get("/getfollowings/:id", verifyToken, getFollowings);
router.put("/deactive", verifyToken, deActive);
router.get("/deactivestatus", verifyToken, deActiveStatus);
router.put("/twofactor", verifyToken, active2f);
router.get("/sendsms", verifyToken, sendSMS);
module.exports = router;
