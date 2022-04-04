const router = require("express").Router();

const { createAsset, getAccessNFT, getUserAccessNFT, getRegularNFT, getUserRegularNFT, updateAsset } = require("../controller/nft");
const verifyToken = require("../private/privateRoute");

router.post("/create_asset", verifyToken, createAsset);
router.get("/get_access_nft", verifyToken, getAccessNFT);
router.get("/user_access_nft", verifyToken, getUserAccessNFT);
router.get("/get_regular_nft", verifyToken, getRegularNFT);
router.get("/user_regular_nft", verifyToken, getUserRegularNFT);
router.put("/update_nft", verifyToken, updateAsset);

module.exports = router;
