const router = require("express").Router();
const { create_a_otp } = require("../controller/otp");

router.post("/createotp", create_a_otp);

module.exports = router;
