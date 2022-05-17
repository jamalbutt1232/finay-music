exports = async function (changeEvent) {
  const admin = context.functions.execute("firebase_config");
  const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24,
  };
  async function sendNotification(token, notifMessage) {
    const registrationToken = token;
    const message = notifMessage;
    const options = notification_options;

    admin
      .messaging()
      .sendToDevice(registrationToken, message, options)
      .then((response) => {
        console.log("Notification sent successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const doc = changeEvent.fullDocument;
  const posts = context.services
    .get("FinayApp")
    .db("myFirstDatabase")
    .collection("posts");
  const users = context.services
    .get("FinayApp")
    .db("myFirstDatabase")
    .collection("users");
  const otherUser = await users.findOne({
    _id: new BSON.ObjectId(doc.userId),
  });
  posts.findOne({ _id: new BSON.ObjectId(doc.postId) }).then((postItem) => {
    users
      .findOne({ _id: new BSON.ObjectId(postItem.userId) })
      .then(async (userItem) => {
        const message_notification = {
          notification: {
            title: "Comment Notification",
            body: otherUser.name + " commented on your post: \n" + doc.desc,
          },
        };
        await sendNotification(userItem.pushToken, message_notification);
      });
  });
};
