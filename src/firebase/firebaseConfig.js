var admin = require("firebase-admin");

var serviceAccount = require("./finay-app-firebase-adminsdk-k2e3t-b46d6914d4.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: "https://sample-project-e1a84.firebaseio.com"
})

module.exports.admin = admin