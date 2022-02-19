const Post = require("../models/Post");
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

const create_a_post = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const newPost = new Post(req.body);
    newPost.userId = userID;
    try {
      const savedPost = await newPost.save();

      const result = {
        status_code: 200,
        status_msg: `Post has been created`,
        data: savedPost,
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
//update a post
const updatePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const post = await Post.findById(req.body.id);
      if (post.userId === userID) {
        await post.updateOne({ $set: req.body });
        const result = {
          status_code: 200,
          status_msg: `Post has been updated`,
          data: post,
        };

        res.status(200).json(result);
      } else {
        const result = {
          status_code: 403,
          status_msg: `You can only update ur post`,
        };

        res.status(403).json(result);
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
//delete a post
const deletePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const post = await Post.findById(req.body.id);
      if (post.userId === userID) {
        await post.deleteOne();
        const result = {
          status_code: 200,
          status_msg: `Post has been deleted`,
          data: post,
        };

        res.status(200).json(result);
      } else {
        const result = {
          status_code: 403,
          status_msg: `You can only delete ur post`,
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
//like and dislike a post
const likePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const post = await Post.findById(req.body.id);
      if (!post.likes.includes(userID)) {
        await post.updateOne({ $push: { likes: userID } });
        const result = {
          status_code: 200,
          status_msg: `Post has been liked`,
          data: post,
        };
        res.status(200).json(result);
      } else {
        await post.updateOne({ $pull: { likes: userID } });
        const result = {
          status_code: 200,
          status_msg: `Post has been disliked`,
          data: post,
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

//get all timeline post
const allPost = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    try {
      //   using promise here
      let myDetails = {
        user_name: "",
        user_email: "",
        user_img: "",
      };
      const currentUser = await User.findById(userID);
      myDetails = {
        user_name: currentUser.name,
        user_email: currentUser.email,
        user_img: currentUser.profilePicture,
      };
      var userPosts = await Post.find({ userId: userID });
      var list_of_posts = [];
      userPosts.forEach((myPost) => {
        myPost = { ...myPost._doc, user: myDetails };
        list_of_posts.push(myPost);
      });

      const friendPosts = await Promise.all(
        currentUser.followings.map((friendId) => {
          return Post.find({ userId: friendId });
        })
      );
      let friendDetails = {
        user_name: "",
        user_email: "",
        user_img: "",
      };

      for (i = 0; i < friendPosts[0].length; i++) {
        const friendID = friendPosts[0][i].userId;
        const friendData = await User.findById(friendID);

        friendDetails.user_name = friendData.name;
        friendDetails.user_email = friendData.email;
        friendDetails.user_img = friendData.profilePicture;

        friendPosts[0][i] = { ...friendPosts[0][i]._doc, user: friendDetails };
      }

      let allposts = list_of_posts.concat(...friendPosts);

      allposts = allposts.sort(function (a, b) {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      });
      var feed_posts = [];
      let likedPost = {
        likedPost: true,
      };
      let dislikedPost = {
        likedPost: false,
      };

      allposts.forEach((post) => {
        if (post.likes.length != 0) {
          if (post.likes.includes(userID)) {
            post = { ...post, ...likedPost };
          } else {
            post = { ...post, ...dislikedPost };
          }
        } else {
          post = { ...post, ...dislikedPost };
        }
        feed_posts.push(post);
      });

      if (allposts.length != 0) {
        const result = {
          status_code: 200,
          status_msg: `Posts fetched`,
          data: feed_posts,
        };

        res.status(200).json(result);
      } else {
        const result = {
          status_code: 404,
          status_msg: `No posts for user found`,
        };

        res.status(404).json(result);
      }
    } catch (err) {
      const result = {
        status_code: 500,
        status_msg: `Something went wrong: ${err}`,
      };

      res.status(500).json(result);
    }
  }
};
//get a post
const singlePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    try {
      const post = await Post.findById(req.body.id);
      const result = {
        status_code: 200,
        status_msg: `Single post fetched`,
        data: post,
      };
      res.status(200).json(result);
    } catch (err) {
      const result = {
        status_code: 200,
        status_msg: `Something went wrong`,
      };
      res.status(500).json(result);
    }
  }
};

module.exports = {
  create_a_post,
  updatePost,
  deletePost,
  likePost,
  allPost,
  singlePost,
};