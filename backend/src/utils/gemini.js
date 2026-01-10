const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

console.log('🔍 Gemini API Key configured:', !!GEMINI_API_KEY);

/**
 * Generate AI response using Gemini with campus context
 * @param {string} userQuery - User's question
 * @param {Object} campusData - Relevant campus information
 * @returns {Promise<string>} - AI-generated response
 */
async function generateResponse(userQuery, campusData) {
  try {
    if (!GEMINI_API_KEY) {
      console.log('📝 No API key, using fallback responses');
      return generateDemoResponse(userQuery, campusData);
    }

    const hasData = campusData && Object.keys(campusData).length > 0 && Object.values(campusData).some(arr => arr && arr.length > 0);
    
    console.log('🤖 Calling Gemini API...');
    
    const prompt = buildPrompt(userQuery, campusData);

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1500
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
      const text = response.data.candidates[0].content.parts[0].text;
      console.log('✅ Gemini API response received');
      return text || "I couldn't generate a response. Please try again.";
    }

    console.log('⚠️ Unexpected response format');
    return generateDemoResponse(userQuery, campusData);

  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    if (error.response?.status === 404) {
      console.error('Model not found - API key may not have proper access');
    }
    console.log('📝 Using fallback mode');
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
    if (lowerQuery.includes('facility') || lowerQuery.includes('facilities')) {
      return "🏫 Our campus has excellent facilities including a modern library, computer labs, sports complex, and cafeteria. For specific facility information, check the Admin Dashboard to see all available facilities and their locations.";
    } else if (lowerQuery.includes('event')) {
      return "🎉 We have several exciting events coming up! Visit the app to see our event calendar with details about dates, times, venues, and organizers.";
    } else if (lowerQuery.includes('club')) {
      return "🎓 We have diverse clubs on campus. Check out our club section to find clubs that match your interests, from academics to sports to arts.";
    } else if (lowerQuery.includes('exam') || lowerQuery.includes('registration')) {
      return "📝 For exam registration and academic information, contact the Academic Office or check the Admin Dashboard for important dates and schedules.";
    }
  }
  
  // For general questions, provide helpful responses based on query type
  if (lowerQuery.includes('how') || lowerQuery.includes('what')) {
    if (lowerQuery.includes('study')) {
      return "📚 Effective study tips: Break topics into manageable chunks, use active recall, take regular breaks, form study groups, and review regularly. Start early and maintain consistency!";
    } else if (lowerQuery.includes('exam')) {
      return "✅ Exam preparation: Create a study schedule, understand key concepts, practice past papers, get adequate sleep before the exam, and manage exam anxiety through deep breathing.";
    } else if (lowerQuery.includes('manage')) {
      return "⏰ Time management: Prioritize tasks by importance, use the Pomodoro technique, minimize distractions, plan your day, and review your progress regularly.";
    }
  }
  
  // Default helpful response
  return "👋 I'm the Campus AI Assistant! I can help you with questions about campus events, clubs, facilities, exams, and general academic advice. What would you like to know?";
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

  const basePrompt = `You are an intelligent and helpful AI assistant for a campus community, similar to Google's Gemini. You should respond naturally, conversationally, and thoughtfully - just like you would in a regular conversation.

${hasData ? `You have access to this campus information:
${dataString}` : ``}

Guidelines:
- Be conversational and natural, not robotic
- Provide detailed, thoughtful answers
- If campus data is relevant, use it; otherwise use your general knowledge
- For academic/study questions: Give practical, actionable tips
- For campus questions: Use the data if available, otherwise provide helpful context
- Think through the answer before responding
- Use simple, clear language
- Include relevant emojis when appropriate
- Don't be overly brief - provide good detail

User Question: ${userQuery}

Please provide a helpful, thoughtful response:`;

  return basePrompt;
}

module.exports = { generateResponse };
