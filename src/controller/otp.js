const User = require("../models/User");
const OTP = require("../models/OTP");
const ENV = require("../env");

// GET USER ID
const getUserID = (req, res) => {
  let uid = undefined;
  jwt.verify(req.token, ENV.TOKEN_SECRET, function (err, data) {
    if (err) {
      const result = {
        status_code: 403,
        status_msg: `Invalid token`,
      };
      res.status(403).send(result);
    } else {
      uid = data._id;
    }
  });
  return uid;
};

const create_a_otp = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const user = await User.findById(req.body.userId);
      if (!user.deactive) {
        const newComment = new Comment(req.body);
        newComment.userId = userID;
        try {
          const savedComment = await newComment.save();

          const result = {
            status_code: 200,
            status_msg: `Comment has been created`,
            data: savedComment,
          };

          res.status(200).json(result);
        } catch (err) {
          const result = {
            status_code: 500,
            status_msg: `Something went wrong`,
          };

          res.status(500).json(result);
        }
      } else {
        const result = {
          status_code: 403,
          status_msg: `You cannot comment on the post of an unactivated user`,
        };
        res.status(403).send(result);
      }
    } else {
      const result = {
        status_code: 403,
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);
    }
  }
};

module.exports = {
  create_a_otp,
};
