const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let db, auth, isFirebaseInitialized = false;

if (!admin.apps.length) {
  try {
    // Check if we have all required credentials
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      db = admin.firestore();
      auth = admin.auth();
      isFirebaseInitialized = true;
      console.log('✅ Firebase initialized successfully');
    } else {
      console.log('⚠️  Firebase credentials not found. Some features will be limited.');
      console.log('Please add FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL to .env');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.error('Please verify your Firebase credentials in .env file');
  }
}

module.exports = { admin, db, auth, isFirebaseInitialized };
