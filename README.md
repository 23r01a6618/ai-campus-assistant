# AI Campus Assistant

A 24/7 AI-powered chat system that centralizes campus information (events, clubs, policies, facilities) into one intelligent platform.

## Deployment Link
- https://ai-campus-assistant-ysow.onrender.com

## 📋 Project Overview

- **Frontend**: React + Vite (Fast development)
- **Backend**: Node.js + Express (API & AI Integration)
- **Database**: Firebase Firestore (Structured data)
- **AI**: Google Gemini 1.5 Flash (Context-aware responses)
- **Authentication**: Firebase Auth

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase account
- Google Gemini API key

### Installation

1. Clone and setup:
```bash
cd ai-ass-project
npm run install:all
```

2. Create `.env` file in root (copy from `.env.example`):
```bash
cp .env.example .env
# Then fill in your actual API keys
```

3. Configure Firebase:
   - Create Firebase project at https://console.firebase.google.com
   - Enable Firestore, Authentication
   - Download service account key for backend
   - Copy web config to frontend `.env`

4. Run development servers:
```bash
npm run dev
# Or run separately:
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:5000
```

## 📁 Project Structure

```
ai-ass-project/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/   # Chat, Admin Dashboard, etc.
│   │   ├── pages/
│   │   ├── services/     # Firebase, API calls
│   │   └── App.jsx
│   └── package.json
├── backend/              # Express + Node.js
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Business logic
│   │   ├── utils/        # Gemini, context retrieval
│   │   └── server.js
│   └── package.json
├── docs/                 # Documentation
└── README.md
```

## 🔑 Key Features

### Chat Interface
- Natural language queries
- Real-time AI responses
- Message history
- Mobile-responsive design

### Admin Dashboard
- CRUD operations for campus data
- Multiple collections (events, clubs, faqs, facilities, academic_info)
- User role management
- Activity logging

### AI Integration
- Context-aware responses using campus data
- Smart keyword extraction
- Rate limiting to prevent abuse
- Caching for frequent queries

## 📊 Database Schema

See `docs/DATABASE_SCHEMA.md` for detailed Firestore collection structures.

## 🔐 Authentication

- Student: Email/password authentication
- Admin: Role-based access control

## 📈 Success Metrics

- Response Accuracy: >90% correct answers
- Response Time: <3 seconds
- User Satisfaction: Thumbs up/down feedback
- Query Volume: Daily active users tracked

## 🔮 Future Enhancements

1. Voice input (Web Speech API)
2. Multilingual support
3. Push notifications
4. Mobile app (React Native)
5. Analytics dashboard

## 📝 Development Checklist

- [ ] Week 1: Firebase setup + Backend API
- [ ] Week 2: Chat UI + Gemini integration
- [ ] Week 3: Admin dashboard + Testing
- [ ] Week 4: Deployment + User feedback

## 🔗 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Firebase Firestore Guide](https://firebase.google.com/docs/firestore)
- [React + Vite Setup](https://vitejs.dev/guide/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

## 📞 Support

For questions or issues, please refer to documentation or contact admin@campus.edu
