import React from 'react';
import '../styles/StructuredResponse.css';

/**
 * Component to render structured responses from the backend
 */
export default function StructuredResponse({ sections }) {
  if (!sections || sections.length === 0) {
    return (
      <div className="response-container">
        <div className="response-section empty">
          <h3>No Results</h3>
          <p>Try asking about events, clubs, facilities, or academic info!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="response-container">
      {sections.map((section, idx) => (
        <div key={idx} className={`response-section ${section.type}`}>
          {section.type === 'empty' ? (
            <>
              <h3>{section.title}</h3>
              <p className="empty-message">{section.message}</p>
            </>
          ) : (
            <>
              <h3 className="section-title">{section.title}</h3>

              {/* Events */}
              {section.type === 'events' && (
                <div className="items-grid">
                  {section.items.map((item, i) => (
                    <div key={i} className="card event-card">
                      <div className="card-header">
                        <span className="icon">{item.icon}</span>
                        <h4>{item.title}</h4>
                      </div>
                      <div className="card-content">
                        {item.date && <p><strong>📅 Date:</strong> {item.date}</p>}
                        {item.time && <p><strong>🕐 Time:</strong> {item.time}</p>}
                        {item.venue && <p><strong>📍 Venue:</strong> {item.venue}</p>}
                        {item.organizer && <p><strong>🎯 Organizer:</strong> {item.organizer}</p>}
                        {item.category && <p><strong>🏷️ Category:</strong> {item.category}</p>}
                        {item.capacity && <p><strong>👥 Capacity:</strong> {item.capacity}</p>}
                        {item.duration && <p><strong>⏱️ Duration:</strong> {item.duration} hours</p>}
                        {item.status && <p><strong>✅ Status:</strong> {item.status}</p>}
                        {item.description && <p className="description">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Clubs */}
              {section.type === 'clubs' && (
                <div className="items-grid">
                  {section.items.map((item, i) => (
                    <div key={i} className="card club-card">
                      <div className="card-header">
                        <span className="icon">{item.icon}</span>
                        <h4>{item.name}</h4>
                      </div>
                      <div className="card-content">
                        {item.description && <p className="description">{item.description}</p>}
                        {item.category && <p><strong>🏷️ Category:</strong> {item.category}</p>}
                        {item.memberCount && <p><strong>👥 Members:</strong> {item.memberCount}</p>}
                        {item.president && <p><strong>👤 President:</strong> {item.president}</p>}
                        {item.coordinator && <p><strong>👨‍🏫 Coordinator:</strong> {item.coordinator}</p>}
                        {item.meetingSchedule && <p><strong>📅 Meets:</strong> {item.meetingSchedule}</p>}
                        {item.contactEmail && <p><strong>📧 Email:</strong> {item.contactEmail}</p>}
                        {item.status && <p><strong>✅ Status:</strong> {item.status}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Facilities */}
              {section.type === 'facilities' && (
                <div className="items-grid">
                  {section.items.map((item, i) => (
                    <div key={i} className="card facility-card">
                      <div className="card-header">
                        <span className="icon">{item.icon}</span>
                        <h4>{item.name}</h4>
                      </div>
                      <div className="card-content">
                        {item.type && <p><strong>🏢 Type:</strong> {item.type}</p>}
                        {item.location && <p><strong>📍 Location:</strong> {item.location}</p>}
                        {item.hours && <p><strong>🕐 Hours:</strong> {item.hours}</p>}
                        {item.capacity && <p><strong>👥 Capacity:</strong> {item.capacity}</p>}
                        {item.amenities && item.amenities.length > 0 && (
                          <div className="amenities">
                            <strong>✨ Amenities:</strong>
                            <div className="tags">
                              {item.amenities.map((amenity, j) => (
                                <span key={j} className="tag">{amenity}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FAQs */}
              {section.type === 'faqs' && (
                <div className="faqs-list">
                  {section.items.map((item, i) => (
                    <div key={i} className="faq-item">
                      <div className="faq-question">
                        <span className="icon">{item.icon}</span>
                        <strong>{item.question}</strong>
                        {item.category && <span className="category">{item.category}</span>}
                      </div>
                      <div className="faq-answer">
                        {item.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Academic Info */}
              {section.type === 'academic' && (
                <div className="academic-list">
                  {section.items.map((item, i) => (
                    <div key={i} className="academic-item">
                      <div className="academic-title">
                        <span className="icon">{item.icon}</span>
                        <h4>{item.title}</h4>
                      </div>
                      <div className="academic-content">
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Canteen Items */}
              {section.type === 'canteen' && (
                <div className="items-grid">
                  {section.items.map((item, i) => (
                    <div key={i} className="card canteen-card">
                      <div className="card-header">
                        <span className="icon">{item.icon}</span>
                        <h4>{item.name}</h4>
                      </div>
                      <div className="card-content">
                        {item.category && <p><strong>🏷️ Category:</strong> {item.category}</p>}
                        {item.price && <p><strong>💰 Price:</strong> ₹{item.price}</p>}
                        {item.availability && <p><strong>✅ Available:</strong> {item.availability}</p>}
                        {item.calories && <p><strong>🔥 Calories:</strong> {item.calories}</p>}
                        {item.vegetarian !== undefined && (
                          <p><strong>🥗 Vegetarian:</strong> {item.vegetarian ? 'Yes ✓' : 'No'}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
