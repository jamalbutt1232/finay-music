const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ENV = require("../env");
const nodemailer = require("nodemailer");

const sendMail = (email) => {
  min = 1000;
  max = 9999;
  const random_sequence = Math.floor(Math.random() * (max - min) + min);

  try {
    var Transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "iamalexbakerdev@gmail.com",
        pass: "OJIoji217",
      },
    });
    var mailOptions;
    let sender = "JB";
    mailOptions = {
      from: sender,
      to: email,
      subject: "Email confirmation",
      html: `Please use the following code to verify account : ${random_sequence}`,
    };

    Transport.sendMail(mailOptions, function (err, response) {
      if (err) {
        console.log("Sending mail error :", err);
      } else {
        console.log("Message sent");
      }
    });
    return random_sequence;
  } catch (err) {
    console.log("ERROR while sending mail. Details: ", err);
    return;
  }
};

const sendMailAgain = async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      // send mail again
      min = 1000;
      max = 9999;
      const random_sequence = Math.floor(Math.random() * (max - min) + min);

      try {
        var Transport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "iamalexbakerdev@gmail.com",
            pass: "OJIoji217",
          },
        });
        var mailOptions;
        let sender = "JB";
        mailOptions = {
          from: sender,
          to: email,
          subject: "Email confirmation",
          html: `Please use the following code to verify account : ${random_sequence}`,
        };

        Transport.sendMail(mailOptions, function (err, response) {
          if (err) {
            console.log("Sending mail error :", err);
          } else {
            console.log("Message sent");
          }
        });
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            $set: { uniqueCode: random_sequence },
          },
          { new: true }
        );
        const result = {
          status_code: 200,
          status_msg: "Code sent again",
          data: updatedUser,
        };
        res.status(200).send(result);
      } catch (err) {
        console.log("ERROR while sending mail. Details: ", err);
      }
    } else {
      const result = {
        status_code: 404,
        status_msg: "Please register",
      };
      res.status(404).send(result);
    }
  } catch (err) {
    const result = {
      status_code: 500,
      status_msg: "Something went wrong",
    };
    res.status(500).send(result);
  }
};

const verifyMAIL = async (req, res) => {
  const code = req.body.code;
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email, uniqueCode: code });
    if (user) {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: { isValid: true },
        },
        { new: true }
      );

      console.log("updatedUser :", updatedUser);
      if (updatedUser != null) {
        if (updatedUser.length != 0) {
          const result = {
            status_code: 200,
            status_msg: "Code verified",
            data: updatedUser,
          };
          res.status(200).send(result);
        }
      } else {
        const result = {
          status_code: 404,
          status_msg: "Code not verified",
        };
        res.status(404).send(result);
      }
    } else {
      const result = {
        status_code: 404,
        status_msg: "Code not verified",
      };
      res.status(404).send(result);
    }
  } catch (err) {
    console.log("Error while verifying :", err);
  }
};

function checkEmail(email) {
  const emailRegexp = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
  return emailRegexp.test(email);
}

const register = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    if (checkEmail(email)) {
      // Check if a user already exists
      const user = await User.findOne({ email: email });
      if (user) {
        const result = {
          status_code: 500,
          status_msg: `This user is already registered with ${email} e-mail`,
        };
        res.status(500).send(result);
      } else {
        if (req.body.password === req.body.confirmpassword) {
          //   generate new password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);
          let code = sendMail(email);
          // create new user
          const newUser = new User({
            name: req.body.name,
            email: email,
            password: hashedPassword,
            uniqueCode: code,
          });

          // save user and responsd
          const user = await newUser.save();
          // const user = "yes yser";
          const result = {
            status_code: 200,
            status_msg: "User successfully registered",
            data: user,
          };
          res.status(200).send(result);
        } else {
          const result = {
            status_code: 500,
            status_msg: "Both password fields does not match",
          };
          res.status(500).send(result);
        }
      }
    } else {
      const result = {
        status_code: 500,
        status_msg: "Email format is incorrect",
      };
      res.status(500).send(result);
    }
  } catch (err) {
    console.log("SIGNUP ERROR", err);

    res.status(500).send("Error :", err);
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    if (checkEmail(email)) {
      const user = await User.findOne({
        email: email,
      });
      const userNotFound = {
        status_code: 404,
        status_msg: "User not found",
      };
      if (!user) {
        res.status(404).send(userNotFound);
      } else {
        const validPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );
        const incorrectPassword = {
          status_code: 400,
          status_msg: "Password Incorrect",
        };
        if (!validPassword) {
          res.status(400).send(incorrectPassword);
        } else {
          const auth_token = jwt.sign({ _id: user._id }, ENV.TOKEN_SECRET);
          // res.header("auth-token", token).send(token);

          // token field, message and status code
          const result = {
            token: auth_token,
            status_code: 200,
            status_msg: "User logged in successfully",
          };

          res.status(200).send(result);
        }
      }
    } else {
      const result = {
        status_code: 500,
        status_msg: "Email format is incorrect",
      };
      res.status(500).send(result);
    }
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
  verifyMAIL,
  sendMailAgain,
};
