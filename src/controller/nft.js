const NFT = require("../models/NFT");
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
const createAsset = async (req, res) => {
  console.log("Came to createAsset");
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const newNFT = new NFT({
        ...req.body,
        ownerId: userID,
      });
      try {
        const savedNFT = await newNFT.save();
        const result = {
          status_code: 200,
          status_msg: `NFT asset has been created`,
          data: savedNFT,
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
const updateAsset = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const { itemId } = req.body;
      const item = await NFT.findOne({ itemId });

      try {
        const updatedNFT = await NFT.findByIdAndUpdate(
          itemId,
          {
            $set: { availableQuantity: item.availableQuantity - 1 },
          },
          { new: true }
        );
        const result = {
          status_code: 200,
          status_msg: `NFT asset has been updated`,
          data: updatedNFT,
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

const getAccessNFT = async (req, res) => {
  console.log("Came to getAccessNFT ");
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const accessNFTs = await NFT.find({
        $and: [{ type: "access" }, { ownerId: { $ne: userID } }],
      });

      const result = {
        status_code: 200,
        status_msg: `Access NFTs fetched`,
        data: accessNFTs,
      };

      res.status(200).json(result);
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `Something went wrong`,
      };

      res.status(500).json(result);
    }
  }
};
const getUserAccessNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const accessNFTs = await NFT.find({
        $and: [{ type: "access" }, { ownerId: { $eq: req.params.userID } }],
      });

      const result = {
        status_code: 200,
        status_msg: `User's Access NFTs fetched`,
        data: accessNFTs,
      };

      res.status(200).json(result);
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `Something went wrong`,
      };

      res.status(500).json(result);
    }
  }
};
const getRegularNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const regularNFTs = await NFT.find({
        $and: [{ type: "regular" }, { ownerId: { $ne: userID } }],
      });

      const result = {
        status_code: 200,
        status_msg: `Regular NFTs fetched`,
        data: regularNFTs,
      };

      res.status(200).json(result);
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `Something went wrong`,
      };

      res.status(500).json(result);
    }
  }
};
const getUserRegularNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const regularNFTs = await NFT.find({
        $and: [{ type: "regular" }, { ownerId: { $eq: req.params.userID } }],
      });

      const result = {
        status_code: 200,
        status_msg: `User's Regular NFTs fetched`,
        data: regularNFTs,
      };

      res.status(200).json(result);
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
  createAsset,
  getAccessNFT,
  getUserAccessNFT,
  getRegularNFT,
  getUserRegularNFT,
  updateAsset
};
