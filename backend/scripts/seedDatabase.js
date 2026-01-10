/**
 * Seed Firestore database with sample campus data
 * Run with: node scripts/seedDatabase.js
 */

const admin = require("firebase-admin");
const dotenv = require("dotenv");

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

// Sample data
const sampleData = {
  events: [
    {
      name: "TechFest 2026",
      date: "2026-02-15",
      time: "10:00 AM - 5:00 PM",
      location: "Main Auditorium",
      description: "Annual technology festival with workshops, competitions, and demos",
      category: "Technical",
    },
    {
      name: "Annual Sports Day",
      date: "2026-02-20",
      time: "8:00 AM - 4:00 PM",
      location: "Sports Ground",
      description: "Inter-departmental sports competitions",
      category: "Sports",
    },
    {
      name: "Campus Recruitment Drive",
      date: "2026-03-01",
      time: "9:00 AM - 3:00 PM",
      location: "Convention Center",
      description: "Meet recruiters from top tech companies",
      category: "Career",
    },
    {
      name: "Cultural Fest",
      date: "2026-03-10",
      time: "6:00 PM - 10:00 PM",
      location: "Open Air Theatre",
      description: "Celebrate diverse cultures with performances and food",
      category: "Cultural",
    },
  ],
  clubs: [
    {
      name: "Robotics Club",
      description: "Build and compete with robots",
      members: 45,
      head: "Ravi Kumar",
      email: "robotics@campus.edu",
      meetingDay: "Wednesday",
    },
    {
      name: "Coding Club",
      description: "Learn programming and solve coding challenges",
      members: 120,
      head: "Sarah Chen",
      email: "coding@campus.edu",
      meetingDay: "Monday",
    },
    {
      name: "Debate Society",
      description: "Improve public speaking and debating skills",
      members: 35,
      head: "Priya Singh",
      email: "debate@campus.edu",
      meetingDay: "Thursday",
    },
    {
      name: "Photography Club",
      description: "Capture and share photography experiences",
      members: 50,
      head: "Alex Johnson",
      email: "photography@campus.edu",
      meetingDay: "Friday",
    },
  ],
  facilities: [
    {
      name: "Central Library",
      type: "Library",
      capacity: 500,
      hours: "8:00 AM - 10:00 PM",
      location: "Building A, 1st Floor",
      amenities: ["WiFi", "Study Rooms", "Computer Lab"],
    },
    {
      name: "Main Cafeteria",
      type: "Dining",
      capacity: 300,
      hours: "7:00 AM - 8:00 PM",
      location: "Building B, Ground Floor",
      amenities: ["Vegetarian", "Non-Vegetarian", "Beverages"],
    },
    {
      name: "Sports Complex",
      type: "Sports",
      capacity: "Unlimited",
      hours: "6:00 AM - 10:00 PM",
      location: "East Campus",
      amenities: ["Basketball Court", "Badminton", "Gym", "Swimming Pool"],
    },
    {
      name: "Computer Lab",
      type: "Lab",
      capacity: 60,
      hours: "8:00 AM - 6:00 PM",
      location: "Building C, 2nd Floor",
      amenities: ["High-Speed Internet", "Software Tools", "Printers"],
    },
  ],
  faqs: [
    {
      question: "How do I register for courses?",
      answer: "Course registration opens at the start of each semester. Visit the Academic Office or log into your student portal.",
      category: "Academic",
    },
    {
      question: "What is the library membership fee?",
      answer: "Library membership is free for all enrolled students. Your student ID serves as your library card.",
      category: "Facilities",
    },
    {
      question: "How can I join a club?",
      answer: "Visit the club room during meeting times or contact the club head directly. Most clubs accept members year-round.",
      category: "Clubs",
    },
    {
      question: "Is there hostel accommodation?",
      answer: "Yes, we have on-campus hostel facilities. Apply through the Student Affairs Office during the allotment period.",
      category: "Accommodation",
    },
    {
      question: "What are exam schedules?",
      answer: "Exam schedules are released 2 weeks before the exam period. Check your student portal or the Academic Office notice board.",
      category: "Academic",
    },
  ],
  academic_info: [
    {
      title: "Semester Dates - 2026",
      content: "Semester 1: Jan 5 - Apr 30\nSemester 2: Jul 1 - Oct 31",
    },
    {
      title: "Exam Schedule",
      content: "Mid-Semester Exams: Week 8\nEnd-Semester Exams: Week 16",
    },
    {
      title: "Academic Calendar",
      content: "Republic Day: Jan 26\nMid-Semester Break: Mar 15-22\nSummer Vacation: May 1 - Jun 30",
    },
    {
      title: "Grade System",
      content: "A (90-100), B (80-89), C (70-79), D (60-69), F (<60)\nGPA Scale: 4.0",
    },
  ],
};

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    for (const [collection, documents] of Object.entries(sampleData)) {
      console.log(`📝 Seeding ${collection}...`);
      
      for (const doc of documents) {
        await db.collection(collection).add({
          ...doc,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      console.log(`✅ Added ${documents.length} documents to ${collection}\n`);
    }

    console.log("🎉 Database seeding complete!");
    console.log("\n📊 Summary:");
    console.log(`- Events: ${sampleData.events.length}`);
    console.log(`- Clubs: ${sampleData.clubs.length}`);
    console.log(`- Facilities: ${sampleData.facilities.length}`);
    console.log(`- FAQs: ${sampleData.faqs.length}`);
    console.log(`- Academic Info: ${sampleData.academic_info.length}`);
    console.log("\n✨ You can now test the chat with real data!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
