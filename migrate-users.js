// migrate-users.js
// Usage: node migrate-users.js
// Make sure to install firebase-admin and provide your service account key.

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // <-- Place your downloaded service account key here

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateUsers() {
  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    if (doc.id !== data.id) {
      // Copy to new doc with correct UID
      await db.collection('users').doc(data.id).set(data);
      // Delete old doc
      await db.collection('users').doc(doc.id).delete();
      console.log(`Migrated user: ${data.email || data.id} (${doc.id} -> ${data.id})`);
    }
  }
  console.log('Migration complete.');
}

migrateUsers().catch(console.error); 