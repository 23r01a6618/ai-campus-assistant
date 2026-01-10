const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI response using Gemini with campus context
 * @param {string} userQuery - User's question
 * @param {Object} campusData - Relevant campus information
 * @returns {Promise<string>} - AI-generated response
 */
async function generateResponse(userQuery, campusData) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.4, // Slightly higher for more natural responses
      }
    });

    const prompt = buildPrompt(userQuery, campusData);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Gemini API error:', error.message);
    
    // Fallback: Return a demo response if Gemini API fails
    console.log('📝 Using demo response mode (Gemini API unavailable)');
    return generateDemoResponse(userQuery, campusData);
  }
}

/**
 * Generate a demo response when Gemini API is unavailable
 */
function generateDemoResponse(userQuery, campusData) {
  const lowerQuery = userQuery.toLowerCase();
  
  // Check for common keywords
  if (lowerQuery.includes('event')) {
    return "🎉 We have several exciting events coming up! To see the full list, please add events through the Admin Dashboard. Currently in demo mode - Gemini API needs proper authentication.";
  } else if (lowerQuery.includes('club')) {
    return "🎓 We have many clubs on campus including Robotics, Tech, Sports, and Cultural clubs. Check the Admin Dashboard to view or add more clubs.";
  } else if (lowerQuery.includes('facility') || lowerQuery.includes('library')) {
    return "📚 Our campus has a central library, computer labs, gym, and cafeteria. Visit the Admin Dashboard to explore facility details.";
  } else if (lowerQuery.includes('exam') || lowerQuery.includes('registration')) {
    return "📝 For exam registration and academic information, please visit the Admin Dashboard or contact the Academic Office.";
  } else {
    return "👋 Thanks for your question: '" + userQuery + "'. I'm running in demo mode. To get AI-powered responses, please verify your Gemini API key in the .env file. You can still manage campus data through the Admin Dashboard.";
  }
}

/**
 * Build prompt with campus context - Enhanced with Gemini capabilities
 */
function buildPrompt(userQuery, campusData) {
  let dataString = "";
  
  if (campusData && Object.keys(campusData).length > 0) {
    dataString = "CAMPUS DATA:\n";
    Object.entries(campusData).forEach(([collection, items]) => {
      if (items && items.length > 0) {
        dataString += `\n${collection.toUpperCase()}:\n`;
        items.forEach(item => {
          // Format items nicely based on type
          if (collection === 'canteen_items') {
            dataString += `- ${item.name || item.itemName || 'Unknown'}: $${item.price || 'N/A'} | Availability: ${item.availability || 'N/A'} | Vegetarian: ${item.vegetarian ? 'Yes' : 'No'}\n`;
          } else if (collection === 'events') {
            dataString += `- ${item.title || item.name || 'Unknown'} on ${item.date || 'TBD'} at ${item.time || ''} in ${item.venue || 'TBD'}\n`;
          } else if (collection === 'clubs') {
            dataString += `- ${item.name || 'Unknown'}: ${item.description || ''} | Contact: ${item.contactEmail || 'N/A'}\n`;
          } else {
            dataString += `- ${JSON.stringify(item).substring(0, 200)}...\n`;
          }
        });
      }
    });
  } else {
    dataString = "No specific campus data found to reference.";
  }

  return `You are an intelligent and helpful AI assistant for our campus community.

YOUR ROLE:
- Provide helpful, accurate information about campus facilities, events, clubs, food, and academic matters
- Use the campus data provided below as your knowledge base
- Give friendly, conversational responses (not robotic)
- For food/menu queries: Be descriptive about items, mention prices and availability
- For specific item queries: Extract relevant details and present them clearly

CAMPUS DATA:
${dataString}

USER QUESTION: ${userQuery}

INSTRUCTIONS:
1. Answer based primarily on the provided campus data
2. Be helpful and conversational while remaining factual
3. For menu/food items: Format nicely with prices and availability clearly shown
4. For specific item queries (price, availability): Provide direct, clear answers
5. If information is not available, politely suggest what you can help with
6. Keep responses friendly and concise (2-4 sentences typically)
7. Use relevant emojis to make responses more engaging

RESPONSE:`;
}

module.exports = { generateResponse };
