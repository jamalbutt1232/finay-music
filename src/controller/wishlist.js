const Wishlist = require("../models/Wishlist");
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

const addtoWishlist = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const { _id } = req.body.nft;
      try {
        let result;
        const user = await User.findById(userID);
        const wishlist = await Wishlist.findOne({ ownerID: userID });
        const item = await NFT.findOne({ _id });
        if (!user.starredNft.includes(_id)) {
          await user.updateOne({ $push: { starredNft: _id } });
          const price = item.price;
          const artist = item.artist;
          const album = item.album;
          const imgFile = item.imgFile;
          const audioFile = item.audioFile;
          const productID = item.productID;
          if (wishlist) {
            wishlist.items.push({
              itemId: _id,
              artist,
              album,
              price,
              imgFile,
              audioFile,
              productID,
            });
            await wishlist.save();
            result = {
              status_code: 200,
              status_msg: `Item added in wishlist`,
              data: wishlist,
            };
          } else {
            const newWishlist = await Wishlist.create({
              ownerID: userID,
              items: [
                {
                  itemId: _id,
                  artist,
                  album,
                  price,
                  imgFile,
                  audioFile,
                  productID,
                },
              ],
              bill: price,
            });
            result = {
              status_code: 200,
              status_msg: `Wishlist created and Item added`,
              data: newWishlist,
            };
          }

          res.status(200).json(result);
        } else {
          const result = {
            status_code: 200,
            status_msg: `Item already exists in wishlist`,
            data: wishlist,
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
  const deactive = await deActiveStatusInner(userID);
  if (!deactive) {
    const itemId = req.query.itemId;
    try {
      const user = await User.findById(userID);
      await user.updateOne({ $pull: { starredNft: itemId } });

      let wishlist = await Wishlist.findOne({ ownerID: userID });
      const itemIndex = wishlist.items.findIndex(
        (item) => item.itemId == itemId
      );
      if (itemIndex > -1) {
        wishlist.items.splice(itemIndex, 1);
        wishlist = await wishlist.save();
        result = {
          status_code: 200,
          status_msg: `Item deleted from wishlist`,
          data: wishlist,
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

const getWishlistItems = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const wishlist = await Wishlist.findOne({ ownerID: userID });
      let result;
      if (wishlist && wishlist.items.length > 0) {
        result = {
          status_code: 200,
          status_msg: `Wishlist fetched`,
          data: wishlist,
        };
      } else {
        result = {
          status_code: 200,
          status_msg: `Wishlist Empty`,
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
  addtoWishlist,
  removeFromWishlist,
  getWishlistItems,
};
