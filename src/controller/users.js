const User = require("../models/User");

const jwt = require("jsonwebtoken");

const OTP = require("../models/OTP");
const ENV = require("../env");
const Notification = require("../models/Notification");
const bcrypt = require("bcrypt");

console.log(ENV);
// GET USER ID
const getUserID = (req, res) => {
  let uid = undefined;
  console.log("req.token  :", req.token);

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

// Get user bio type
const getUserBioType = async (uid) => {
  try {
    const user = await User.findById(uid);
    const status = user.bioType;
    return status;
  } catch (err) {
    return `User Type Issue : ${err}`;
  }
};
// Get user follower type
const getUserFollowerType = async (uid) => {
  try {
    const user = await User.findById(uid);
    const status = user.followerType;
    return status;
  } catch (err) {
    return `User Type Issue : ${err}`;
  }
};
// Update pswd
const updatePassword = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    if (userID || req.body.isAdmin) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = await User.findByIdAndUpdate(
          userID,
          {
            password: hashedPassword,
          },
          { new: true }
        );
        const result = {
          status_code: 200,
          status_msg: `Password has been updated`,
          data: user,
        };
        res.status(200).send(result);
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong ${err}`,
        };
        return res.status(500).send(result);
      }
    } else {
      return res.status(403).json("You can update only your account");
    }
  }
};

// update user
const updateUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    if (userID || req.body.isAdmin) {
      try {
        const user = await User.findByIdAndUpdate(
          userID,
          {
            $set: req.body,
          },
          { new: true }
        );
        const result = {
          status_code: 200,
          status_msg: `Account has been updated`,
          data: user,
        };
        res.status(200).send(result);
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong ${err}`,
        };
        return res.status(500).send(result);
      }
    } else {
      return res.status(403).json("You can update only your account");
    }
  }
};
// delete user
const deleteUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    if (userID || req.body.isAdmin) {
      try {
        const user = await User.findByIdAndDelete(userID);
        const result = {
          status_code: 200,
          status_msg: `Account has been deleted`,
          data: user,
        };
        res.status(200).send(result);
      } catch (err) {
        const result = {
          status_code: 200,
          status_msg: err,
        };
        return res.status(200).send(result);
      }
    } else {
      return res.status(403).json("You can delete only your account");
    }
  }
};
// get a signle user based on click
const singleUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const type = await getUserBioType(req.params.id);

      try {
        if (type == "public") {
          const user = await User.findById(req.params.id);

          const { password, updatedAt, ...other } = user._doc;

          const result = {
            status_code: 200,
            status_msg: `You successfuly fetched user information`,
            data: other,
          };
          res.status(200).send(result);
        } else if (type == "supporter") {
          const user = await User.findById(req.params.id);
          let followers = user.followers;

          if (followers.includes(userID)) {
            const user = await User.findById(req.params.id);

            const { password, updatedAt, ...other } = user._doc;

            const result = {
              status_code: 200,
              status_msg: `You successfuly fetched user information`,
              data: other,
            };
            res.status(200).send(result);
          } else {
            const result = {
              status_code: 200,
              status_msg: `You need to follow the user to view profile`,
            };
            res.status(200).send(result);
          }
        } else {
          const user = await User.findById(req.params.id);
          console.log(user);
          const result = {
            status_code: 200,
            status_msg: `User is private`,
          };
          res.status(200).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `You could not fetch user information`,
        };
        return res.status(500).send(result);
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
// follow user
const followUser = async (req, res) => {
  const userID = getUserID(req, res);
  const currentUser = await User.findById(userID);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      if (userID !== req.body.id) {
        try {
          const user = await User.findById(req.body.id);
          if (!user.deactive) {
            if (!user.followers.includes(userID)) {
              if (userID !== req.body.id) {
                //  GENERATING NOTIFICATION (SAVE IT FOLLOW)
                const newNotification = new Notification({
                  currentId: userID,
                  otherId: req.body.id,
                  postId: "",
                  message: `${currentUser.name} started following you`,
                });
                await newNotification.save();
              }
              //

              await user.updateOne({
                $push: {
                  followers: userID,
                },
              });
              await currentUser.updateOne({
                $push: {
                  followings: req.body.id,
                },
              });
              const result = {
                status_code: 200,
                status_msg: `You now follow user`,
                data: user,
              };
              res.status(200).send(result);
            } else {
              //  REMOVING NOTIFICATION
              await Notification.find({
                currentId: userID,
                otherId: req.body.id,
              })
                .remove()
                .exec();

              //
              const result = {
                status_code: 403,
                status_msg: `You already followed the user`,
              };
              res.status(403).send(result);
            }
          } else {
            const result = {
              status_code: 403,
              status_msg: `You cannot follow an unactivated use`,
            };
            res.status(403).send(result);
          }
        } catch (err) {
          const result = {
            status_code: 500,
            status_msg: `Something went wrong :${err}`,
          };
          res.status(500).send(result);
        }
      } else {
        const result = {
          status_code: 403,
          status_msg: `You cant follow yourself`,
        };
        res.status(403).send(result);
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
// unfollow user currently
const unfollowUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      if (userID !== req.body.id) {
        try {
          const currentUser = await User.findById(userID);
          const user = await User.findById(req.body.id);
          if (!user.deactive) {
            if (user.followers.includes(userID)) {
              await user.updateOne({
                $pull: {
                  followers: userID,
                },
              });
              await currentUser.updateOne({
                $pull: {
                  followings: req.body.id,
                },
              });
              const result = {
                status_code: 200,
                status_msg: `You now unfollow user`,
                data: user,
              };
              res.status(200).send(result);
            } else {
              const result = {
                status_code: 403,
                status_msg: `You already unfollow user`,
              };
              res.status(403).send(result);
            }
          } else {
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
          status_msg: `You cant unfollow yousrself`,
        };
        res.status(403).json(result);
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
// get all users list
const allUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        // getting followings list so they can be excluded
        let followingsList = await User.find({ _id: userID });
        followingsList = followingsList[0].followings;
        followingsList[followingsList.length] = userID;

        // Get all users except of you and the one you followed
        const user = await User.find({
          _id: { $nin: followingsList },
        });
        const result = {
          status_code: 200,
          status_msg: `All users successfully fetched`,
          data: user,
        };
        res.status(200).send(result);
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong : ${err}`,
        };
        return res.status(500).send(result);
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

// get current user info
const currentUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    try {
      const user = await User.findById(userID);
      const { password, updatedAt, ...other } = user._doc;
      const result = {
        status_code: 200,
        status_msg: `You successfuly fetched user information`,
        data: other,
      };
      res.status(200).send(result);
      // res.status(200).json(other);
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `You could not fetch user information`,
      };
      return res.status(500).send(result);
    }
  }
};

// get a single searched user
// http://localhost:8800/api/users/search?name=kin
const search = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const searchedName = req.query.name;
      try {
        const user = await User.find({
          // not search for our id
          _id: { $ne: userID },
          // search for name and shd be case insensitive
          name: { $regex: searchedName, $options: "i" },
          deactive: {
            $ne: true,
          },
        });

        if (user.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `Successfuly fetched users`,
            data: user,
          };
          res.status(200).send(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `User not found`,
          };
          res.status(404).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong`,
        };
        return res.status(500).send(result);
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

// get all followers
const getFollowers = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const type = await getUserFollowerType(req.params.id);
      console.log("Hi 1");
      try {
        if (type == "public") {
          // getting followers list so they can be excluded
          let followersList = await User.find({ _id: req.params.id });
          followersList = followersList[0].followers;

          let usersList = await User.find({ _id: { $in: followersList } });
          if (usersList.length != 0) {
            const result = {
              status_code: 200,
              status_msg: `All followers fetched successfully`,
              data: usersList,
            };
            res.status(200).send(result);
          } else {
            const result = {
              status_code: 404,
              status_msg: `No followers found`,
            };
            res.status(404).send(result);
          }
        } else if (type == "supporter") {
          const user = await User.findById(req.params.id);
          let followers = user.followers;

          if (followers.includes(userID)) {
            let followersList = await User.find({ _id: req.params.id });
            followersList = followersList[0].followers;

            let usersList = await User.find({ _id: { $in: followersList } });
            if (usersList.length != 0) {
              const result = {
                status_code: 200,
                status_msg: `All followers fetched successfully`,
                data: usersList,
              };
              res.status(200).send(result);
            } else {
              const result = {
                status_code: 404,
                status_msg: `No followers found`,
              };
              res.status(404).send(result);
            }
          } else {
            const result = {
              status_code: 403,
              status_msg: `You need to follow the user to view followers`,
            };
            res.status(403).send(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `Profile is private`,
          };
          res.status(403).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong : ${err}`,
        };
        return res.status(500).send(result);
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

// get all followings
const getFollowings = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        // getting followings list so they can be excluded
        let followingsList = await User.find({ _id: req.params.id });
        followingsList = followingsList[0].followings;

        let usersList = await User.find({ _id: { $in: followingsList } });
        if (usersList.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `All followings fetched successfully`,
            data: usersList,
          };
          res.status(200).send(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `No followings found`,
          };
          res.status(404).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong : ${err}`,
        };
        return res.status(500).send(result);
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

const deActive = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      let deactive = false;
      User.findById(userID, function (err, user) {
        user.deactive = !user.deactive;
        deactive = !user.deactive;
        user.save(function (err) {
          if (err) {
            console.error("ERROR!");
          }
        });
      });

      const result = {
        status_code: 200,
        status_msg: `You have successfully chnage deactivation status of your account`,
        data: deactive,
      };
      res.status(200).send(result);
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `Something went wrong : ${err}`,
      };
      return res.status(500).send(result);
    }
  }
};

const deActiveStatus = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    try {
      const user = await User.findById(userID);

      const result = {
        status_code: 200,
        status_msg: `You have successfully fetched account's status`,
        data: user.deactive,
      };
      res.status(200).send(result);
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `Something went wrong`,
      };
      return res.status(500).send(result);
    }
  }
};

const active2f = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    let twofactor = false;
    if (!deactive) {
      try {
        User.findById(userID, async function (err, user) {
          user.twofactor = !user.twofactor;
          twofactor = !user.twofactor;
          user.save(function (err) {
            if (err) {
              console.error("ERROR!");
            } else {
              console.log("no error brah");
            }
          });
          const result = {
            status_code: 200,
            status_msg: `You have successfully changed your two factor authentication status`,
            data: twofactor,
          };
          res.status(200).send(result);
        });
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong`,
        };
        return res.status(500).send(result);
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

const sendSMS = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      min = 2000;
      max = 9999;
      const random_sequence = Math.floor(Math.random() * (max - min) + min);
      var otpExist = await OTP.find({ userId: userID });

      if (otpExist.length == 0) {
        var accountSid = ENV.ACCOUNT_SID;
        var authToken = ENV.AUTH_TOKEN;
        const sender = ENV.SENDER;
        const client = require("twilio")(accountSid, authToken);

        try {
          client.messages
            .create({
              body: random_sequence,
              from: sender,
              to: req.body.number,
            })
            .then((message) => {
              console.log(message);
            });

          const newOTP = new OTP(req.body);
          newOTP.code = random_sequence;
          newOTP.userId = userID;
          await newOTP.save();
          const result = {
            status_code: 200,
            status_msg: `Please check code`,
            data: `Message sent : ${random_sequence}`,
          };
          return res.status(200).json(result);
        } catch (err) {
          const result = {
            status_code: 500,
            status_msg: `Something went wrong : ${err}`,
          };
          return res.status(500).json(result);
        }
      } else {
        const result = {
          status_code: 404,
          status_msg: `A code was already sent to you. Wait for 2 minutes to send another one`,
        };
        return res.status(404).json(result);
      }
    }
  }
};

const verifySMS = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        let otp = await OTP.find({ userId: userID, code: req.params.code });
        if (otp.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `Successfully verified`,
          };
          return res.status(200).json(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `Incorrect verification`,
          };
          return res.status(404).json(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong`,
        };
        return res.status(500).json(result);
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

// get a single searched user
// http://localhost:8800/api/users/verifytoken?token=kin
const verifyTokenWeb = async (req, res) => {
  const token = req.query.token;
  try {
    if (typeof token !== "undefined") {
      jwt.verify(token, ENV.TOKEN_SECRET, function (err, data) {
        if (err) {
          const result = {
            status_code: 403,
            status_msg: `Invalid token`,
          };
          res.status(403).send(result);
        } else {
          const result = {
            status_code: 200,
            status_msg: `Token verified successfully`,
            data: token,
          };
          res.status(200).send(result);
        }
      });
    } else {
      const result = {
        status_code: 404,
        status_msg: `Token not found`,
      };
      res.status(404).send(result);
    }
  } catch (err) {
    const result = {
      status_code: 500,
      status_msg: `Something went wrong`,
    };
    return res.status(500).send(result);
  }
};

module.exports = {
  updateUser,
  deleteUser,
  singleUser,
  followUser,
  unfollowUser,
  allUser,
  currentUser,
  search,
  getFollowers,
  getFollowings,
  deActive,
  deActiveStatus,
  active2f,
  sendSMS,
  verifySMS,
  verifyTokenWeb,
  updatePassword,
};
