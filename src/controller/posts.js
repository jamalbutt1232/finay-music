const Post = require("../models/Post");
const User = require("../models/User");
const verifyToken = require("../private/privateRoute");

// const get_user = async (req, res) => {
//   try {
//     const user = await User.findById({
//         _id :
//     })
//     res.status(200).json(savedPost);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// };

// error is cmg cause we dont have userid now. so just populate userid from req object
//create a post
const create_a_post = async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};
//update a post
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("You can only update ur post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
//delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("You can only delete ur post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
//like and dislike a post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

//get all timeline post
const allPost = async (req, res) => {
  try {
    //   using promise here
    const currentUser = await User.findById(req.body.userId);

    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts));
    // res.status(200).json(currentUser);
  } catch (err) {
    res.status(500).json(err);
  }
};
//get a post
const singlePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
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
