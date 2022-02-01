const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/Users/users");
const authToken = require("../helpers/authToken");
const bcrypt = require("bcrypt");

router.post("/get_users", authToken(["user"]), async (req, res) => {
  const data = req.body;
  const response = await user_controller.read_user(data);
  if (response.length > 0) {
    res.status(200).json({ success: true, message: response });
  } else {
    res.status(200).json({ success: false, message: "No users found" });
  }
});

router.post("/update_user", async (req, res) => {
  const data = req.body;
  const response = await user_controller.update_user(data.user, data.update);
  res.status(200).json(response);
});

router.post("/change_password", authToken(["admin"]), async (req, res) => {
  const user = req.body.user;
  const password = req.body.password;
  const password_hash = await bcrypt.hash(password, 10);

  const response = await user_controller.update_user(
    { _id: user },
    {
      password: password_hash,
    }
  );
  if (response.success) {
    res.status(200).json({ success: true, message: "Password Changed" });
  } else {
    res.status(200).json({ success: false, message: response.message });
  }
});

module.exports = router;
