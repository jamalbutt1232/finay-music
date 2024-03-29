const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");

const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");

const { v4: uuidv4 } = require("uuid");
const ENV = require("../env");
const { crossOriginEmbedderPolicy } = require("helmet");

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
const getCompleteUser = async (uid) => {
  try {
    const user = await User.findById(uid);
    return user;
  } catch (err) {
    return `Cannot get complete user issue : ${err}`;
  }
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
// Comment tag remaining
const create_a_post = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    const _user = await User.findById(userID);
    if (!_user.deactive) {
      const taggedUsers = req.body.taggedUsers;

      const newPost = new Post(req.body);
      newPost.userId = userID;
      try {
        const savedPost = await newPost.save();
        const currentUser = await User.findById(userID);
        //  GENERATING NOTIFICATION (TO THE TAGGED USER)

        var taggedList = [];
        if (taggedUsers != undefined) {
          taggedUsers.map((user_id) => {
            var userDetails = {
              currentId: userID,
              otherId: user_id,
              postId: savedPost._id,
              message: `${currentUser.name} tagged you in a post`,
            };
            taggedList = taggedList.concat(userDetails);
          });
        }

        if (taggedList.length > 0) {
          Notification.insertMany(taggedList)
            .then(function (docs) {
              const result = {
                status_code: 200,
                status_msg: `Post has been created`,
                data: savedPost,
              };

              res.status(200).json(result);
            })
            .catch(function (err) {
              res.status(500).send(err);
            });
        } else {
          const result = {
            status_code: 200,
            status_msg: `Post has been created`,
            data: savedPost,
          };

          res.status(200).json(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong :${err}`,
        };

        res.status(500).json(result);
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
// upload post
const uploadPost = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const _user = await User.findById(userID);
    if (!_user.deactive) {
      ///////////////////////////////////////////////////////////////////

      AWS_ID = ENV.AWS_ID;
      AWS_SECRET = ENV.AWS_SECRET;
      AWS_BUCKET_NAME = ENV.AWS_BUCKET_NAME;
      const s3 = new AWS.S3({
        accessKeyId: AWS_ID,
        secretAccessKey: AWS_SECRET,
      });
      if (req.file) {
        try {
          let myFile = req.file.originalname.split(".");
          const fileType = myFile[myFile.length - 1];

          const params = {
            Bucket: AWS_BUCKET_NAME,
            Key: `${uuidv4()}.${fileType}`,
            Body: req.file.buffer,
          };

          s3.upload(params, async (error, location) => {
            if (error) {
              res.status(500).send(error);
            } else {
              const result = {
                status_code: 200,
                status_msg: `File has been uploaded on s3`,
                data: location,
              };

              res.status(200).json(result);
            }
          });
        } catch (err) {
          const result = {
            status_code: 500,
            status_msg: `Something went wrong`,
          };

          res.status(500).json(result);
        }

        // console.log("public_link  :", public_link);
      } else {
        console.log("ERROR HERE");
        const result = {
          status_code: 500,
          status_msg: `Something went wrong`,
        };

        res.status(500).json(result);
      }
    } else {
      const result = {
        status_code: 403,
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);

      ///////////////////////////////////////////////////////////////////
    }
  }
};
// delete post
const deleteUploadPost = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      const post = await Post.findById(req.body.id);
      let file = post.file;

      AWS_ID = ENV.AWS_ID;
      AWS_SECRET = ENV.AWS_SECRET;
      AWS_BUCKET_NAME = ENV.AWS_BUCKET_NAME;
      const s3 = new AWS.S3({
        accessKeyId: AWS_ID,
        secretAccessKey: AWS_SECRET,
      });

      try {
        const params = {
          Bucket: AWS_BUCKET_NAME,
          Key: file,
        };

        s3.deleteObject(params, async (error, location) => {
          if (error) {
            res.status(500).send(error);
          } else {
            const result = {
              status_code: 200,
              status_msg: `File has been deleted on s3`,
              data: location,
            };

            res.status(200).json(result);
          }
        });
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong`,
        };

        res.status(500).json(result);
      }

      // console.log("public_link  :", public_link);
    } else {
      const result = {
        status_code: 403,
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);

      ///////////////////////////////////////////////////////////////////
    }
  }
};

//update a post
const updatePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
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
    } else {
      const result = {
        status_code: 403,
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);
    }
  }
};
//delete a post
const deletePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const post = await Post.findById(req.body.id);
        const listOfPosts = post.shared;

        if (post.userId === userID) {
          // if needed to add logic to deal with sub deleteion
          // if (post.userId === post.author) {
          //   await post.updateOne({ $pull: { shared: userID } });
          // }

          await post.deleteOne();
          if (listOfPosts.length > 0) {
            console.log("Came ehre");
            Post.deleteMany({ _id: { $in: listOfPosts } })
              .then(function (docs) {
                const result = {
                  status_code: 200,
                  status_msg: `Post has been deleted`,
                  data: post,
                };

                res.status(200).json(result);
              })
              .catch(function (err) {
                res.status(500).send(err);
              });
          } else {
            const result = {
              status_code: 200,
              status_msg: `Post has been deleted`,
              data: post,
            };

            res.status(200).json(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `You can only delete your post`,
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
    } else {
      const result = {
        status_code: 403,
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);
    }
  }
};
//like and dislike a post
const likePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const post = await Post.findById(req.body.id);
        const user = await deActiveStatusInner(post.userId);
        const currentUser = await User.findById(userID);
        if (!user.deactive) {
          if (!post.likes.includes(userID)) {
            await post.updateOne({ $push: { likes: userID } });
            if (userID !== post.userId) {
              //
              //  GENERATING NOTIFICATION (SAVE IT)
              const newNotification = new Notification({
                currentId: userID,
                otherId: post.userId,
                postId: post._id,
                message: `${currentUser.name} liked your post`,
                type: "likepost",
              });
              await newNotification.save();
            }
            //

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
            //
            //  REMOVING NOTIFICATION
            await Notification.find({
              currentId: userID,
              otherId: post.userId,
              postId: post._id,
            })
              .remove()
              .exec();

            //

            res.status(200).json(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `You cannot like the post of an unactivated user`,
          };
          res.status(403).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong :${err}`,
        };

        res.status(500).json(result);
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

//get all timeline post
const allPost = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        let myDetails = {
          user_name: "",
          user_email: "",
          user_img: "",
          post_type: "",
        };
        const currentUser = await User.findById(userID);
        myDetails = {
          user_name: currentUser.name,
          user_email: currentUser.email,
          user_img: currentUser.profilePicture,
          post_type: currentUser.isPost,
        };
        var userPosts = await Post.find({ userId: userID });

        var list_of_posts = [];
        userPosts.forEach((myPost) => {
          myPost = { ...myPost._doc, user: myDetails };
          list_of_posts.push(myPost);
        });

        var friendPosts = await Promise.all(
          currentUser.followings.map((friendId) => {
            return Post.find({
              $and: [{ userId: friendId }, { flag: { $ne: userID } }],
            });
          })
        );
        // let flaggedUsers = await Post

        friendPosts = friendPosts.filter((el) => {
          return el.length != 0;
        });

        friendPosts = [].concat.apply([], friendPosts);
        var t_friendPosts = [];

        var t_friendPostsv2 = {};

        let index = 0;

        if (friendPosts.length > 0) {
          for (i = 0; i < friendPosts.length; i++) {
            var friendDetails = {
              user_name: "",
              user_email: "",
              user_img: "",
              post_type: "",
            };
            const friendID = friendPosts[i].userId;
            const friendData = await User.findById(friendID);
            //console.log(friendData.email);
            if (!friendData.deactive) {
              friendDetails.user_name = friendData.name;
              friendDetails.user_email = friendData.email;
              friendDetails.user_img = friendData.profilePicture;

              friendDetails.post_type = friendData.isPost;

              t_friendPostsv2 = {
                ...friendPosts[i]._doc,
                user: friendDetails,
              };

              t_friendPosts[index] = t_friendPostsv2;
              index = index + 1;
            }
          }

          friendPosts = t_friendPosts;

          var allposts = list_of_posts.concat(...friendPosts);
        } else {
          var allposts = list_of_posts;
        }

        allposts.forEach((post) => {
          if (post.user.post_type == "private") {
            console.log("Came to private");
            allposts = allposts.filter(function (el) {
              return el.user.post_type != "private";
            });
          }
        });

        allposts = allposts.sort(function (a, b) {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
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
              post_it = { ...post, ...likedPost };
            } else {
              post_it = { ...post, ...dislikedPost };
            }
          } else {
            post_it = { ...post, ...dislikedPost };
          }

          if ("_doc" in post_it) {
            feed_posts.push(post_it._doc);
          } else {
            feed_posts.push(post_it);
          }
        });

        if (feed_posts.length != 0) {
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
    } else {
      const result = {
        status_code: 403,
        status_msg: `Please active your account`,
      };
      return res.status(403).send(result);
    }
  }
};

//get a post
const singlePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const post = await Post.findById(req.body.id);
        const user = await User.findById(post.userId);
        const blockedUser = user.blocked;

        if (!blockedUser.includes(userID)) {
          if (!post.flag.includes(userID)) {
            const result = {
              status_code: 200,
              status_msg: `Single post fetched`,
              data: post,
            };
            res.status(200).json(result);
          } else {
            const result = {
              status_code: 500,
              status_msg: `Flagged post cannot be fetched`,
            };
            res.status(500).json(result);
          }
        } else {
          const result = {
            status_code: 404,
            status_msg: `You cant view post of a blocked user`,
          };
          res.status(404).json(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong :${err}`,
        };
        res.status(500).json(result);
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
// Post of the user only (all of his posts)
const singleuserpost = async (req, res) => {
  const userID = getUserID(req, res);
  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        //   using promise here
        let myDetails = {
          user_name: "",
          user_email: "",
          user_img: "",
        };
        const uid = req.params.id;
        const currentUser = await User.findById(uid);
        if (currentUser.postType === "public") {
          myDetails = {
            user_name: currentUser.name,
            user_email: currentUser.email,
            user_img: currentUser.profilePicture,
          };
          var userPosts = await Post.find({ userId: uid });
          var list_of_posts = [];
          userPosts.forEach((myPost) => {
            myPost = { ...myPost._doc, user: myDetails };
            list_of_posts.push(myPost);
          });
          allposts = list_of_posts;
          allposts = allposts.sort(function (a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
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
              if (post.likes.includes(uid)) {
                post = { ...post, ...likedPost };
              } else {
                post = { ...post, ...dislikedPost };
              }
            } else {
              post = { ...post, ...dislikedPost };
            }
            feed_posts.push(post);
          });

          if (feed_posts.length != 0) {
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
        } else if (currentUser.postType == "supporter") {
          console.log("Supporrrrrrrrrrrter");
          let followers = currentUser.followers;

          if (followers.includes(userID)) {
            myDetails = {
              user_name: currentUser.name,
              user_email: currentUser.email,
              user_img: currentUser.profilePicture,
            };
            var userPosts = await Post.find({ userId: uid });
            var list_of_posts = [];
            userPosts.forEach((myPost) => {
              myPost = { ...myPost._doc, user: myDetails };
              list_of_posts.push(myPost);
            });
            allposts = list_of_posts;
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
                if (post.likes.includes(uid)) {
                  post = { ...post, ...likedPost };
                } else {
                  post = { ...post, ...dislikedPost };
                }
              } else {
                post = { ...post, ...dislikedPost };
              }
              feed_posts.push(post);
            });

            if (feed_posts.length != 0) {
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
          } else {
            const result = {
              status_code: 403,
              status_msg: `You need to follow user to view his posts`,
            };

            res.status(403).json(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `Account is private`,
          };

          res.status(403).json(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong: ${err}`,
        };

        res.status(500).json(result);
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

//Flag a post
const flagPost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const post = await Post.findById(req.body.id);
        const user = await deActiveStatusInner(post.userId);
        const t_user = await User.findById(post.userId);
        if (!user.deactive) {
          if (t_user._id != userID) {
            if (!post.flag.includes(userID)) {
              await post.updateOne({ $push: { flag: userID } });
              const t_post = await Post.findById(req.body.id);
              const result = {
                status_code: 200,
                status_msg: `Post has been flagged`,
                data: t_post,
              };
              res.status(200).json(result);
            } else {
              await post.updateOne({ $pull: { flag: userID } });
              const t_post = await Post.findById(req.body.id);
              const result = {
                status_code: 200,
                status_msg: `Post has been un-flagged`,
                data: t_post,
              };

              res.status(200).json(result);
            }
          } else {
            const result = {
              status_code: 500,
              status_msg: `You cannot flag your own post`,
            };
            res.status(500).json(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `You cannot flag the post of an unactivated user`,
          };
          res.status(403).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong :${err}`,
        };

        res.status(500).json(result);
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

//Share a post
const sharePost = async (req, res) => {
  const userID = getUserID(req, res);

  if (userID !== undefined) {
    const deactive = await deActiveStatusInner(userID);
    if (!deactive) {
      try {
        const post = await Post.findById(req.body.postId);

        const _user = await User.findById(post.userId);

        if (!_user.deactive) {
          if (_user._id != userID) {
            if (!post.shared.includes(userID)) {
              const newPost = new Post({
                desc: post.desc,
                author: post.userId,
                file: post.file || "",
                type: post.type,
                userId: userID,
              });
              newPost.save();
              await post.updateOne({ $push: { shared: newPost._id } });

              const result = {
                status_code: 200,
                status_msg: `Post has been shared`,
                data: newPost,
              };
              res.status(200).json(result);
            }
          } else {
            const result = {
              status_code: 500,
              status_msg: `You cannot share your own post`,
            };
            res.status(500).json(result);
          }
        } else {
          const result = {
            status_code: 403,
            status_msg: `You cannot share the post of an unactivated user`,
          };
          res.status(403).send(result);
        }
      } catch (err) {
        const result = {
          status_code: 500,
          status_msg: `Something went wrong :${err}`,
        };

        res.status(500).json(result);
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
  create_a_post,
  updatePost,
  deletePost,
  likePost,
  allPost,
  singlePost,
  singleuserpost,
  uploadPost,
  deleteUploadPost,
  flagPost,
  sharePost,
};
