const express = require("express");
const router = express.Router();
const auth_controllers = require("../controllers/Auth/auth");
const user_controller = require("../controllers/Users/users");
const authToken = require("../helpers/authToken");

router.post("/login", authToken("all"), async (req, res) => {
  try {
    const data = req.body;
    const response = await auth_controllers.login(data.email, data.password);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(401).json("Invalid Login Credentials");
  }
});

router.post("/register", authToken("all"), async (req, res) => {
  try {
    const data = req.body;
    const response = await user_controller.create_user(data);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(401).json("Something went wrong");
  }
});

module.exports = router;
