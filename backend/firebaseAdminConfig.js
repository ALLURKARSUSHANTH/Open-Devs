const admin = require('firebase-admin');
const serviceAccount = require('"C:/Users/Allurkar Sushanth/OneDrive/Desktop/Something imp/open-devs-firebase-adminsdk-9dkcg-35f44e3bf7 - Copy.json"');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;



