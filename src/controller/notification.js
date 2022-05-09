const Post = require("../models/Post");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const ENV = require("../env");
const Notification = require("../models/Notification");

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
// Get user de active status
const deActiveStatusInner = async (uid) => {
  try {
    const user = await User.findById(uid);
    const status = user.deactive;
    return status;
  } catch (err) {
    return `deActiveStatusInner Issue : ${err}`;
  }
};
const getNotifications = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const allNotificaitons = await Notification.find({ otherId: userID });

        // sort descending
        allNotificaitons.sort(function (a, b) {
          var dateA = new Date(a.updatedAt),
            dateB = new Date(b.updatedAt);
          return dateB - dateA;
        });
        if (allNotificaitons.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `All user notifications fetched`,
            data: allNotificaitons,
          };
          res.status(200).send(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `No notification`,
          };
          res.status(404).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong : ${err}`,
        };
        return res.status(500).send(result);
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
  getNotifications,
};
