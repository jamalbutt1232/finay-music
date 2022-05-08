const Ad = require("../models/Ad");
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
// Create craigslist ad
const create_a_ad = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const newAd = new Ad(req.body);
      newAd.userId = userID;
      try {
        const savedAd = await newAd.save();

        const result = {
          status_code: 200,
          status_msg: `Ad has been created`,
          data: savedAd,
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
//update a ad
const updateAd = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);

    if (!deactive) {
      try {
        const ad = await Ad.findById(req.body.id);
        if (ad == null) {
          const result = {
            status_code: 403,
            status_msg: `Incorrect ID of AD`,
          };

          res.status(403).json(result);
        } else {
          if (ad.userId === userID) {
            await ad.updateOne({ $set: req.body }, { new: true });

            const updatedAd = await Ad.findById(req.body.id);
            const result = {
              status_code: 200,
              status_msg: `Ad has been updated`,
              data: updatedAd,
            };
            res.status(200).json(result);
          } else {
            const result = {
              status_code: 403,
              status_msg: `You can only update your ad`,
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
//delete a ad
const deleteAd = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const ad = await Ad.findById(req.body.id);

        if (ad.userId === userID) {
          await ad.deleteOne();

          const result = {
            status_code: 200,
            status_msg: `Ad has been deleted`,
            data: ad,
          };

          res.status(200).json(result);
        } else {
          const result = {
            status_code: 403,
            status_msg: `You can only delete your Ad`,
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

//Flag a Ad
const flagAd = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const ad = await Ad.findById(req.body.id);
        const user = await deActiveStatusInner(ad.userId);
        const t_user = await User.findById(ad.userId);
        if (!user.deactive) {
          if (t_user._id != userID) {
            if (!ad.flag.includes(userID)) {
              await Ad.updateOne({ $push: { flag: userID } });
              const t_ad = await Ad.findById(req.body.id);
              const result = {
                status_code: 200,
                status_msg: `Ad has been flagged`,
                data: t_ad,
              };
              res.status(200).json(result);
            } else {
              await Ad.updateOne({ $pull: { flag: userID } });
              const t_ad = await Ad.findById(req.body.id);
              const result = {
                status_code: 200,
                status_msg: `Ad has been un-flagged`,
                data: t_ad,
              };

              res.status(200).json(result);
            }
          } else {
            const result = {
              status_code: 500,
              status_msg: `You cannot flag your own ad`,
            };
            res.status(500).json(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `You cannot flag the ad of an unactivated user`,
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

//Flag a Ad
const getAds = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        let ad = await Ad.find();
        var t_userAdsv2 = {};
        var t_userAds = [];

        let index = 0;

        if (ad.length > 0) {
          for (i = 0; i < ad.length; i++) {
            var userDetails = {
              user_name: "",
              user_email: "",
              user_img: "",
              ad_type: "",
            };
            const friendID = ad[i].userId;
            const userData = await User.findById(friendID);

            if (!userData.deactive) {
              userDetails.user_name = userData.name;
              userDetails.user_email = userData.email;
              userDetails.user_img = userData.profilePicture;

              userDetails.ad_type = userData.type || "";

              t_userAdsv2 = {
                ...ad[i]._doc,
                user: userDetails,
              };

              t_userAds[index] = t_userAdsv2;
              index = index + 1;
            }
          }

          ad = t_userAds;

          ad = ad.sort(function (a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });
          const result = {
            status_code: 200,
            status_msg: `Ad fetched`,
            data: ad,
          };
          res.status(200).json(result);
        } else {
          // var allposts = list_of_posts;

          const result = {
            status_code: 200,
            status_msg: `No ads exist`,
            data: [],
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

module.exports = {
  create_a_ad,
  updateAd,
  deleteAd,
  flagAd,
  getAds,
};
