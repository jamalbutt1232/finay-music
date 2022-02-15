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
        status_msg: `Invalid token hup`,
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
};
// follow user
const followUser = async (req, res) => {
  const userID = getUserID(req);
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
};

// unfollow user currently
const unfollowUser = async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });
        res.status(200).json("You now unfollow user");
      } else {
        res.status(403).json("You already unfollow");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cant unfollow yousrself");
  }
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
};
// get all users list
const allUser = async (req, res) => {
  const userID = getUserID(req);

  try {
    // Get all users except of you
    const user = await User.find({ _id: { $ne: userID } });
    const result = {
      status_code: 200,
      status_msg: `All users successfully fetched`,
      data: user,
    };
    res.status(200).send(result);
  } catch (err) {
    const result = {
      status_code: 200,
      status_msg: `Something went wrong`,
    };
    return res.status(500).send(result);
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
module.exports = {
  updateUser,
  deleteUser,
  singleUser,
  followUser,
  unfollowUser,
  allUser,
  currentUser,
  search,
};
