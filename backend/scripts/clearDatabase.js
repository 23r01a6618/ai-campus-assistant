/**
 * Clear all data from Firestore collections
 * Run with: node scripts/clearDatabase.js
 */

const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: "fbsvc",
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Collections to clear
const collectionsToDelete = [
  "events",
  "clubs",
  "facilities",
  "faqs",
  "academic_info",
  "canteen_items",
  "conversations",
];

/**
 * Delete all documents from a collection
 */
async function deleteCollection(collectionName) {
  try {
    console.log(`🗑️  Clearing collection: ${collectionName}`);
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`✅ ${collectionName} is already empty`);
      return;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    console.log(`✅ Deleted ${count} documents from ${collectionName}\n`);
  } catch (error) {
    console.error(`❌ Error clearing ${collectionName}:`, error.message);
  }
}

/**
 * Clear all collections
 */
async function clearAllCollections() {
  try {
    console.log("🌱 Starting database cleanup...\n");

    for (const collection of collectionsToDelete) {
      await deleteCollection(collection);
    }

    console.log("🎉 Database cleanup complete!");
    console.log("\n📊 All collections have been cleared.");
    console.log("You can now run: node scripts/importDatasets.js");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

clearAllCollections();
