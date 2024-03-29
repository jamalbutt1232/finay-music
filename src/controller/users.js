const User = require("../models/User");

const jwt = require("jsonwebtoken");

const OTP = require("../models/OTP");
const ENV = require("../env");
const Notification = require("../models/Notification");
const bcrypt = require("bcrypt");

var AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

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
      const currentUser = await User.findById(userID);

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
                  message: `${currentUser.name} supports you`,
                  type: "follow",
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
        blockedUsers = followingsList[0].blocked;
        followingsList = followingsList[0].followings;

        followingsList[followingsList.length] = userID;
        followingsList = followingsList.concat(blockedUsers);
        console.log(followingsList);
        // Get all users except of you and the one you followed
        const user = await User.find({
          _id: { $nin: followingsList },
        });
        // Sort to ascending (as per updated date sorted by latest date on top)
        user.sort(function (a, b) {
          var dateA = new Date(a.updatedAt),
            dateB = new Date(b.updatedAt);
          return dateB - dateA;
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
        const currentUser = await User.findById(userID);
        let blockedUsers = currentUser.blocked;

        if (user.length != 0) {
          var usersList = [];
          user.forEach((singleUser) => {
            if (!blockedUsers.includes(singleUser._id, 0)) {
              usersList.push(singleUser);
            }
          });

          const result = {
            status_code: 200,
            status_msg: `Successfuly fetched users`,
            data: usersList,
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

// get all subscribers
const getSubscribers = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        let subsList = await User.find({ _id: req.params.id });
        subsList = subsList[0].subscribers;

        let usersList = await User.find({ _id: { $in: subsList } });
        if (usersList.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `All subscribers fetched successfully`,
            data: usersList,
          };
          res.status(200).send(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `No subscribers found`,
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

// get all subscribees
const getSubscribees = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        let subsList = await User.find({ _id: req.params.id });
        subsList = subsList[0].subscribees;

        let usersList = await User.find({ _id: { $in: subsList } });
        if (usersList.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `All subscribees fetched successfully`,
            data: usersList,
          };
          res.status(200).send(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `No subscribees found`,
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
            status_msg: `All supporters fetched successfully`,
            data: usersList,
          };
          res.status(200).send(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `No supporters found`,
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
      try {
        var random = Math.floor(1000 + Math.random() * 9000);
        const YOUR_MESSAGE = `Your verification code is ${random}`;
        const number = req.body.number;
        console.log("number :", number);
        AWS_ID = ENV.AWS_ID;
        AWS_SECRET = ENV.AWS_SECRET;
        // Set the parameters
        var params = {
          Message: YOUR_MESSAGE,
          PhoneNumber: number,
          MessageAttributes: {
            "AWS.SNS.SMS.SenderID": {
              DataType: "String",
              StringValue: "subject",
            },
            "AWS.SNS.SMS.SMSType": {
              DataType: "String",
              StringValue: "Transactional",
            },
          },
        };

        var publishTextPromise = new AWS.SNS({
          apiVersion: "2010-03-31",
          accessKeyId: AWS_ID,
          secretAccessKey: AWS_SECRET,
        })
          .publish(params)
          .promise();
        const user = await User.findById(userID);
        publishTextPromise
          .then(async function (data) {
            var otpExist = await OTP.find({ email: user.email });

            if (otpExist.length == 0) {
              const newOTP = new OTP();
              newOTP.code = random;
              newOTP.email = user.email;
              await newOTP.save();

              const result = {
                status_code: 200,
                status_msg: `Message sent : ${random}`,
              };
              return res.status(500).json(result);
            }
          })
          .catch(function (err) {
            res.end(JSON.stringify({ Error: err }));
          });

        // }
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
};

const verifySMS = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const user = await User.findById(userID);
        let otp = await OTP.find({ email: user.email, code: req.params.code });
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

// Subscribe user
const subscribeUser = async (req, res) => {
  const userID = getUserID(req, res);
  const currentUser = await User.findById(userID);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      if (userID !== req.body.id) {
        try {
          const user = await User.findById(req.body.id);
          if (!user.deactive) {
            if (!currentUser.subscribers.includes(req.body.id)) {
              if (userID !== req.body.id) {
                //  GENERATING NOTIFICATION (SAVE IT FOLLOW)
                const newNotification = new Notification({
                  currentId: userID,
                  otherId: req.body.id,
                  postId: "",
                  message: `${currentUser.name} subscribed you`,
                  type: "subscribe",
                });
                await newNotification.save();
              }
              // await nft.updateOne({ $push: { likes: userID } }, { new: true });
              await currentUser.updateOne({
                $push: {
                  subscribees: req.body.id,
                },
              });
              await user.updateOne({
                $push: {
                  subscribers: userID,
                },
              });

              const t_user = await User.findById(userID);
              const result = {
                status_code: 200,
                status_msg: `You have subscribed the user`,
                data: t_user,
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
                status_msg: `You already subscribed to the user`,
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

// Report user
const reportUser = async (req, res) => {
  const userID = getUserID(req, res);
  const currentUser = await User.findById(userID);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      if (userID !== req.body.id) {
        try {
          const user = await User.findById(req.body.id);
          if (!user.deactive) {
            if (!currentUser.reports.includes(req.body.id)) {
              // await nft.updateOne({ $push: { likes: userID } }, { new: true });
              await currentUser.updateOne({
                $push: {
                  reports: req.body.id,
                },
              });

              const t_user = await User.findById(userID);
              const result = {
                status_code: 200,
                status_msg: `You have reported the user`,
                data: t_user,
              };
              res.status(200).send(result);
            } else {
              const result = {
                status_code: 500,
                status_msg: `You already reported the user`,
              };
              res.status(500).send(result);
            }
          } else {
            const result = {
              status_code: 403,
              status_msg: `You cannot report an unactivated use`,
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
          status_msg: `You cant report yourself`,
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

// All related users
const relatedUsers = async (req, res) => {
  const userID = getUserID(req, res);
  const currentUser = await User.findById(userID);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        if (!currentUser.deactive) {
          let followersList = [];
          followersList = followersList.concat(currentUser.followers);

          let followingsList = [];
          followingsList = followingsList.concat(currentUser.followings);

          var relatedUsers = followersList.concat(followingsList);

          var userDetailsList = [];
          // var users;
          if (relatedUsers.length > 0) {
            User.find(
              {
                _id: {
                  $in: relatedUsers,
                },
              },
              function (err, docs) {
                docs.forEach((user) => {
                  var userDetails = {
                    user_name: "",
                    user_email: "",
                    user_img: "",
                    user_id: "",
                  };

                  userDetails = {
                    user_name: user.name,
                    user_email: user.email,
                    user_img: user.profilePicture || "",
                    user_id: user._id,
                  };

                  userDetailsList = userDetailsList.concat(userDetails);
                });
                if (userDetailsList.length > 0) {
                  const result = {
                    status_code: 200,
                    status_msg: `Related users list fetched`,
                    data: userDetailsList,
                  };
                  res.status(200).send(result);
                } else {
                  const result = {
                    status_code: 200,
                    status_msg: `No list`,
                    data: [],
                  };
                  res.status(200).send(result);
                }
              }
            );
          } else {
            const result = {
              status_code: 200,
              status_msg: `No list`,
            };
            res.status(200).send(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `You cannot fetch list an unactivated user`,
          };
          res.status(403).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong : ${err}`,
        };
        res.status(500).send(result);
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

// Block user
const blockUser = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      var otherUserId = req.body.id;

      if (otherUserId !== undefined) {
        if (userID !== req.body.id) {
          try {
            const user = await User.findById(userID);
            const otherUser = await User.findById(otherUserId);
            if (!user.deactive) {
              if (!user.blocked.includes(otherUserId)) {
                await user.updateOne({
                  $push: {
                    blocked: otherUserId,
                  },
                });
                await otherUser.updateOne({
                  $pull: {
                    followers: userID,
                  },
                });
                await user.updateOne({
                  $pull: {
                    followings: otherUserId,
                  },
                });
                user.followings.pull(otherUserId);
                user.blocked.push(otherUserId);
                const result = {
                  status_code: 200,
                  status_msg: `You blocked the user`,
                  data: user,
                };
                res.status(200).send(result);
              } else {
                const result = {
                  status_code: 200,
                  status_msg: `You already blocked the user`,
                };
                res.status(200).send(result);
              }
            } else {
              const result = {
                status_code: 403,
                status_msg: `You cannot block an unactivated user`,
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
            status_msg: `You cant block yourself`,
          };
          res.status(403).send(result);
        }
      } else {
        const result = {
          status_code: 404,
          status_msg: `Please provide user id to block`,
        };
        return res.status(404).send(result);
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
// get all blocked users
const getBlockUsers = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        let blockedUsers = await User.find({ _id: userID });
        blockedUsers = blockedUsers[0].blocked;

        let usersList = await User.find({ _id: { $in: blockedUsers } });
        if (usersList.length != 0) {
          const result = {
            status_code: 200,
            status_msg: `All blocked users fetched successfully`,
            data: usersList,
          };
          res.status(200).send(result);
        } else {
          const result = {
            status_code: 404,
            status_msg: `No blocked users found`,
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
  getSubscribers,
  verifySMS,
  verifyTokenWeb,
  updatePassword,
  subscribeUser,
  relatedUsers,
  getSubscribees,
  blockUser,
  getBlockUsers,
  reportUser,
};
