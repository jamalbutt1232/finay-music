const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const ENV = require("../env");
const nodemailer = require("nodemailer");
const OTP = require("../models/OTP");
const axios = require("axios");
var AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

const REACT_APP_GOOGLE_CLIENT_ID = "440544890779-t01qtuodv65oblka5c54l282d6pklqqq.apps.googleusercontent.com";

const sendMail = (email) => {
  min = 1000;
  max = 9999;
  const random_sequence = Math.floor(Math.random() * (max - min) + min);

  try {
    var Transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      domain: "gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: ENV.EMAIL,
        pass: ENV.PASSWORD,
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
          host: "smtp.gmail.com",
          domain: "gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: ENV.EMAIL,
            pass: ENV.PASSWORD,
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

          const get_response_mail = await axios.post("https://api.getresponse.com/v3/contacts", {
            "campaign": {
              "campaignId": "QmUbJ"
            },
            "email": email
          },{headers: {"X-Auth-Token": "api-key reydyfsjy8j8li6m96fn9ivpdm56e4s6"}});
          
          console.log("get response mail");

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
const sendSMS = async (number, email, res) => {
  try {
    var random = Math.floor(1000 + Math.random() * 99999);
    const YOUR_MESSAGE = `Your verification code is ${random}`;

    AWS_ID = ENV.AWS_ID;
    AWS_SECRET = ENV.AWS_SECRET;
    // Set the parameters
    var params = {
      Message: YOUR_MESSAGE,
      PhoneNumber: number,

      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "subject",
        },
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    };

    var publishTextPromise = new AWS.SNS({
      apiVersion: "2010-03-31",
      accessKeyId: AWS_ID,
      secretAccessKey: AWS_SECRET,
    })
      .publish(params)
      .promise();

    publishTextPromise
      .then(async function (data) {
        const newOTP = new OTP();
        newOTP.code = random;
        newOTP.email = email;
        await newOTP.save();

        const result = {
          status_code: 200,
          twofactor: true,
          status_msg: `Message sent : ${random}`,
        };
        return res.status(200).json(result);
      })
      .catch(function (err) {
        res.end(JSON.stringify({ Error: err }));
      });
  } catch (err) {
    const result = {
      status_code: 500,
      status_msg: `Something went wrong : ${err}`,
    };
    return res.status(500).json(result);
  }
};
const verifySMSLoggedUser = async (req, res) => {
  try {
    let otp = await OTP.find({
      email: req.body.email,
      code: req.body.code,
    });

    if (otp.length != 0) {
      const user = await User.findOne({
        email: req.body.email,
      });
      let auth_token = jwt.sign({ _id: user._id }, ENV.TOKEN_SECRET);
      const result = {
        status_code: 200,
        status_msg: `Successfully verified`,
        token: auth_token,
      };
      return res.status(200).json(result);
    } else {
      const result = {
        status_code: 404,
        status_msg: `Incorrect verification`,
      };
      return res.status(404).json(result);
    }
  } catch (err) {
    const result = {
      status_code: 500,
      status_msg: `Something went wrong`,
    };
    return res.status(500).json(result);
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
          let auth_token = jwt.sign({ _id: user._id }, ENV.TOKEN_SECRET);

          if (!user.twofactor) {
            // token field, message and status code
            const result = {
              token: auth_token,
              status_code: 200,
              twofactor: false,
              status_msg: "User logged in successfully",
            };

            res.status(200).send(result);
          } else {
            sendSMS(user.number, user.email, res);
          }
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
const forgotPasswordMail = async (req, res) => {
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
          host: "smtp.gmail.com",
          domain: "gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: ENV.EMAIL,
            pass: ENV.PASSWORD,
          },
        });
        var mailOptions;
        let sender = "JB";
        mailOptions = {
          from: sender,
          to: email,
          subject: "Forgot password",
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
          status_msg: "Forgot password code sent",
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
// Update pswd
const updateForgotPassword = async (req, res) => {
  const user = await User.find({ email: req.body.email });

  if (user) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const user = await User.findOneAndUpdate(
        { email: req.body.email },
        {
          password: hashedPassword,
        },
        { new: true }
      );
      const result = {
        status_code: 200,
        status_msg: `Password has been updated`,
        data: user,
      };
      res.status(200).send(result);
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `Something went wrong ${err}`,
      };
      return res.status(500).send(result);
    }
  } else {
    return res.status(403).json("You can update only your account");
  }
};

// Google Signin
const googleClient = new OAuth2Client(
  // "440544890779-qv3d23gv8cmg99se14de5d3vh69r047b.apps.googleusercontent.com"
  REACT_APP_GOOGLE_CLIENT_ID
);
const googleAuth = async (req, res) => {
  const { token, user } = req.body;
  try {
    const ticket = await googleClient.getTokenInfo(
      token
    );

    const { sub, aud, azp, email, name, picture } = ticket;
    console.log("CHECK TICKET", sub, user, aud, azp);
    if (
      aud ===
        REACT_APP_GOOGLE_CLIENT_ID
    ) {
      const user = await User.findOne({ email: email });
      if (user) {
        // user exists
        let auth_token = jwt.sign({ _id: user._id }, ENV.TOKEN_SECRET);

        if (!user.twofactor) {
          // token field, message and status code
          const result = {
            token: auth_token,
            email: email,
            status_code: 200,
            twofactor: false,
            status_msg: "User logged in successfully",
          };

          res.status(200).send(result);
        } else {
          sendSMS(user.number, user.email, res);
        }
      } else {
        // create new user
        const newUser = new User({
          name: name,
          email: email,
          profilePicture: picture,
        });

        // save user and responsd
        await newUser.save();
        let auth_token = jwt.sign({ _id: newUser._id }, ENV.TOKEN_SECRET);

        const result = {
          token: auth_token,
          status_code: 200,
          status_msg: "User created successfully",
        };
        res.status(200).send(result);
      }
    } else {
      const result = {
        status_code: 500,
        status_msg: "Something went wrong",
      };

      return res.status(500).send(result);
    }
  } catch (err) {
    console.log("GOOGLE ERROR", err);
    const result = {
      status_code: 500,
      status_msg: "Something went wrong",
    };

    return res.status(500).send(result);
  }
};
// Apple Signin
const jwksClient = require("jwks-rsa");
const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
});
function getAppleSigningKeys(kid) {
  return new Promise((resolve) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        console.log(err);
        resolve(null);
      }
      const signingKey = key.getPublicKey();
      resolve(signingKey);
    });
  });
}
function verifyJWT(json, publicKey) {
  return new Promise((resolve) => {
    jwt.verify(json, publicKey, (err, payload) => {
      if (err) {
        console.log(err);
        return resolve(null);
      }
      resolve(payload);
    });
  });
}
const appleAuth = async (req, res) => {
  const { token } = req.body;
  try {
    const json = jwt.decode(token, { complete: true });
    const kid = json?.header?.kid;

    const appleKey = await getAppleSigningKeys(kid);
    if (!appleKey) {
      console.log("Something went wrong");
      return;
    }
    const payload = await verifyJWT(token, appleKey);
    if (!payload) {
      console.log("Something went wrong");
      return;
    }

    console.log("Sign in with apple succeeded!", payload);
    // payload.sub === user &&
    // if (payload.aud === "org.reactjs.native.example.social-media") {
    // }
    const user = await User.findOne({ email: payload.email });
    if (user) {
      // user exists
      let auth_token = jwt.sign({ _id: user._id }, ENV.TOKEN_SECRET);

      if (!user.twofactor) {
        // token field, message and status code
        const result = {
          token: auth_token,
          status_code: 200,
          twofactor: false,
          status_msg: "User logged in successfully",
        };

        res.status(200).send(result);
      } else {
        sendSMS(user.number, user.email, res);
      }
    } else {
      // create new user
      const newUser = new User({
        email: payload.email,
      });

      // save user and responsd
      await newUser.save();
      let auth_token = jwt.sign({ _id: newUser._id }, ENV.TOKEN_SECRET);

      const result = {
        token: auth_token,
        status_code: 200,
        status_msg: "User created successfully",
      };
      res.status(200).send(result);
    }
  } catch (error) {
    console.log("APPLE ERROR", error);
    const result = {
      status_code: 500,
      status_msg: "Something went wrong",
    };

    return res.status(500).send(result);
  }
};

// Web handling for apple auth
const appleAuthWeb = async (req, res) => {
  // res.status(200).send("Working");
  console.log(">>> body: ", req.body);
  const { id_token } = req.body;

  try {
    const json = jwt.decode(id_token, { complete: true });
    const kid = json?.header?.kid;

    console.log("json: ", json);

    const appleKey = await getAppleSigningKeys(kid);
    if (!appleKey) {
      res.status(400).send("Something went wrong. No Apple key");
    }
    const payload = await verifyJWT(id_token, appleKey);
    if (!payload) {
      res.status(400).send("Something went wrong");
    }

    console.log("Sign in with apple succeeded!", payload);
    // payload.sub === user &&
    // if (payload.aud === "org.reactjs.native.example.social-media") {
    // }
    const user = await User.findOne({ email: payload.email });
    if (user) {
      // user exists
      let auth_token = jwt.sign({ _id: user._id }, ENV.TOKEN_SECRET);

      // token field, message and status code
      const result = {
        token: auth_token,
        status_code: 200,
        twofactor: false,
        status_msg: "User logged in successfully",
      };
      res.redirect(
        303,
        `https://www.finay.com/verify-apple?email=${payload.email}&token=${auth_token}`
      );
      // res
      //   .status(200)
      //   .send(`https://www.finay.com/app?user=${JSON.stringify(auth_token)}`);
      // if (!user.twofactor) {
      // } else {
      //   sendSMS(user.number, user.email, res);
      // }
    } else {
      // create new user
      const newUser = new User({
        email: payload.email,
      });

      // save user and responsd
      await newUser.save();
      let auth_token = jwt.sign({ _id: newUser._id }, ENV.TOKEN_SECRET);

      const result = {
        token: auth_token,
        status_code: 200,
        status_msg: "User created successfully",
      };

      res.redirect(
        303,
        `https://www.finay.com/verify-apple?email=${payload.email}&token=${auth_token}`
      );

      // res
      //   .status(200)
      //   .send(`https://www.finay.com/app?user=${JSON.stringify(auth_token)}`);
      // res.redirect(
      //   303,
      //   `https://www.finay.com/app?user=${JSON.stringify(result)}`
      // );
    }
  } catch (error) {
    console.log("APPLE ERROR", error);
    const result = {
      status_code: 400,
      status_msg: "Something went wrong",
    };
    // res
    //   .status(500)
    //   .send(`https://www.finay.com?user=${JSON.stringify(result)}`);
    res.redirect(
      400,
      `https://www.finay.com/verify-apple?results=${JSON.stringify(result)}`
    );
  }
};

module.exports = {
  register,
  login,
  verifyMAIL,
  sendMailAgain,
  appleAuth,
  appleAuthWeb,
  verifySMSLoggedUser,
  googleAuth,
  forgotPasswordMail,
  updateForgotPassword,
};
