# Database Schema - Firestore Collections

## Overview
The Firestore database uses 5 main collections to store campus information that the AI assistant uses to answer queries.

---

## 1. Events Collection

**Path:** `/events/{eventId}`

Stores information about campus events, seminars, workshops, and activities.

### Document Structure:
```json
{
  "title": "string - Event name",
  "description": "string - Detailed description",
  "date": "string - Date (YYYY-MM-DD)",
  "time": "string - Start time (HH:MM AM/PM)",
  "venue": "string - Location/Building",
  "organizer": "string - Organization/Club",
  "category": "string - technical|cultural|sports|academic",
  "status": "string - upcoming|ongoing|completed",
  "capacity": "number - Max attendees (optional)",
  "registration_link": "string - URL (optional)",
  "createdAt": "timestamp",
  "createdBy": "string - Admin email",
  "updatedAt": "timestamp (optional)"
}
```

### Example:
```json
{
  "title": "Annual Tech Fest 2024",
  "description": "Celebrate innovation with workshops, competitions, and keynotes",
  "date": "2024-03-15",
  "time": "9:00 AM",
  "venue": "Main Auditorium, Block A",
  "organizer": "Tech Club",
  "category": "technical",
  "status": "upcoming",
  "capacity": 500,
  "registration_link": "https://forms.campus.edu/techfest"
}
```

**Indexes Recommended:**
- Composite: `(status, date)`
- Single: `category`, `date`, `status`

---

## 2. Clubs Collection

**Path:** `/clubs/{clubId}`

Stores information about student clubs, societies, and organizations.

### Document Structure:
```json
{
  "name": "string - Club name",
  "description": "string - What the club does",
  "coordinator": "string - Faculty coordinator name",
  "contactEmail": "string - Club email",
  "contactPhone": "string - Phone (optional)",
  "meetingSchedule": "string - When they meet",
  "location": "string - Room/Building",
  "memberCount": "number - Current members (optional)",
  "joinLink": "string - Registration link (optional)",
  "createdAt": "timestamp",
  "createdBy": "string"
}
```

### Example:
```json
{
  "name": "Robotics Club",
  "description": "Build, compete, and innovate with robots. Open to all skill levels.",
  "coordinator": "Dr. Sarah Smith",
  "contactEmail": "robotics@campus.edu",
  "meetingSchedule": "Every Friday 4:00 PM - 6:00 PM",
  "location": "Engineering Lab 301",
  "memberCount": 45,
  "joinLink": "https://forms.campus.edu/robotics"
}
```

---

## 3. FAQs Collection

**Path:** `/faqs/{faqId}`

Stores frequently asked questions and answers about various campus topics.

### Document Structure:
```json
{
  "question": "string - The question",
  "answer": "string - Detailed answer",
  "category": "string - academic|library|hostel|dining|library|general",
  "keywords": ["array of keywords for search"],
  "helpfulness": "number - 0 (helps track user feedback)",
  "priority": "number - Display priority (1-10)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "updatedBy": "string - Last modified by"
}
```

### Example:
```json
{
  "question": "How do I apply for a library card?",
  "answer": "Visit the main library desk at Block A, ground floor with your student ID and proof of enrollment. The library card is issued on the spot. You can use it to borrow books, access computers, and book study rooms.",
  "category": "library",
  "keywords": ["library", "card", "registration", "books", "access"],
  "priority": 8
}
```

---

## 4. Facilities Collection

**Path:** `/facilities/{facilityId}`

Stores information about campus facilities and resources.

### Document Structure:
```json
{
  "name": "string - Facility name",
  "type": "string - library|cafeteria|gym|medical|study_room|lab",
  "location": "string - Building and room details",
  "hours": "string - Operating hours (e.g., '8 AM - 8 PM')",
  "services": ["array of services offered"],
  "contact": "string - Email or phone",
  "capacity": "number - Max capacity (optional)",
  "accessibility": "string - Wheelchair access info (optional)",
  "createdAt": "timestamp"
}
```

### Example:
```json
{
  "name": "Central Library",
  "type": "library",
  "location": "Block A, Ground Floor",
  "hours": "8:00 AM - 8:00 PM (Weekdays), 10:00 AM - 6:00 PM (Weekends)",
  "services": [
    "Book borrowing",
    "Study rooms",
    "Wi-Fi access",
    "Computer lab",
    "Printing services",
    "Research databases",
    "Quiet zones",
    "Group study areas"
  ],
  "contact": "library@campus.edu",
  "capacity": 200,
  "accessibility": "Wheelchair accessible, elevators available"
}
```

---

## 5. Academic Info Collection

**Path:** `/academic_info/{infoId}`

Stores academic policies, procedures, and important information.

### Document Structure:
```json
{
  "topic": "string - Topic title",
  "content": "string - Detailed information",
  "category": "string - exams|registration|grades|curriculum|scholarships|support",
  "subCategory": "string (optional)",
  "relatedTopics": ["array of related topics"],
  "lastUpdated": "timestamp",
  "updatedBy": "string - Academic office staff",
  "importance": "string - high|medium|low"
}
```

### Example:
```json
{
  "topic": "Exam Registration Process",
  "content": "Students must register for exams two weeks before the exam date. Registration is done through the student portal. Late registration incurs a penalty of 500 rupees. No registrations are accepted after 48 hours before the exam.",
  "category": "exams",
  "subCategory": "registration",
  "lastUpdated": "2024-01-15",
  "updatedBy": "academic@campus.edu",
  "importance": "high",
  "relatedTopics": ["exam schedule", "exam guidelines", "result declaration"]
}
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Anyone can read, only admins can write
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    // Conversations can be written by any authenticated user
    match /conversations/{document=**} {
      allow read: if request.auth.uid == resource.data.userId || request.auth.token.admin == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.token.admin == true;
    }
  }
}
```

---

## Best Practices

### 1. Data Organization
- Keep documents under 100KB
- Use subcollections for large nested data
- Use consistent field naming (camelCase)

### 2. Indexing
- Add composite indexes for common query patterns
- Index on frequently searched fields
- Avoid indexing on high-cardinality fields

### 3. Data Validation
- Validate all data before writing
- Use Firebase security rules
- Enforce required fields in frontend

### 4. Timestamps
- Always include `createdAt` and `updatedAt` timestamps
- Use server timestamps: `FieldValue.serverTimestamp()`
- Track who made changes with `createdBy` and `updatedBy`

### 5. Naming Conventions
- Collection names: lowercase, plural (events, clubs)
- Document IDs: auto-generated by Firestore or meaningful slugs
- Field names: camelCase

---

## Sample Data Upload

To populate your Firestore with sample data:

1. Create documents manually in Firebase Console, OR
2. Use the Admin Dashboard CRUD interface, OR
3. Write a script using Firebase Admin SDK

Example using Node.js Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function uploadSampleData() {
  // Events
  await db.collection('events').add({
    title: 'Tech Workshop',
    description: 'Learn web development',
    date: '2024-02-20',
    time: '2:00 PM',
    venue: 'Lab 105',
    organizer: 'Tech Club',
    category: 'technical',
    status: 'upcoming',
    createdAt: new Date(),
    createdBy: 'admin@campus.edu'
  });
}

uploadSampleData().catch(console.error);
```

---

## Query Examples

### Get all upcoming events
```javascript
db.collection('events')
  .where('status', '==', 'upcoming')
  .orderBy('date')
  .get()
```

### Get clubs in a category
```javascript
db.collection('clubs')
  .where('category', '==', 'technical')
  .get()
```

### Search FAQs by keywords
```javascript
db.collection('faqs')
  .where('keywords', 'array-contains', 'library')
  .get()
```

### Get high-priority academic info
```javascript
db.collection('academic_info')
  .where('importance', '==', 'high')
  .orderBy('lastUpdated', 'desc')
  .limit(10)
  .get()
```

---

## Monitoring & Optimization

- Monitor Firestore usage in Firebase Console
- Set up billing alerts
- Use Firestore Emulator for development
- Index fields that appear in WHERE and ORDER BY clauses
- Limit query results with `.limit()`
- Use pagination for large datasets
