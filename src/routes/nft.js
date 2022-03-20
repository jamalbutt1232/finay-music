const router = require("express").Router();

const { createAsset, getAccessNFT, getRegularNFT } = require("../controller/nft");
const verifyToken = require("../private/privateRoute");

router.post("/create_asset", verifyToken, createAsset);
router.get("/get_access_nft", verifyToken, getAccessNFT);
router.get("/get_regular_nft", verifyToken, getRegularNFT);

module.exports = router;
