/**
 * Admin Controller - Manage all campus data (CRUD operations)
 */

const { db, isFirebaseInitialized } = require("../utils/firebase");

const VALID_COLLECTIONS = ["events", "clubs", "facilities", "faqs", "academic_info"];

/**
 * Get all documents from a collection
 */
async function getAllData(req, res) {
  try {
    const { collection } = req.query;

    if (!collection || !VALID_COLLECTIONS.includes(collection)) {
      return res.status(400).json({
        error: "Invalid collection. Valid options: " + VALID_COLLECTIONS.join(", "),
      });
    }

    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    const snapshot = await db.collection(collection).orderBy("createdAt", "desc").get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      collection,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get a single document
 */
async function getDataById(req, res) {
  try {
    const { collection, id } = req.params;

    if (!collection || !VALID_COLLECTIONS.includes(collection)) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    const doc = await db.collection(collection).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({
      success: true,
      collection,
      id,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add new document
 */
async function addData(req, res) {
  try {
    const { collection } = req.params;
    const data = req.body;

    if (!collection || !VALID_COLLECTIONS.includes(collection)) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Data is required" });
    }

    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    // Validate required fields for each collection
    const validation = validateCollectionData(collection, data);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      collection,
      id: docRef.id,
      message: "Document added successfully",
    });
  } catch (error) {
    console.error("Error adding document:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update document
 */
async function updateData(req, res) {
  try {
    const { collection, id } = req.params;
    const updateData = req.body;

    if (!collection || !VALID_COLLECTIONS.includes(collection)) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Update data is required" });
    }

    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    // Check if document exists
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Document not found" });
    }

    await db.collection(collection).doc(id).update({
      ...updateData,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      collection,
      id,
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete document
 */
async function deleteData(req, res) {
  try {
    const { collection, id } = req.params;

    if (!collection || !VALID_COLLECTIONS.includes(collection)) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    // Check if document exists
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Document not found" });
    }

    await db.collection(collection).doc(id).delete();

    res.json({
      success: true,
      collection,
      id,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Search documents
 */
async function searchData(req, res) {
  try {
    const { collection, query } = req.query;

    if (!collection || !VALID_COLLECTIONS.includes(collection)) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    const snapshot = await db.collection(collection).get();
    const searchLower = query.toLowerCase();

    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(doc => {
        // Search in all string fields
        return Object.values(doc).some(value => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          }
          if (Array.isArray(value)) {
            return value.some(v => 
              typeof v === "string" && v.toLowerCase().includes(searchLower)
            );
          }
          return false;
        });
      });

    res.json({
      success: true,
      collection,
      query,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Validate data based on collection type
 */
function validateCollectionData(collection, data) {
  const requirements = {
    events: {
      required: ["name"],
      optional: ["date", "time", "location", "description", "category"],
    },
    clubs: {
      required: ["name"],
      optional: ["description", "members", "head", "email", "meetingDay"],
    },
    facilities: {
      required: ["name"],
      optional: ["type", "location", "hours", "capacity", "amenities"],
    },
    faqs: {
      required: ["question", "answer"],
      optional: ["category"],
    },
    academic_info: {
      required: ["title"],
      optional: ["content"],
    },
  };

  const reqs = requirements[collection];
  if (!reqs) {
    return { valid: false, error: "Unknown collection" };
  }

  // Check required fields
  for (const field of reqs.required) {
    if (!data.hasOwnProperty(field) || data[field] === "") {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Check for unexpected fields
  const allowedFields = [...reqs.required, ...reqs.optional];
  for (const field of Object.keys(data)) {
    if (!allowedFields.includes(field)) {
      return { valid: false, error: `Unknown field: ${field}` };
    }
  }

  return { valid: true };
}

/**
 * Get database statistics
 */
async function getDatabaseStats(req, res) {
  try {
    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    const stats = {};
    let totalDocuments = 0;

    for (const collection of VALID_COLLECTIONS) {
      const snapshot = await db.collection(collection).count().get();
      const count = snapshot.data().count;
      stats[collection] = count;
      totalDocuments += count;
    }

    res.json({
      success: true,
      totalDocuments,
      collections: stats,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllData,
  getDataById,
  addData,
  updateData,
  deleteData,
  searchData,
  getDatabaseStats,
};
