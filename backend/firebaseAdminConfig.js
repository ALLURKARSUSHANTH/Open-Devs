const admin = require('firebase-admin');
const serviceAccount = require('./open-devs-firebase-adminsdk-9dkcg-35f44e3bf7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;



