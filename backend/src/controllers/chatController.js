const { db, isFirebaseInitialized } = require("../utils/firebase");
const { generateCampusResponse, isMenuRequest, isSpecificItemQuery, findCanteenMatches } = require("../utils/campusAI");
const { createStructuredResponse } = require("../utils/responseFormatter");
const { generateResponse } = require("../utils/gemini");

/**
 * Handle chat messages with Gemini-powered responses
 */
async function handleChat(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be non-empty' });
    }

    // For demo: return a sample response if Firebase is not initialized
    if (!isFirebaseInitialized) {
      return res.json({
        success: true,
        message: message,
        response: "🔧 Demo Mode: Backend is running! To enable full functionality, please add your Firebase service account credentials to the .env file. Your question was: '" + message + "'",
        timestamp: new Date(),
        context: [],
        demoMode: true
      });
    }

    // Fetch relevant context from Firestore
    const campusResults = await generateCampusResponse(message);

    // If the user asked about a specific canteen item (price/availability), narrow to matching item(s)
    if (campusResults.canteen_items && campusResults.canteen_items.length > 0 && isSpecificItemQuery(message)) {
      const matches = findCanteenMatches(message, campusResults.canteen_items, 5);
      if (matches && matches.length > 0) {
        campusResults.canteen_items = matches;
      }
    }

    // Generate AI-powered response using Gemini
    let aiResponse = "";
    const hasResults = Object.values(campusResults).some(arr => arr && arr.length > 0);
    
    if (hasResults) {
      // Build context data for Gemini
      const contextData = {};
      if (campusResults.canteen_items && campusResults.canteen_items.length > 0) {
        contextData.canteen_items = campusResults.canteen_items;
      }
      if (campusResults.events && campusResults.events.length > 0) {
        contextData.events = campusResults.events;
      }
      if (campusResults.clubs && campusResults.clubs.length > 0) {
        contextData.clubs = campusResults.clubs;
      }
      if (campusResults.facilities && campusResults.facilities.length > 0) {
        contextData.facilities = campusResults.facilities;
      }
      if (campusResults.academic_info && campusResults.academic_info.length > 0) {
        contextData.academic_info = campusResults.academic_info;
      }
      if (campusResults.faqs && campusResults.faqs.length > 0) {
        contextData.faqs = campusResults.faqs;
      }

      // Generate Gemini response with context data
      aiResponse = await generateResponse(message, contextData);
    } else {
      // No data found - let Gemini provide helpful guidance
      aiResponse = await generateResponse(message, {});
    }

    // Format into structured response for frontend
    const structuredResponse = createStructuredResponse(message, campusResults);
    
    // Add AI-powered response to the result
    structuredResponse.aiResponse = aiResponse;

    // Store conversation in Firestore
    await db.collection('conversations').add({
      userMessage: message,
      response: structuredResponse,
      aiResponse: aiResponse,
      timestamp: new Date(),
      userId: req.userId || 'anonymous',
    });

    res.json({
      success: true,
      message: message,
      data: structuredResponse,
      aiResponse: aiResponse,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
}

module.exports = { handleChat };
