import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';
import {
  fetchCollectionData,
  addDocument,
  updateDocument,
  deleteDocument,
  getDatabaseStats
} from '../services/api';

export default function AdminDashboard({ userToken }) {
  const [selectedCollection, setSelectedCollection] = useState('events');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const collections = ['events', 'clubs', 'faqs', 'facilities', 'academic_info'];

  const collectionSchemas = {
    events: ['title', 'description', 'date', 'time', 'venue', 'organizer', 'category', 'status'],
    clubs: ['name', 'description', 'coordinator', 'contactEmail', 'meetingSchedule', 'location'],
    faqs: ['question', 'answer', 'category', 'keywords'],
    facilities: ['name', 'type', 'location', 'hours', 'services', 'contact'],
    academic_info: ['topic', 'content', 'category', 'lastUpdated']
  };

  useEffect(() => {
    loadData();
  }, [selectedCollection]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchCollectionData(selectedCollection, userToken);
      setData(response.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateDocument(selectedCollection, editingId, formData, userToken);
        alert('Document updated successfully');
      } else {
        await addDocument(selectedCollection, formData, userToken);
        alert('Document created successfully');
      }
      
      setFormData({});
      setEditingId(null);
      setShowForm(false);
      loadData();
    } catch (error) {
      alert('Error saving document: ' + (error.error || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(selectedCollection, id, userToken);
        alert('Document deleted successfully');
        loadData();
      } catch (error) {
        alert('Error deleting document: ' + (error.error || 'Unknown error'));
      }
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>📊 Admin Dashboard</h2>
        <p>Manage campus data</p>
      </div>

      <div className="dashboard-content">
        <div className="collection-selector">
          <h3>Collections</h3>
          {collections.map(col => (
            <button
              key={col}
              className={`collection-btn ${selectedCollection === col ? 'active' : ''}`}
              onClick={() => setSelectedCollection(col)}
            >
              {col}
            </button>
          ))}
        </div>

        <div className="data-area">
          <div className="data-header">
            <h3>{selectedCollection}</h3>
            <button className="btn btn-primary" onClick={() => { setFormData({}); setEditingId(null); setShowForm(!showForm); }}>
              {showForm ? '✕ Cancel' : '✚ Add New'}
            </button>
          </div>

          {showForm && (
            <form className="data-form" onSubmit={handleSubmit}>
              <h4>{editingId ? 'Edit' : 'Create New'} {selectedCollection}</h4>
              {collectionSchemas[selectedCollection].map(field => (
                <div key={field} className="form-group">
                  <label>{field}</label>
                  {field === 'keywords' || field === 'services' ? (
                    <textarea
                      value={Array.isArray(formData[field]) ? formData[field].join(', ') : ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        [field]: e.target.value.split(',').map(s => s.trim())
                      })}
                      placeholder={`Enter comma-separated values`}
                    />
                  ) : (
                    <input
                      type={field === 'date' ? 'date' : 'text'}
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder={`Enter ${field}`}
                    />
                  )}
                </div>
              ))}
              <button type="submit" className="btn btn-success">
                {editingId ? 'Update' : 'Create'}
              </button>
            </form>
          )}

          {loading ? (
            <p className="loading">Loading data...</p>
          ) : data.length === 0 ? (
            <p className="empty">No data found. Create a new entry to get started.</p>
          ) : (
            <div className="data-table">
              {data.map(item => (
                <div key={item.id} className="data-row">
                  <div className="row-content">
                    {Object.entries(item).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="row-field">
                        <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value).substring(0, 50)}
                      </div>
                    ))}
                  </div>
                  <div className="row-actions">
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
