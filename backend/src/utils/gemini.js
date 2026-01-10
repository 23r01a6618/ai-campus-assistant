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
  
  // If there's campus data, provide responses based on that
  if (campusData && Object.keys(campusData).length > 0) {
    if (lowerQuery.includes('event')) {
      return "🎉 We have several exciting events coming up! To see the full list, check the Admin Dashboard.";
    } else if (lowerQuery.includes('club')) {
      return "🎓 We have many clubs on campus including Robotics, Tech, Sports, and Cultural clubs.";
    } else if (lowerQuery.includes('facility') || lowerQuery.includes('library')) {
      return "📚 Our campus has a central library, computer labs, gym, and cafeteria.";
    } else if (lowerQuery.includes('exam') || lowerQuery.includes('registration')) {
      return "📝 For exam registration and academic information, please contact the Academic Office.";
    }
  }
  
  // For general questions, provide helpful responses
  if (lowerQuery.includes('how') || lowerQuery.includes('what') || lowerQuery.includes('when') || lowerQuery.includes('where')) {
    return "👋 Thanks for your question! I'm currently in demo mode with limited capabilities. To get full AI-powered responses, please verify your Gemini API key in the .env file. In the meantime, I can still help you manage campus data through the Admin Dashboard.";
  }
  
  return "👋 I'm here to help! Right now I'm running in demo mode. Enable your Gemini API key to get full AI responses for any question you ask.";
}

/**
 * Build prompt with campus context - Enhanced with Gemini capabilities
 */
function buildPrompt(userQuery, campusData) {
  let dataString = "";
  const hasData = campusData && Object.keys(campusData).length > 0 && Object.values(campusData).some(arr => arr && arr.length > 0);
  
  if (hasData) {
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
  }

  const basePrompt = `You are an intelligent and helpful AI assistant for our campus community. You have knowledge about campus events, clubs, facilities, dining options, and academic matters. You also have general knowledge to answer any questions users ask.

YOUR ROLE:
- Provide helpful, accurate information about campus-related topics using the data below
- If campus data is available, prioritize it in your response
- If no specific campus data matches the query, use your general knowledge to provide helpful information
- Give friendly, conversational responses (not robotic)
- Answer ANY question the user asks, whether campus-related or general knowledge

${hasData ? `AVAILABLE CAMPUS DATA:
${dataString}

INSTRUCTIONS:
1. If the user's question relates to the campus data above, use that information
2. If the campus data doesn't answer the question, provide general knowledge-based answers
3. Be helpful, accurate, and conversational while remaining factual
4. For menu/food items: Format nicely with prices and availability clearly shown
5. For specific item queries (price, availability): Provide direct, clear answers
6. Keep responses friendly and concise (2-4 sentences typically)
7. Use relevant emojis to make responses more engaging` : `INSTRUCTIONS:
1. The user is asking a question that isn't specifically about this campus's database
2. Use your general knowledge to provide a helpful, accurate answer
3. Be friendly, conversational, and informative
4. If the question is somewhat campus-related (like "how to study effectively"), provide practical advice
5. Keep responses friendly and concise (2-4 sentences typically)
6. Use relevant emojis to make responses more engaging`}

USER QUESTION: ${userQuery}

RESPONSE:`;

  return basePrompt;
}

module.exports = { generateResponse };
