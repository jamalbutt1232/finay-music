const Cart = require("../models/Cart");
const User = require("../models/User");
const NFT = require("../models/NFT");
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
const createCart = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const { _id } = req.body.nft;
      try {
        let result;
        const user = await User.findById(userID);
        const cart = await Cart.findOne({ ownerID: userID });
        const item = await NFT.findOne({ _id });
        if (!user.cartNFT.includes(_id)) {
          await user.updateOne({ $push: { cartNFT: _id } });
          const price = item.price;
          const artist = item.artist;
          const album = item.album;
          const imgFile = item.imgFile;
          const audioFile = item.audioFile;
          const productID = item.productID
          if (cart) {
            cart.items.push({ itemId: _id, artist, album, price, imgFile, audioFile, productID });
            cart.bill = cart.items.reduce((acc, curr) => {
              return acc + curr.price;
            }, 0);
            await cart.save();
            result = {
              status_code: 200,
              status_msg: `Item added in cart`,
              data: cart,
            };
          } else {
            const newCart = await Cart.create({
              ownerID: userID,
              items: [{ itemId: _id, artist, album, price, imgFile, audioFile, productID }],
              bill: price,
            });
            result = {
              status_code: 200,
              status_msg: `Cart Created and Item added`,
              data: newCart,
            };
          }

          res.status(200).json(result);
        } else {
          const result = {
            status_code: 200,
            status_msg: `Item already exists in cart`,
            data: cart,
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
const deleteCartItem = async (req, res) => {
  const userID = getUserID(req, res);
  const deactive = await deActiveStatusInner(userID);
  if (!deactive) {
    const itemId = req.query.itemId;
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
        res.status(200).json(result);
      } else {
        res.status(404).send("item not found");
      }
    } catch (error) {
      console.log(error);
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
};
const getCart = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const cart = await Cart.findOne({ ownerID: userID });
      let result;
      if (cart && cart.items.length > 0) {
        result = {
          status_code: 200,
          status_msg: `Cart fetched`,
          data: cart,
        };
      } else {
        result = {
          status_code: 200,
          status_msg: `Cart Empty`,
          data: [],
        };
      }

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
  createCart,
  getCart,
  deleteCartItem,
};
