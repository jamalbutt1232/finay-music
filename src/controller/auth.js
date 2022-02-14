const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    // Check if a user already exists
    await User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        const result = {
          status_code: 500,
          status_msg: `This user is already registered with ${req.body.email} e-mail`,
        };
        res.status(500).send(result);
      }
    });

    if (req.body.password === req.body.confirmpassword) {
      //   generate new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      // create new user
      const newUser = new User({
        email: req.body.email,
        password: hashedPassword,
      });
      // save user and response
      const user = await newUser.save();
      const result = {
        status_code: 200,
        status_msg: "User successfully registered",
        data: user,
      };
      return res.status(200).send(result);
    } else {
      const result = {
        status_code: 500,
        status_msg: "Both password fields does not match",
      };
      return res.status(500).send(result);
    }
  } catch (err) {
    console.log("SIGNUP ERROR", err)
    // const result = {
    //   status_code: 500,
    //   status_msg: `This user is already registered with ${req.body.email} e-mail`,
    // };
    return res.status(500).send("UNKNOWN ERROR");
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    const userNotFound = {
      status_code: 404,
      status_msg: "User not found",
    };
    !user && res.status(404).send(userNotFound);

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    const incorrectPassword = {
      status_code: 400,
      status_msg: "Password Incorrect",
    };
    !validPassword && res.status(400).send(incorrectPassword);

    const auth_token = jwt.sign({ _id: user._id }, "adasddad3rerfsdsfd");
    // res.header("auth-token", token).send(token);

    // token field, message and status code
    const result = {
      token: auth_token,
      status_code: 200,
      status_msg: "User logged in successfully",
    };

    return res.status(200).send(result);
  } catch (err) {
    const result = {
      status_code: 500,
      status_msg: "Something went wrong",
    };

    return res.status(500).send(result);
  }
};

module.exports = {
  register,
  login,
};
