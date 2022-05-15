const router = require("express").Router();

const { createRoyalty, getRoyaltyDetails } = require("../controller/royalty");
const verifyToken = require("../private/privateRoute");

router.post("/", verifyToken, createRoyalty);
router.get("/:id", verifyToken, getRoyaltyDetails);

module.exports = router;
