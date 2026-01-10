import axios from 'axios';

// 🔥 IMPORTANT CHANGE
// Use Vite proxy instead of localhost or env URL
const API_BASE_URL = '/api';

/**
 * Send message to chat API - Returns structured data
 */
export async function sendMessage(message, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${API_BASE_URL}/chat`,
      { message },
      { headers }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message || 'Failed to send message' };
  }
}

/**
 * Fetch all documents from a collection
 */
export async function fetchCollectionData(collection, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${API_BASE_URL}/admin/data?collection=${collection}`,
    { headers }
  );
  return response.data;
}

/**
 * Get a single document
 */
export async function getDocument(collection, id, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${API_BASE_URL}/admin/data/${collection}/${id}`,
    { headers }
  );
  return response.data;
}

/**
 * Add new document to a collection
 */
export async function addDocument(collection, data, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post(
    `${API_BASE_URL}/admin/data/${collection}`,
    data,
    { headers }
  );
  return response.data;
}

/**
 * Update a document
 */
export async function updateDocument(collection, id, data, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.put(
    `${API_BASE_URL}/admin/data/${collection}/${id}`,
    data,
    { headers }
  );
  return response.data;
}

/**
 * Delete a document
 */
export async function deleteDocument(collection, id, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.delete(
    `${API_BASE_URL}/admin/data/${collection}/${id}`,
    { headers }
  );
  return response.data;
}

/**
 * Search documents
 */
export async function searchDocuments(collection, query, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${API_BASE_URL}/admin/search?collection=${collection}&query=${query}`,
    { headers }
  );
  return response.data;
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${API_BASE_URL}/admin/stats`,
    { headers }
  );
  return response.data;
}
