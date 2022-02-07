const router = require("express").Router();
const { response } = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  try {
    console.log("BODY PARAMS", req.body)
    //   generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    console.log("Here1")
    // create new user
    const newUser = new User({
      usnerame: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    console.log("Here2")
    // save user and responsd
    const user = await newUser.save();
    console.log("Here3")
    res.status(200);
  } catch (err) {
    console.log("ERROR", err)
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    !user && res.status(404).send("User not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    console.log("here");

    !validPassword && res.status(400).send("Password Incorrect");
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).send(token);
    // res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
