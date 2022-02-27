const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ENV = require("../env");
const Calendar = require("../models/Calendar");

// GET USER ID
const getUserID = (req, res) => {
  let uid = undefined;
  jwt.verify(req.token, ENV.TOKEN_SECRET, function (err, data) {
    if (err) {
      const result = {
        status_code: 403,
        status_msg: `Invalid token :${err}`,
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
const createCalendarEvent = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      let start = req.body.starttime;

      //   const newCalendarEvent = new Calendar(req.body);
      //   newCalendarEvent.userId = userID;
      try {
        var start_date = start.split("/", 3);

        console.log("day : ", start_date[1]);

        // const savedCalendarEvent = await newCalendarEvent.save();

        // const result = {
        //   status_code: 200,
        //   status_msg: `Calpliendar event has been created`,
        //   data: savedCalendarEvent,
        // };

        res.status(200).json("there");
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
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);
    }
  }
};

module.exports = {
  createCalendarEvent,
};
