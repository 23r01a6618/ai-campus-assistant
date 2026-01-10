# Setup Guide - Campus AI Assistant

## Prerequisites

- Node.js 16+ and npm
- Firebase account (free tier available)
- Google Gemini API key
- VS Code (recommended)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name (e.g., "campus-ai")
4. Skip Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Services

1. **Firestore Database:**
   - Go to Build → Firestore Database
   - Click "Create database"
   - Start in test mode (for development)
   - Choose your region
   - Click "Enable"

2. **Authentication:**
   - Go to Build → Authentication
   - Click "Get started"
   - Enable Email/Password provider
   - (Optional) Enable other providers (Google, etc.)

3. **Get Web Config:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click the Web icon to create a web app
   - Copy the Firebase config:
     ```javascript
     {
       apiKey: "YOUR_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
     }
     ```

### 1.3 Get Service Account (Backend)

1. Go to Project Settings
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file
5. Keep it secure! Don't commit to git.

## Step 2: Get Google Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create a new project or select existing
4. Copy your API key
5. Enable Generative Language API

## Step 3: Environment Setup

### 3.1 Root .env

```bash
# Copy template
cp .env.example .env

# Edit .env with your actual values:
```

**Frontend variables** (copy from Firebase web config):
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Backend variables** (from service account JSON):
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key_with_newlines_escaped
FIREBASE_CLIENT_EMAIL=your_client_email@iam.gserviceaccount.com
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
```

### 3.2 Copy .env to Backend

```bash
# Create .env in backend folder
cp .env backend/.env
```

## Step 4: Install Dependencies

```bash
# Navigate to project root
cd ai-ass-project

# Install all dependencies
npm run install:all

# Or install separately:
cd frontend && npm install
cd ../backend && npm install
```

## Step 5: Add Admin User

To grant admin privileges to your account:

### Option 1: Firebase Console

1. Go to Firebase Console → Build → Authentication
2. Find your user
3. Edit Custom Claims (requires Firebase CLI or script)

### Option 2: Use Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
firebase auth:export ./accounts.json --project your-project-id

# Use Firebase Admin SDK to set claims
```

### Option 3: Create Claims Script

Create `scripts/set-admin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../backend/service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'your-project-id'
});

admin.auth().setCustomUserClaims('user-uid', { admin: true })
  .then(() => {
    console.log('✅ Admin privileges granted');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
```

Then run:
```bash
node scripts/set-admin.js
```

## Step 6: Run Development Servers

```bash
# From project root
npm run dev

# Or run separately in two terminals:
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:5000
```

## Step 7: Create Sample Data

### Using Firebase Console

1. Go to Firestore Database
2. Create collection: `events`
3. Add sample documents with this structure:

```json
{
  "title": "Welcome Event",
  "description": "Get to know the campus",
  "date": "2024-02-20",
  "time": "3:00 PM",
  "venue": "Main Hall",
  "organizer": "Student Committee",
  "category": "general",
  "status": "upcoming"
}
```

4. Repeat for other collections: `clubs`, `faqs`, `facilities`, `academic_info`

### Using Admin Dashboard (In-App)

1. Open http://localhost:5173
2. Login with your account
3. Click "Admin" tab
4. Select collection and click "Add New"
5. Fill in the form and save

## Step 8: Test the Application

### Test Chat Interface

1. Open http://localhost:5173
2. Login with your email/password
3. Try asking: "What events are happening?"
4. Should receive AI response with campus data

### Test Admin Dashboard

1. Make sure you're logged in as admin
2. Click "Admin" tab
3. View, create, edit, or delete documents

## Troubleshooting

### Firebase Connection Error

**Error:** "Firebase initialization error"

**Solution:**
- Check .env variables are correct
- Verify firebaseConfig in `frontend/src/services/firebase.js`
- Check Firebase Console → Project Settings for correct values

### Gemini API Error

**Error:** "Failed to generate AI response"

**Solution:**
- Verify `GEMINI_API_KEY` is correct
- Check API is enabled in Google Cloud Console
- Ensure key has permission to access Generative Language API

### CORS Error

**Error:** "Access to XMLHttpRequest blocked"

**Solution:**
- Frontend proxy should work at http://localhost:5173
- Ensure backend is running on http://localhost:5000
- Check vite.config.js proxy settings

### Authentication Issues

**Error:** "Invalid or expired token"

**Solution:**
- Clear browser cache/cookies
- Logout and login again
- Check token expiry (usually 1 hour)
- Verify Firebase auth is enabled

## Deployment

### Option 1: Firebase Hosting (Recommended for MVP)

```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

### Option 2: Cloud Run (Backend)

```bash
firebase init functions
firebase deploy --only functions
```

### Option 3: Heroku / Vercel / AWS

Refer to respective platform documentation

## Next Steps

1. Add more sample data
2. Customize system prompt in `backend/src/utils/gemini.js`
3. Implement feedback collection (thumbs up/down)
4. Set up analytics
5. Configure production security rules

## Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Gemini API Guide](https://ai.google.dev/tutorials)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Support

For issues:
1. Check browser console for errors (F12)
2. Check backend terminal for error logs
3. Verify all environment variables
4. Test API endpoints with Postman/curl
5. Check Firebase Console for data
