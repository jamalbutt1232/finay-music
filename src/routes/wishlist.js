const router = require("express").Router();

const { addtoWishlist, removeFromWishlist, getWishlistItems } = require("../controller/wishlist");
const verifyToken = require("../private/privateRoute");

router.post("/add_item", verifyToken, addtoWishlist);
router.delete("/delete_item", verifyToken, removeFromWishlist);
router.get("/get_items", verifyToken, getWishlistItems);

module.exports = router;
