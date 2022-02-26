const Comment = require("../models/Comment");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// GET USER ID
const getUserID = (req, res) => {
  let uid = undefined;
  jwt.verify(req.token, process.env.TOKEN_SECRET, function (err, data) {
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
const create_a_comment = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const user = await User.findById(req.body.userId);
      if (!user.deactive) {
        const newComment = new Comment(req.body);
        newComment.userId = userID;
        try {
          const savedComment = await newComment.save();

          const result = {
            status_code: 200,
            status_msg: `Comment has been created`,
            data: savedComment,
          };

          res.status(200).json(result);
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
          status_msg: `You cannot comment on the post of an unactivated user`,
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

const getAllComments = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const allcomments = await Comment.find({
        postId: req.params.id,
      });

      // Sort to ascending
      allcomments.sort(function (a, b) {
        var dateA = new Date(a.updatedAt),
          dateB = new Date(b.updatedAt);
        return dateA - dateB;
      });

      const commentUsers = await Promise.all(
        allcomments.map((friendId) => {
          return User.find({ _id: friendId.userId });
        })
      );
      let userDetails = {
        user_name: "",
        user_email: "",
        user_img: "",
      };
      for (i = 0; i < commentUsers.length; i++) {
        userDetails.user_name = commentUsers[0][0].name;
        userDetails.user_email = commentUsers[0][0].email;
        userDetails.user_img = commentUsers[0][0].img || "";
        allcomments[i] = { ...allcomments[i]._doc, user: userDetails };
      }

      const result = {
        status_code: 200,
        status_msg: `All comments fetched`,
        data: allcomments,
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
  create_a_comment,
  getAllComments,
};
