const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ENV = require("../env");
const Post = require("../models/Post");
const { listeners } = require("../models/User");

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
const create_a_comment = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const user = await User.findById(userID);

      // if (!user.deactive) {
      let newComment = new Comment(req.body);
      newComment.userId = userID;

      try {
        let savedComment = await newComment.save();
        var userDetails = {
          user_name: "",
          user_email: "",
          user_img: "",
        };

        userDetails.user_name = user.name;
        userDetails.user_email = user.email;
        userDetails.user_img = user.img || "";

        savedComment = { ...savedComment._doc, user: userDetails };
        //  GENERATING NOTIFICATION (SAVE IT COMMENT)
        const post = await Post.findById(req.body.postId);
        const currentUser = await User.findById(userID);
        if (userID !== post.userId) {
          const newNotification = new Notification({
            currentId: userID,
            otherId: post.userId,
            postId: post._id,
            message: `${currentUser.name} commented on your post`,
          });
          await newNotification.save();
        }
        //
        const result = {
          status_code: 200,
          status_msg: `Comment has been created`,
          data: savedComment,
        };

        res.status(200).json(result);
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong :${err}`,
        };

        res.status(500).json(result);
      }
      // } else {
      //   const result = {
      //     status_code: 403,
      //     status_msg: `You cannot comment on the post of an unactivated user`,
      //   };
      //   res.status(403).send(result);
      // }
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

      let commentUsers = await Promise.all(
        allcomments.map((friendId) => {
          return User.find({ _id: friendId.userId });
        })
      );
      commentUsers = [].concat.apply([], commentUsers);

      console.log(commentUsers);
      for (i = 0; i < commentUsers.length; i++) {
        var userDetails = {
          user_name: "",
          user_email: "",
          user_img: "",
        };

        userDetails.user_name = commentUsers[i].name;
        userDetails.user_email = commentUsers[i].email;
        userDetails.user_img = commentUsers[i].img || "";

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
