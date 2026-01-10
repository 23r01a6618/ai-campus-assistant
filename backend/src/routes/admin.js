const express = require('express');
const router = express.Router();
const {
  getAllData,
  getDataById,
  addData,
  updateData,
  deleteData,
  searchData,
  getDatabaseStats,
} = require('../controllers/adminController');

/**
 * Admin routes for managing campus data (NO authentication required for demo)
 */

// Get all documents from a collection
// GET /api/admin/data?collection=events
router.get('/data', getAllData);

// Get a specific document
// GET /api/admin/data/events/docId
router.get('/data/:collection/:id', getDataById);

// Add new document
// POST /api/admin/data/events
router.post('/data/:collection', addData);

// Update document
// PUT /api/admin/data/events/docId
router.put('/data/:collection/:id', updateData);

// Delete document
// DELETE /api/admin/data/events/docId
router.delete('/data/:collection/:id', deleteData);

// Search documents
// GET /api/admin/search?collection=events&query=tech
router.get('/search', searchData);

// Get database statistics
// GET /api/admin/stats
router.get('/stats', getDatabaseStats);

module.exports = router;
