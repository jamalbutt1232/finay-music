const router = require("express").Router();

const { saveReceipt } = require("../controller/receipt");
const verifyToken = require("../private/privateRoute");

router.post("/save_receipt", verifyToken, saveReceipt);

module.exports = router;
