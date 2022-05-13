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
      const item = await NFT.findOne({ _id: itemId });
      if (item?.availableQuantity > 0) {
        try {
          const updatedNFT = await NFT.findByIdAndUpdate(itemId, {
            $set: { availableQuantity: item.availableQuantity - 1 },
          });
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
          status_code: 404,
          status_msg: `NFT not available`,
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

// new apis start
const getRegularSongNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const regularSongNFT = await NFT.find({
        $and: [
          { type: "regular" },
          { category: "song" },
          { ownerId: { $ne: userID } },
          { holders: { $ne: userID } },
        ],
      });

      const result = {
        status_code: 200,
        status_msg: `Regular Song NFTs fetched`,
        data: regularSongNFT,
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
const getRegularEventNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const regularEventNFT = await NFT.find({
        $and: [
          { type: "regular" },
          { category: "event" },
          { ownerId: { $ne: userID } },
          { holders: { $ne: userID } },
        ],
      });

      const result = {
        status_code: 200,
        status_msg: `Regular Event NFTs fetched`,
        data: regularEventNFT,
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

const getAccessSongNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const accessSongNFT = await NFT.find({
        $and: [
          { type: "access" },
          { category: "song" },
          { ownerId: { $ne: userID } },
        ],
      });

      const result = {
        status_code: 200,
        status_msg: `Access Song NFTs fetched`,
        data: accessSongNFT,
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
const getAccessEventNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const accessEventNFT = await NFT.find({
        $and: [
          { type: "access" },
          { category: "event" },
          { ownerId: { $ne: userID } },
        ],
      });

      const result = {
        status_code: 200,
        status_msg: `Access Event NFTs fetched`,
        data: accessEventNFT,
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

const getUserRegularSongNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const regularSongNFT = await NFT.find({
        $and: [
          { type: "regular" },
          { category: "song" },
          { ownerId: { $eq: req.params.id } },
        ],
      });

      const result = {
        status_code: 200,
        status_msg: `User Regular Song NFTs fetched`,
        data: regularSongNFT,
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
const getUserRegularEventNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const regularEventNFT = await NFT.find({
        $and: [
          { type: "regular" },
          { category: "event" },
          { ownerId: { $eq: req.params.id } },
        ],
      });

      const result = {
        status_code: 200,
        status_msg: `User Regular Event NFTs fetched`,
        data: regularEventNFT,
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

const getUserAccessSongNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      var flag = false;
      if (req.params.id == userID) {
        flag = true;
      }

      const user = await User.findById(req.params.id);

      let ifSubscriberExists = user.subscribers.includes(userID);

      if (ifSubscriberExists || flag) {
        const accessSongNFT = await NFT.find({
          $and: [
            { type: "access" },
            { category: "song" },
            { ownerId: { $eq: req.params.id } },
          ],
        });

        const result = {
          status_code: 200,
          status_msg: `User Access Song NFTs fetched`,
          data: accessSongNFT,
        };

        res.status(200).json(result);
      } else {
        const result = {
          status_code: 200,
          status_msg: `You need to subscribe to the user`,
          data: [],
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
  }
};
const getUserAccessEventNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      var flag = false;
      if (req.params.id == userID) {
        flag = true;
      }

      const user = await User.findById(req.params.id);

      let ifSubscriberExists = user.subscribers.includes(userID);
      if (ifSubscriberExists || flag) {
        const accessEventNFT = await NFT.find({
          $and: [
            { type: "access" },
            { category: "event" },
            { ownerId: { $eq: req.params.id } },
          ],
        });

        const result = {
          status_code: 200,
          status_msg: `User Regular Event NFTs fetched`,
          data: accessEventNFT,
        };

        res.status(200).json(result);
      } else {
        const result = {
          status_code: 200,
          status_msg: `You need to subscribe to the user`,
          data: [],
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
  }
};
// new apis end

// const getAccessNFT = async (req, res) => {
//   const userID = getUserID(req, res);

//   if (userID !== undefined) {
//     try {
//       const accessNFTs = await NFT.find({
//         $and: [{ type: "access" }, { ownerId: { $ne: userID } }],
//       });

//       const result = {
//         status_code: 200,
//         status_msg: `Access NFTs fetched`,
//         data: accessNFTs,
//       };

//       res.status(200).json(result);
//     } catch (err) {
//       const result = {
//         status_code: 500,
//         status_msg: `Something went wrong`,
//       };

//       res.status(500).json(result);
//     }
//   }
// };
// const getUserAccessNFT = async (req, res) => {
//   const userID = getUserID(req, res);

//   if (userID !== undefined) {
//     try {
//       const user = await User.findById(userID);
//       let ifSubscriberExists = user.subscribers.includes(req.params.id);

//       if (ifSubscriberExists) {
//         const accessNFTs = await NFT.find({
//           $and: [{ type: "access" }, { ownerId: { $eq: req.params.id } }],
//         });

//         if (accessNFTs.length != 0) {
//           const result = {
//             status_code: 200,
//             status_msg: `User's Access NFTs fetched`,
//             data: accessNFTs,
//           };

//           res.status(200).json(result);
//         } else {
//           const result = {
//             status_code: 200,
//             status_msg: `No NFT exist`,
//           };

//           res.status(200).json(result);
//         }
//       } else {
//         const result = {
//           status_code: 404,
//           status_msg: `You need to subscribe to view access NFTs`,
//         };

//         res.status(404).json(result);
//       }
//     } catch (err) {
//       const result = {
//         status_code: 500,
//         status_msg: `Something went wrong :${err}`,
//       };

//       res.status(500).json(result);
//     }
//   }
// };
// const getRegularNFT = async (req, res) => {
//   const userID = getUserID(req, res);

//   if (userID !== undefined) {
//     try {
//       const regularNFTs = await NFT.find({
//         $and: [
//           { type: "regular" },
//           { ownerId: { $ne: userID } },
//           { holders: { $ne: userID } },
//         ],
//       });

//       const result = {
//         status_code: 200,
//         status_msg: `Regular NFTs fetched`,
//         data: regularNFTs,
//       };

//       res.status(200).json(result);
//     } catch (err) {
//       const result = {
//         status_code: 500,
//         status_msg: `Something went wrong`,
//       };

//       res.status(500).json(result);
//     }
//   }
// };
// const getUserRegularNFT = async (req, res) => {
//   const userID = getUserID(req, res);

//   if (userID !== undefined) {
//     try {
//       const regularNFTs = await NFT.find({
//         $and: [{ type: "regular" }, { ownerId: { $eq: req.params.id } }],
//       });

//       const result = {
//         status_code: 200,
//         status_msg: `User's Regular NFTs fetched`,
//         data: regularNFTs,
//       };

//       res.status(200).json(result);
//     } catch (err) {
//       const result = {
//         status_code: 500,
//         status_msg: `Something went wrong`,
//       };

//       res.status(500).json(result);
//     }
//   }
// };

const likeNFT = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const nft = await NFT.findById(req.body.id);
        const user = await deActiveStatusInner(nft.userId);

        if (!user.deactive) {
          if (!nft.likes.includes(userID)) {
            await nft.updateOne({ $push: { likes: userID } }, { new: true });
            const t_nft = await NFT.findById(req.body.id);
            const result = {
              status_code: 200,
              status_msg: `NFT has been liked`,
              data: t_nft,
            };
            res.status(200).json(result);
          } else {
            await nft.updateOne({ $pull: { likes: userID } }, { new: true });
            const t_nft = await NFT.findById(req.body.id);

            const result = {
              status_code: 200,
              status_msg: `NFT has been disliked`,
              data: t_nft,
            };

            res.status(200).json(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `You cannot like the nft of an unactivated user`,
          };
          res.status(403).send(result);
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
module.exports = {
  createAsset,
  updateAsset,
  likeNFT,
  //
  getRegularSongNFT,
  getAccessSongNFT,
  getUserRegularSongNFT,
  getUserAccessSongNFT,
  //
  getRegularEventNFT,
  getAccessEventNFT,
  getUserRegularEventNFT,
  getUserAccessEventNFT,
};
