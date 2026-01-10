/**
 * Import datasets from Excel and CSV files into Firestore
 * Run with: node scripts/importDatasets.js
 */

const admin = require("firebase-admin");
const dotenv = require("dotenv");
const XLSX = require("xlsx");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

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

/**
 * Import Clubs from Excel file
 */
async function importClubs(filePath) {
  try {
    console.log("📚 Reading clubs data from:", filePath);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Found ${jsonData.length} clubs to import`);

    let importedCount = 0;
    for (const club of jsonData) {
      // Normalize field names to match our schema
      const clubData = {
        name: club.Club_Name || club.Name || club.name || "",
        description: club.Category || club.Department || "",
        coordinator: club.Faculty_Incharge || club.Coordinator || club.coordinator || club.Head || club.head || "",
        contactEmail: club.Email || club.contactEmail || club["Contact Email"] || "",
        contactPhone: club.Phone || club.contactPhone || club["Contact Phone"] || "",
        meetingSchedule: club.Meeting_Day ? `Every ${club.Meeting_Day}` : "",
        location: club.Department || club.Location || club.location || "",
        memberCount: parseInt(club.Members_Count || club["Member Count"] || club.memberCount || 0) || 0,
        joinLink: club["Join Link"] || club.joinLink || club["Registration Link"] || "",
        president: club.President || "",
        foundedYear: club.Founded_Year || "",
        status: club.Status || "Active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: "admin",
      };

      // Only add if name exists
      if (clubData.name) {
        await db.collection("clubs").add(clubData);
        importedCount++;
      }
    }

    console.log(`✨ Successfully imported ${importedCount} clubs\n`);
    return importedCount;
  } catch (error) {
    console.error("❌ Error importing clubs:", error.message);
    throw error;
  }
}

/**
 * Import Events from Excel file
 */
async function importEvents(filePath) {
  try {
    console.log("📅 Reading events data from:", filePath);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Found ${jsonData.length} events to import`);

    let importedCount = 0;
    for (const event of jsonData) {
      // Normalize field names
      const eventData = {
        title: event.Event_Name || event.Title || event.title || event.Name || event.name || "",
        description: event.Category || event.description || "",
        date: event.Date || event.date || "",
        time: event.Time || event.time || "",
        venue: event.Venue || event.venue || event.Location || event.location || "",
        organizer: event.Organizer || event.organizer || event.Department || event["Organizing Club"] || "",
        category: event.Category || event.category || "general",
        status: event.Status || event.status || "upcoming",
        capacity: parseInt(event.Participants || event.Capacity || event.capacity || 0) || 0,
        duration: event.Duration_Hours || "",
        registration_link: event["Registration Link"] || event.registrationLink || event["Event Link"] || "",
        department: event.Department || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: "admin",
      };

      // Only add if title exists
      if (eventData.title) {
        await db.collection("events").add(eventData);
        importedCount++;
      }
    }

    console.log(`✨ Successfully imported ${importedCount} events\n`);
    return importedCount;
  } catch (error) {
    console.error("❌ Error importing events:", error.message);
    throw error;
  }
}

/**
 * Import Food Items (Canteen) from CSV file
 */
async function importFoodItems(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        try {
          console.log("🍽️  Reading food items data from:", filePath);
          console.log(`✅ Found ${results.length} food items to import`);

          let importedCount = 0;
          for (const item of results) {
            // The CSV has duplicate "Item_ID" columns, so the food name is in the Item_ID field
            const foodData = {
              name: item.Item_ID || item.Name || item.name || item["Food Item"] || "",
              category: item.Category || item.category || item.Type || item.type || "general",
              price: parseFloat(item.Price_INR || item.Price || item.price || 0) || 0,
              availability: item.Availability || item.availability || "available",
              calories: parseInt(item.Calories || item.calories || 0) || 0,
              vegetarian: (item.Is_Veg || item.Vegetarian || item["Is Vegetarian"] || "No").toLowerCase() === "yes",
              description: item.Description || item.description || item.Details || item.details || "",
              allergens: item.Allergens || item.allergens || "",
              nutritionInfo: item["Nutrition Info"] || item.nutritionInfo || "",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              createdBy: "admin",
            };

            // Only add if name exists
            if (foodData.name) {
              await db.collection("canteen_items").add(foodData);
              importedCount++;
            }
          }

          console.log(`✨ Successfully imported ${importedCount} food items\n`);
          resolve(importedCount);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * Main import function
 */
async function importAllDatasets() {
  const datasetsPath = "c:\\Users\\ravik\\Downloads";

  const files = {
    clubs: path.join(datasetsPath, "Campus_Clubs_Organizations_Dataset.xlsx"),
    events: path.join(datasetsPath, "Campus_Events_Dataset.xlsx"),
    canteen: path.join(datasetsPath, "Canteen_Food_Items_Dataset (1).csv"),
  };

  // Check if files exist
  const missingFiles = [];
  for (const [name, filePath] of Object.entries(files)) {
    if (!fs.existsSync(filePath)) {
      missingFiles.push(`${name}: ${filePath}`);
    }
  }

  if (missingFiles.length > 0) {
    console.error("❌ Missing dataset files:");
    missingFiles.forEach((file) => console.error(`  - ${file}`));
    process.exit(1);
  }

  try {
    console.log("🌱 Starting dataset import...\n");

    const stats = {
      clubs: 0,
      events: 0,
      canteen: 0,
    };

    // Import in sequence
    stats.clubs = await importClubs(files.clubs);
    stats.events = await importEvents(files.events);
    stats.canteen = await importFoodItems(files.canteen);

    console.log("🎉 Dataset import complete!");
    console.log("\n📊 Summary:");
    console.log(`- Clubs: ${stats.clubs}`);
    console.log(`- Events: ${stats.events}`);
    console.log(`- Food Items: ${stats.canteen}`);
    console.log(
      `- Total: ${stats.clubs + stats.events + stats.canteen} documents`
    );

    console.log("\n✨ Your datasets have been successfully imported!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during import:", error);
    process.exit(1);
  }
}

importAllDatasets();
