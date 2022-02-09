const {
  updateUser,
  deleteUser,
  singleUser,
  followUser,
  unfollowUser,
  allUser,
} = require("../controller/users");
const router = require("express").Router();
const verifyToken = require("../private/privateRoute");

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", singleUser);
router.put("/:id/follow", followUser);
router.put("/:id/unfollow", unfollowUser);
router.get("/timeline/allusers", allUser);
module.exports = router;
