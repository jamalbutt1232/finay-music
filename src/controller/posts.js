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
      const currentUser = await User.findById(userID);
      const userPosts = await Post.find({ userId: userID });
      const friendPosts = await Promise.all(
        currentUser.followings.map((friendId) => {
          return Post.find({ userId: friendId });
        })
      );
      let allposts = userPosts.concat(...friendPosts);
      // allposts =
      allposts = allposts.sort(function (a, b) {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      });

      // console.log(" allposts :", allposts);
      const result = {
        status_code: 200,
        status_msg: `Post has been created`,
        data: allposts,
      };

      res.status(200).json(result);
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
