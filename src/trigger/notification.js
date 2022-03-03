exports = function (changeEvent) {
  const admin = require("firebase-admin");
  var serviceAccount = {
    type: "service_account",
    project_id: "finay-app",
    private_key_id: "b46d6914d428cd951a58b74db1b5f90530c00b2e",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCfpf4wsRm8lcch\nYTe+UkqnWWYanmrydGs4E48O5ORtZG3f6fMx0suOL8CHpbzziNYqpZ0HgbLC8BTm\nCerG5eMjPLWjQvv7UhM0wlN67oJT7e8XIH1/I+TaRL/zKQAeMLNCSqfeIwrzBEIK\nfVli2MDTHg4bPYmdw6+uQ9sBXWiH1Il6tJmskGYc67f6/ASLVJfrnxLi0dWkfDqE\nZFZhDAscU3OYqzrNdqs5/Cg1f68LYVYQw9Ovs0SWzJ4WUMw4eG8UkOX9bkzSHs05\n1n3kNOGtGLymb0cjXaGZGOpIczVSp2NlHtTmGV73PsULC4oXrlcWF/34WXxv3fAN\nMHKPUTvtAgMBAAECggEACPVaEaZmcNAgx+06IQpiGQjps1WvX6KLv65NSUMr1D2d\n8sIgfOu8s2JXleUFeM71YZhAewLaopixO4VT8MxGlhwafypLlHszC7NZ1tyaYJZJ\n48zVbfR4K41PDhh/YrJN5Mrmp47k1uUmxYrqIKNUEqStmva1ia5I5ej12ZpButlq\nGm8PQgKA2CsjIP2RYhiOZosnTI797wdIHwvWA85H3h2qspcGzEbSTiFfOKmGI2b/\nCzHdrUYzz7Ytnw8hUlTYrWVLsOIDaegTkAC/+Ef5G8uvf9KUT9Z+hS/cuPUgSus5\nSv7Jos73LDzbG9eggT1jlAnID5Mppre2llnhr9oKYQKBgQDNm1SA0E5/w/v8PLqX\nTt/OwYFVXkoTH6ZUAHMru4VePjWwzBZvWW+IvKEW3Zl3GuMlEVsxXVBnY7CvAfnx\n/WNnrHrR9LhV2KZjaQGLm3gDA0uY6LJAmx7Qd09uvMYCJ2EQPvxyM1Rm5VzcHJP9\nU7GEK/94plUWvEamcv7SltkDPQKBgQDGxwjTEaq2KeEyznYqvqus7gCDldf0OIZ2\nT9/30dBZGJ+IGRHchaGrNkTfJn381/H18/a43dQVNXoG3tMVlAAcGXX2pSaTv1g4\nPwG1i4jyT2OWJhUBoVqr+ykINdHwGCFPnkenZjBHK5ovVK0yavXo/JZxYureWSx7\nDroztPbmcQKBgCPbE8iHCzmCzx305UFf0u32lvxxPg/JtDLwBSW6RQ7jYG+dl8gB\nW88HvjwDlzDLMpOTTEj2kgAFxZkvigwmeUBqNt0IhWELMDEj7c4P5cT4vSVEZ1mW\n86+9LtAMAaf8gBPaOCIeS3jKRQBpx3ElOE7pcVrz/uDBIr0CTuggwGWtAoGAEk3z\nxxQCZ2H15erTQN5sCrGkBHoA9/FYmH6Eflqo1/uHfU3psifwGkcWEoKF6YmtM1vy\n5VUwGX/iK83LHFqTpALINR1CLyrYod1Td/dQdhfPcN0y5AKKyfmH7sSd/4EJWD6Y\nFJc5bORb/23JwTHOUVUpOWnFfRIzIWXaybYpYlECgYB3t2G4PSZKcmnX3sHvVyZ2\nFiUY8ssvtPD7gDg0BQAu50qO9hgCaAO5kTSZbZQbgIFxL+9DiXgZXWzWtreN4rhP\nJRw6yWNHGRc1MdgG+pgDfLmJs/j/IJF6d2hxIW2YD8CJzOpC0Wwe9lLUO+fXSPOx\nytd39cZxZ6JI/77j0LXjkA==\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-k2e3t@finay-app.iam.gserviceaccount.com",
    client_id: "112138832935864435510",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-k2e3t%40finay-app.iam.gserviceaccount.com",
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: "https://sample-project-e1a84.firebaseio.com"
  });
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
  const collection = context.services
    .get("Cluster0")
    .db("Cluster0")
    .collection("users");
  collection
    .findOne({ _id: new BSON.ObjectId(doc.reciever) })
    .then(async (item) => {
      const message_notification = {
        notification: {
          title: "New Message",
          body: doc.text,
        },
      };
      await sendNotification(
        "feWbRz7zzk4ilVtwCDe0Gc:APA91bHx1NMqOHRSq1lohVlD7eEt4OQ3ONcLsGYK33z9HxtKIZ0Yk9K1_SoGXqvn2nUSwe--5Jo3Uakka6pITTS9Ii3JnXD271UrZfIHG6UiEgG26TkF7hOOCEKKElz4XfdiOdCfYDNZ",
        message_notification
      );
      console.log(JSON.stringify(item.pushToken));
    });
};
