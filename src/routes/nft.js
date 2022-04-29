const router = require("express").Router();

const {
  createAsset,
  updateAsset,
  likeNFT,
  //
  getRegularSongNFT,
  getAccessSongNFT,
  getUserRegularSongNFT,
  getUserAccessSongNFT,
  //
  getRegularEventNFT,
  getAccessEventNFT,
  getUserRegularEventNFT,
  getUserAccessEventNFT,
} = require("../controller/nft");
const verifyToken = require("../private/privateRoute");

router.post("/create_asset", verifyToken, createAsset);
router.put("/update_nft", verifyToken, updateAsset);
router.put("/likenft", verifyToken, likeNFT);
//
router.get("/regular_song_nft", verifyToken, getRegularSongNFT);
router.get("/access_song_nft", verifyToken, getAccessSongNFT);
router.get("/regular_song_nft_user/:id", verifyToken, getUserRegularSongNFT);
router.get("/access_song_nft_user/:id", verifyToken, getUserAccessSongNFT);
//
router.get("/regular_event_nft", verifyToken, getRegularEventNFT);
router.get("/access_event_nft", verifyToken, getAccessEventNFT);
router.get("/regular_event_nft_user/:id", verifyToken, getUserRegularEventNFT);
router.get("/access_event_nft_user/:id", verifyToken, getUserAccessEventNFT);

module.exports = router;
