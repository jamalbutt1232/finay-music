const router = require("express").Router();
const { create_a_ad, updateAd, deleteAd, flagAd } = require("../controller/Ad");
const verifyToken = require("../private/privateRoute");

router.post("/", verifyToken, create_a_ad);
router.put("/update", verifyToken, updateAd);
router.put("/flag", verifyToken, flagAd);
router.delete("/delete", verifyToken, deleteAd);

module.exports = router;
