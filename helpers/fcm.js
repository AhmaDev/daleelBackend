var admin = require("firebase-admin");

var serviceAccount = require("../daleel.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendNotification = (title, body, users, data) => {
  let message = {
    notification: {
      title: title,
      body: body,
    },
    date: data,
    tokens: users,
  };
  app
    .messaging()
    .sendEachForMulticast(message)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};
