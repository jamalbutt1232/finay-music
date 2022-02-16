const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// GET USER ID
const getUserID = (req, res) => {
  let uid = undefined;
  jwt.verify(req.token, "adasddad3rerfsdsfd", function (err, data) {
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

// update user
const updateUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    if (userID || req.body.isAdmin) {
      try {
        const user = await User.findByIdAndUpdate(userID, {
          $set: req.body,
        });
        const result = {
          status_code: 200,
          status_msg: `Account has been updated`,
          data: user,
        };
        res.status(200).send(result);
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong`,
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
      // if (req.body.password) {
      //   try {
      //     const salt = await bcrypt.genSalt(10);
      //     req.body.password = await bcrypt.hash(req.body.password, salt);
      //   } catch (err) {
      //     return res.status(500).json(err);
      //   }
      // }
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
    try {
      const user = await User.findById(req.body.id);
      const { password, updatedAt, ...other } = user._doc;

      const result = {
        status_code: 200,
        status_msg: `You successfuly fetched user information`,
        data: other,
      };
      res.status(200).send(result);
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `You could not fetch user information`,
      };
      return res.status(500).send(result);
    }
  }
};
// follow user
const followUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    if (userID !== req.body.id) {
      try {
        const user = await User.findById(req.body.id);
        const currentUser = await User.findById(userID);
        if (!user.followers.includes(userID)) {
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
          const result = {
            status_code: 403,
            status_msg: `You already followed the user`,
          };
          res.status(403).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong`,
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
  }
};

// unfollow user currently
const unfollowUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    if (userID !== req.body.id) {
      try {
        const currentUser = await User.findById(userID);
        const user = await User.findById(req.body.id);
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
  }
};
// get all users list
const allUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
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
  }
};

// get current user info
const currentUser = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    if (userID === undefined) {
      const result = {
        status_code: 403,
        status_msg: `Invalid token`,
      };
      res.status(403).send(result);
    }
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
const search = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const searchedName = req.body.name;
    try {
      const user = await User.find({
        // not search for our id
        _id: { $ne: userID },
        // search for name and shd be case insensitive
        name: { $regex: searchedName, $options: "i" },
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
  }
};

// get all followers
const getFollowers = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    try {
      // getting followers list so they can be excluded
      let followersList = await User.find({ _id: userID });
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
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `Something went wrong : ${err}`,
      };
      return res.status(500).send(result);
    }
  }
};

// get all followings
const getFollowings = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    try {
      // getting followings list so they can be excluded
      let followingsList = await User.find({ _id: userID });
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
};
