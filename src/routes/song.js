const router = require("express").Router();

const { createSong, getSongs } = require("../controller/song");
const verifyToken = require("../private/privateRoute");

router.post("/create_song", verifyToken, createSong);
router.get("/get_songs", verifyToken, getSongs);

module.exports = router;
