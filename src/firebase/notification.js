const admin = require("./firebaseConfig");

const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};
function sendNotification(token, notifMessage) {
  const registrationToken = token;
  const message = notifMessage;
  const options = notification_options;

  admin
    .messaging()
    .sendToDevice(registrationToken, message, options)
    .then((response) => {
      res.status(200).send("Notification sent successfully");
    })
    .catch((error) => {
      console.log(error);
    });
}

module.exports = sendNotification;