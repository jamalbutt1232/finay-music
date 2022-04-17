const Song = require("../models/Song");
const NFT = require("../models/NFT");
const Cart = require("../models/Cart");
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

const deleteFromCart = async (itemId, userID) => {
  try {
    const user = await User.findById(userID);
    await user.updateOne({ $pull: { cartNFT: itemId } });

    let cart = await Cart.findOne({ ownerID: userID });
    const itemIndex = cart.items.findIndex((item) => item.itemId == itemId);
    if (itemIndex > -1) {
      let item = cart.items[itemIndex];
      cart.bill -= item.price;
      if (cart.bill < 0) {
        cart.bill = 0;
      }
      cart.items.splice(itemIndex, 1);
      cart.bill = cart.items.reduce((acc, curr) => {
        return acc + curr.price;
      }, 0);
      cart = await cart.save();
      result = {
        status_code: 200,
        status_msg: `Item deleted from cart`,
        data: cart,
      };
      return result;
    } else {
      result = {
        status_code: 404,
        status_msg: "item not found",
        data: {},
      };
      return result;
    }
  } catch (error) {
    console.log(error);
    const result = {
      status_code: 500,
      status_msg: `Something went wrong :${error}`,
    };
    return result;
  }
};
const createSong = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const { itemId } = req.body;
      const item = await NFT.findOne({ _id: itemId });
      if (item?.availableQuantity > 0) {
        const newSong = new Song({
          ...req.body,
          ownerId: userID,
          orgOwnerId: item.ownerId
        });
        try {
          const deleteCartRes = await deleteFromCart(itemId, userID);
          console.log("deleteCartRes", deleteCartRes);
          if (
            deleteCartRes.status_code === 200 ||
            deleteCartRes.status_code === 404
          ) {
            const savedSong = await newSong.save();
            console.log("CHOSEN NFT", item)
            await item.updateOne({ $push: { holders: userID } });

            const result = {
              status_code: 200,
              status_msg: `Song has been created`,
              data: savedSong,
            };

            res.status(200).json(result);
          } else {
            const result = {
              status_code: 500,
              status_msg: `Delete from cart error`,
            };

            res.status(500).json(result);
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
          status_code: 404,
          status_msg: `This song is sold out`,
        };

        res.status(404).json(result);
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

const getSongs = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const songs = await Song.find({ ownerId: userID });

      const result = {
        status_code: 200,
        status_msg: `Songs fetched`,
        data: songs,
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
  createSong,
  getSongs,
};
