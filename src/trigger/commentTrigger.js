exports = function (changeEvent) {
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
    .get("Cluster0")
    .db("Cluster0")
    .collection("posts");
  const users = context.services
    .get("Cluster0")
    .db("Cluster0")
    .collection("users");
  posts.findOne({ _id: new BSON.ObjectId(doc.postId) }).then((postItem) => {
    console.log("POST", postItem.userId);
    users
      .findOne({ _id: new BSON.ObjectId(postItem.userId) })
      .then(async (userItem) => {
        console.log("REAL PUSH TOKEN", JSON.stringify(userItem.pushToken));
        const message_notification = {
          notification: {
            title: "Comment Notification",
            body: userItem.name + " commented on your post",
          },
        };
        await sendNotification(
          "feWbRz7zzk4ilVtwCDe0Gc:APA91bHx1NMqOHRSq1lohVlD7eEt4OQ3ONcLsGYK33z9HxtKIZ0Yk9K1_SoGXqvn2nUSwe--5Jo3Uakka6pITTS9Ii3JnXD271UrZfIHG6UiEgG26TkF7hOOCEKKElz4XfdiOdCfYDNZ",
          message_notification
        );
      });
  });
};
