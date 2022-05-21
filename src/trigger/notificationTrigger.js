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
  const type = doc.type;

  const notification = context.services
    .get("Cluster0")
    .db("Cluster0")
    .collection("notifications");

  const users = context.services
    .get("Cluster0")
    .db("Cluster0")
    .collection("users");

  const currentUser = await users.findOne({
    _id: new BSON.ObjectId(doc.currentId),
  });
  const otherUser = await users.findOne({
    _id: new BSON.ObjectId(doc.otherId),
  });

  var _title,
    _body_msg = "";

  if (type == "likepost") {
    _title = "Like post Notification";
    _body_msg = " liked your post";
  } else if (type == "follow") {
    _title = "Follow Notification";
    _body_msg = " followed you";
  } else if (type == "subscribe") {
    _title = "Subscribe Notification";
    _body_msg = " subscribed you";
  } else if (type == "comment") {
    _title = "Comment Notification";
    _body_msg = " commented on your post";
  }

  const message_notification = {
    notification: {
      title: _title,
      body: currentUser.name + _body_msg,
    },
  };

  await sendNotification(otherUser.pushToken, message_notification);
};
