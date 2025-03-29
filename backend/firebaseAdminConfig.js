const admin = require('firebase-admin');
const serviceAccount = require('C:\Users\vigne\Desktop/open-devs-firebase-adminsdk-9dkcg-35f44e3bf7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;



