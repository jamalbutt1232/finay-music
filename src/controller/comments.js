const Comment = require("../models/Comment");
const User = require("../models/User");
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

const create_a_comment = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
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
  }
};

const getAllComments = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const allcomments = await Comment.find({
        postId: req.params.id,
      });

      ////////////////////

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
        userDetails.user_img = commentUsers[0][0].img;

        commentUsers[i] = { userDetails };

        // console.log("11111111111111111111111111", userDetails[i].user_name);
      }
      console.log(commentUsers);
      for (i = 0; i < commentUsers.length; i++) {
        commentUsers[i] = { ...commentUsers[i], comment: allcomments[i] };
        // console.log("        commentUsers[i] :", commentUsers[i]);
        // console.log("commentUsers[i]  :", allcomments[i]);
      }
      //   console.log("commentUsers  : ", commentUsers);
      //   let allposts = list_of_posts.concat(...commentUsers);

      //   allposts = allposts.sort(function (a, b) {
      //     return new Date(a.updatedAt) - new Date(b.updatedAt);
      //   });
      //   allcomments.map((uid) => {
      //     const comment_user = User.findById(uid.userId);
      //     console.log("uid : ", uid);
      //   });

      //   for (i = 0; i < userComments[0].length; i++) {
      //     const friendID = userComments[0][i].userId;
      //     const friendData = await User.findById(friendID);

      //     userDetails.user_name = friendData.name;
      //     userDetails.user_email = friendData.email;
      //     userDetails.user_img = friendData.profilePicture;

      //     userComments[0][i] = { ...userComments[0][i]._doc, user: userDetails };
      //   }

      //   let allposts = list_of_posts.concat(...userComments);

      //   allposts = allposts.sort(function (a, b) {
      //     return new Date(a.updatedAt) - new Date(b.updatedAt);
      //   });
      ///////////////

      const result = {
        status_code: 200,
        status_msg: `Comment has been created`,
        data: commentUsers,
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
