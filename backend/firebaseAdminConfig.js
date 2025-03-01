const admin = require('firebase-admin');
const serviceAccount = require('./path_to_your_serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
