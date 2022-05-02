const Pass = require("../models/BackstagePass");
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

const createBackstagePass = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const newPass = new Pass({
        ...req.body,
        ownerId: userID,
      });
      try {
        const savedPass = await newPass.save();
        const result = {
          status_code: 200,
          status_msg: `Backstage Pass has been created`,
          data: savedPass,
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

const getUserBackstagePass = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const passNFT = await Pass.findOne({ ownerId: req.params.id });
        if (passNFT) {
          const result = {
            status_code: 200,
            status_msg: `Backstage Pass NFT fetched`,
            data: passNFT,
          };

          res.status(200).json(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `Backstage Pass does not exist`,
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
  createBackstagePass,
  getUserBackstagePass,
};
