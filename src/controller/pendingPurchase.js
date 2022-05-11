const Pending = require("../models/PendingPurchase");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
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

const deActiveStatusInner = async (uid) => {
  try {
    const user = await User.findById(uid);
    const status = user.deactive;
    return status;
  } catch (err) {
    return `deActiveStatusInner Issue : ${err}`;
  }
};
const createPendingPurchase = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const newPending = new Pending({
        buyerID: userID,
        ...req.body,
      });
      try {
        const savedPending = await newPending.save();
        const result = {
          status_code: 200,
          status_msg: `Pending purchase has been created`,
          data: savedPending,
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
      const result = {
        status_code: 403,
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);
    }
  }
};

const getUserPendingPurchase = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const pending = await Pending.findOne({ buyerID: userID });
      let result;
      if (pending) {
        result = {
          status_code: 200,
          status_msg: `Pending Purchase fetched`,
          data: pending,
        };
        res.status(200).json(result);
      } else {
        result = {
          status_code: 404,
          status_msg: `No Pending Purchase`,
          data: [],
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
  }
};
const deleteUserPendingPurchase = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const pending = await Pending.deleteOne({ buyerID: userID });
      let result;
      if (pending.deletedCount === 1) {
        result = {
          status_code: 200,
          status_msg: `Pending Purchase deleted`,
          data: pending,
        };
        res.status(200).json(result);
      } else {
        result = {
          status_code: 404,
          status_msg: `No Pending Purchase found`,
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
  }
};

module.exports = {
  createPendingPurchase,
  getUserPendingPurchase,
  deleteUserPendingPurchase,
};
