const Wishlist = require("../models/Wishlist");
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

const addtoWishlist = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const newItem = new Wishlist(req.body);
      newItem.userId = userID;
      try {
        const user = await User.findById(userID);
        if (!user.starredNft.includes(req.body.nft._id)) {
          const savedItem = await newItem.save();
          await user.updateOne({ $push: { starredNft: savedItem.nft._id } });
          const result = {
            status_code: 200,
            status_msg: `Item added to wishlist`,
            data: savedItem,
          };

          res.status(200).json(result);
        } else {
          const result = {
            status_code: 200,
            status_msg: `Item already exists in wishlist`,
            data: {},
          };

          res.status(200).json(result);
        }
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

const removeFromWishlist = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const item = await Wishlist.findOne({ userId: userID });
      try {
        const user = await User.findById(userID);
        await user.updateOne({ $pull: { starredNft: item.nft._id } });
        await item.deleteOne();

        const result = {
          status_code: 200,
          status_msg: `Item removed from wishlist`,
          data: item,
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

const getWishlistItems = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const items = await Wishlist.find({
        userId: userID,
      });

      const result = {
        status_code: 200,
        status_msg: `Wishlist Items fetched`,
        data: items,
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
  addtoWishlist,
  removeFromWishlist,
  getWishlistItems,
};
