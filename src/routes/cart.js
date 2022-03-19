const router = require("express").Router();

const { createCart, getCart, deleteCartItem } = require("../controller/cart");
const verifyToken = require("../private/privateRoute");

router.post("/create_cart", verifyToken, createCart);
router.get("/get_cart", verifyToken, getCart);
router.delete("/delete_cart_item", verifyToken, deleteCartItem);

module.exports = router;
