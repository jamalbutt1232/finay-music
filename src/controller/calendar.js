const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ENV = require("../env");
const Calendar = require("../models/Calendar");
var moment = require("moment"); // require

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
//create a calendar event
const createCalendarEvent = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      // 2022-12-13T12:50 (YYYY-MM-DDTHH:MM)
      let start_time = req.body.starttime;
      let end_time = req.body.endtime;
      start_time = moment(start_time);
      end_time = moment(end_time);

      let newCalendarEvent = new Calendar(req.body);
      newCalendarEvent.userId = userID;
      try {
        const savedCalendarEvent = await newCalendarEvent.save();

        const result = {
          status_code: 200,
          status_msg: `Calpliendar event has been created`,
          data: savedCalendarEvent,
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
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);
    }
  }
};
//delete a calendar event
const deleteCalendarEvent = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const calendar = await Calendar.findById(req.body.id);
        if (calendar.userId === userID) {
          await calendar.deleteOne();
          const result = {
            status_code: 200,
            status_msg: `Calendar event has been deleted`,
            data: calendar,
          };

          res.status(200).json(result);
        } else {
          const result = {
            status_code: 403,
            status_msg: `You can only delete ur calendar event`,
          };

          res.status(200).json(result);
        }
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
// get all calendar events
const allCalendarEvent = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const allcalendarevents = await Calendar.find({
          userId: req.params.id,
        });
        if (allcalendarevents.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `All calendar event fetched`,
            data: allcalendarevents,
          };

          res.status(200).json(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `You dont have any calendar event`,
          };

          res.status(404).json(result);
        }
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
  deleteCalendarEvent,
  allCalendarEvent,
};
