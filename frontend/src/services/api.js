import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    console.log('Sending message to:', `${API_BASE_URL}/chat`, { message });
    const response = await axios.post(`${API_BASE_URL}/chat`, { message }, { headers });
    console.log('Chat response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Chat API error - Full error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Error status:', error.response?.status);
    throw error.response?.data || { error: error.message || 'Failed to send message' };
  }
}

/**
 * Fetch all documents from a collection
 */
export async function fetchCollectionData(collection, token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/admin/data?collection=${collection}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Fetch data error:', error);
    throw error.response?.data || { error: 'Failed to fetch data' };
  }
}

/**
 * Get a single document
 */
export async function getDocument(collection, id, token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/admin/data/${collection}/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Get document error:', error);
    throw error.response?.data || { error: 'Failed to fetch document' };
  }
}

/**
 * Add new document to a collection
 */
export async function addDocument(collection, data, token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/data/${collection}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Add document error:', error);
    throw error.response?.data || { error: 'Failed to add document' };
  }
}

/**
 * Update a document
 */
export async function updateDocument(collection, id, data, token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.put(
      `${API_BASE_URL}/admin/data/${collection}/${id}`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Update document error:', error);
    throw error.response?.data || { error: 'Failed to update document' };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(collection, id, token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.delete(
      `${API_BASE_URL}/admin/data/${collection}/${id}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Delete document error:', error);
    throw error.response?.data || { error: 'Failed to delete document' };
  }
}

/**
 * Search documents
 */
export async function searchDocuments(collection, query, token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(
      `${API_BASE_URL}/admin/search?collection=${collection}&query=${query}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error.response?.data || { error: 'Failed to search documents' };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/admin/stats`, { headers });
    return response.data;
  } catch (error) {
    console.error('Stats error:', error);
    throw error.response?.data || { error: 'Failed to fetch statistics' };
  }
}
