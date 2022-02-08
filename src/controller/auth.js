const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    //   generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // create new user
    const newUser = new User({
      usnerame: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    // save user and responsd
    const user = await newUser.save();
    const result = {
      status_code: 200,
      status_msg: "User successfully registered",
      data: user,
    };
    res.status(200).send(result);
  } catch (err) {
    const result = {
      status_code: 500,
      status_msg: `This user is already registered with ${req.body.email} e-mail`,
    };
    res.status(500).send(result);
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    const notFresult = {
      status_code: 404,
      status_msg: "User not found",
    };
    !user && res.status(404).send(notFresult);

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    const Incorrectresult = {
      status_code: 400,
      status_msg: "Password Incorrect",
    };
    !validPassword && res.status(400).send(Incorrectresult);

    const auth_token = jwt.sign({ _id: user._id }, "adasddad3rerfsdsfd");
    // res.header("auth-token", token).send(token);

    // token field, message and status code
    const result = {
      token: auth_token,
      status_code: 200,
      status_msg: "User logged in successfully",
    };

    res.status(200).send(result);
  } catch (err) {
    const result = {
      status_code: 500,
      status_msg: err,
    };

    res.status(500).send(result);
  }
};

module.exports = {
  register,
  login,
};
