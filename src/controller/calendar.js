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
      let tempDate = req.body.date + "T00:00:00.000Z";

      const checkCalendarifExist = await Calendar.find({
        userId: userID,
        date: tempDate,
      });
      console.log("checkCalendarifExist   :", checkCalendarifExist);
      if (checkCalendarifExist.length == 0) {
        console.log("In");
        let newCalendarEvent = new Calendar(req.body);
        newCalendarEvent.userId = userID;
        try {
          const savedCalendarEvent = await newCalendarEvent.save();

          const result = {
            status_code: 200,
            status_msg: `Calendar event has been created`,
            data: savedCalendarEvent,
          };

          res.status(200).json(result);
        } catch (err) {
          const result = {
            status_code: 500,
            status_msg: `Something went wrong :${err}`,
          };

          res.status(500).json(result);
        }
      } else {
        console.log("ELSE");
        let innerObject = {
          events: req.body.events,
        };

        for (i = 0; i < checkCalendarifExist[0].events.length; i++) {
          for (var key in innerObject.events) {
            var t = innerObject.events[key]["time"];
            if (checkCalendarifExist[0].events[i].time == t) {
              checkCalendarifExist[0].events =
                checkCalendarifExist[0].events.filter(function (el) {
                  return el.time != t;
                });
            }
          }
        }
        for (var key in innerObject.events) {
          var my_events = innerObject.events[key];
          checkCalendarifExist[0].events.push(my_events);
        }

        await Calendar.find({
          userId: userID,
          date: tempDate,
        })
          .remove()
          .exec();

        console.log("checkCalendarifExist :", checkCalendarifExist[0].events);
        const cal = new Calendar({
          date: req.body.date,
          events: checkCalendarifExist[0].events,
          userId: userID,
        });
        const c = await cal.save();

        const result = {
          status_code: 200,
          status_msg: `Calendar event has been updated`,
          data: c,
        };

        res.status(200).json(result);
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
        if (calendar == undefined) {
          const result = {
            status_code: 403,
            status_msg: `No such event exist`,
          };

          res.status(403).json(result);
        } else {
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

            res.status(403).json(result);
          }
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
