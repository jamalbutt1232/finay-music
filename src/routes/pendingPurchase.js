const router = require("express").Router();

const {
  createPendingPurchase,
  getUserPendingPurchase,
  deleteUserPendingPurchase,
} = require("../controller/pendingPurchase");
const verifyToken = require("../private/privateRoute");

router.post("/create_pending", verifyToken, createPendingPurchase);
router.get("/get_pending", verifyToken, getUserPendingPurchase);
router.delete("/delete_pending", verifyToken, deleteUserPendingPurchase);

module.exports = router;
