// set-default-status.js
// Usage: node set-default-status.js
// Make sure to install firebase-admin and provide your service account key.

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setDefaultStatus() {
  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    if (!data.status) {
      await db.collection('users').doc(doc.id).update({ status: 'Logout' });
      console.log(`Set status for user: ${data.email || doc.id}`);
    }
  }
  console.log('Default status set for all users without status.');
}

setDefaultStatus().catch(console.error); 