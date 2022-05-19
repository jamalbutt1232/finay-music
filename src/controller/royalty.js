const Royalty = require("../models/Royalty");
const jwt = require("jsonwebtoken");
const ENV = require("../env");
const User = require("../models/User");

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

const createRoyalty = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      let royalty = new Royalty(req.body);
      royalty.userId = userID;
      try {
        const saveRoyalty = await royalty.save();
        const result = {
          status_code: 200,
          status_msg: `Royalty division successful`,
          data: saveRoyalty,
        };

        res.status(200).json(result);
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong :${err}`,
        };

        res.status(500).json(result);
      }
    }
  }
};
const getRoyaltyDetails = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const royaltyDetails = await Royalty.find({ nft_id: req.params.id });

        if (royaltyDetails.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `Royalty details fetched`,
            data: royaltyDetails,
          };

          res.status(200).json(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `No royalty details present`,
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
  createRoyalty,
  getRoyaltyDetails,
};
