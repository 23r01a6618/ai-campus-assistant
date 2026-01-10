const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('🔍 Gemini API Key configured:', !!GEMINI_API_KEY);

/**
 * Generate AI response using Gemini with campus context
 */
async function generateResponse(userQuery, campusData) {
  try {
    if (!GEMINI_API_KEY) {
      console.log('📝 No API key, using fallback responses');
      return generateDemoResponse(userQuery, campusData);
    }

    console.log('🤖 Calling Gemini API...');
    
    const prompt = buildPrompt(userQuery, campusData);

    // Use valid Gemini models from the API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      console.log('  Trying gemini-2.0-flash model...');
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      console.log('📤 Sending request to Gemini API...');
      
      const response = await axios.post(url, requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      console.log('📥 Response received');

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = response.data.candidates[0].content.parts[0].text;
        console.log('✅ Gemini API success - response text received');
        return text;
      }

      console.log('⚠️ Response format unexpected:', JSON.stringify(response.data).substring(0, 200));
      return generateDemoResponse(userQuery, campusData);

    } catch (err) {
      const status = err.response?.status;
      const errorMsg = err.response?.data?.error?.message || err.message;
      
      console.log(`  ⚠️ gemini-pro failed with status ${status}`);
      console.error(`  Error: ${errorMsg}`);
      
      // Log first 500 chars of error response for debugging
      if (err.response?.data) {
        console.error('  Full error:', JSON.stringify(err.response.data).substring(0, 500));
      }
      
      return generateDemoResponse(userQuery, campusData);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return generateDemoResponse(userQuery, campusData);
  }
}

/**
 * Generate a demo response when Gemini API is unavailable
 */
function generateDemoResponse(userQuery, campusData) {
  const lowerQuery = userQuery.toLowerCase();
  
  // If campus data is provided, use it intelligently
  if (campusData && Object.keys(campusData).length > 0) {
    if (campusData.events && campusData.events.length > 0) {
      const eventNames = campusData.events.map(e => e.title || e.name).join(', ');
      return `📅 Here are the upcoming events matching your query: ${eventNames}. These events offer great opportunities to engage with the campus community and meet fellow students. Check the event details above for dates, times, and locations!`;
    }
    if (campusData.clubs && campusData.clubs.length > 0) {
      const clubNames = campusData.clubs.map(c => c.name).join(', ');
      return `🎓 Great clubs on campus: ${clubNames}. These clubs are actively looking for members! You can join any club to meet people with similar interests and develop new skills.`;
    }
    if (campusData.facilities && campusData.facilities.length > 0) {
      const facilityNames = campusData.facilities.map(f => f.name || f.facility_name).join(', ');
      return `🏢 Here are the facilities available: ${facilityNames}. These are great resources for your academic and extracurricular needs. Visit the Admin Dashboard for more details about locations and opening hours.`;
    }
    if (campusData.canteen_items && campusData.canteen_items.length > 0) {
      const items = campusData.canteen_items.slice(0, 3).map(c => \`\${c.name || c.itemName} ($\${c.price || 'N/A'})\`).join(', ');
      return \`🍽️ Here are some items from our canteen: \${items}, and more! Check the menu above for complete options and availability.\`;
    }
    if (campusData.academic_info && campusData.academic_info.length > 0) {
      return `📚 Here's important academic information: ${campusData.academic_info.map(a => a.info || a.description).join('; ')} Contact the Academic Office for more details!`;
    }
  }

  // General knowledge responses
  if (lowerQuery.includes('nlp') || lowerQuery.includes('natural language')) {
    return `🤖 NLP (Natural Language Processing) is a field of artificial intelligence focused on how computers understand and process human language. It combines linguistics and machine learning to enable tasks like translation, sentiment analysis, chatbots, and text summarization. Key techniques include tokenization, named entity recognition, and deep learning models like transformers. NLP powers many everyday applications, from your phone's autocomplete to virtual assistants like me!`;
  }

  if (lowerQuery.includes('machine learning') || lowerQuery.includes('ai')) {
    return `🧠 Machine Learning is a subset of AI where systems learn patterns from data instead of being explicitly programmed. Key types include supervised learning (with labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through rewards). Applications include image recognition, recommendations, fraud detection, and predictive analytics. Modern approaches use deep neural networks and transformers for impressive results!`;
  }

  if (lowerQuery.includes('python') || lowerQuery.includes('programming')) {
    return `💻 Python is a versatile, beginner-friendly programming language widely used in data science, web development, automation, and AI. Key libraries include NumPy (numerical computing), Pandas (data analysis), and TensorFlow (machine learning). Python's simple syntax makes it great for learning, while its powerful libraries make it suitable for professional applications. Start with basics like variables and functions, then explore specialized domains!`;
  }

  if (lowerQuery.includes('database') || lowerQuery.includes('sql')) {
    return `🗄️ Databases store and organize data efficiently. SQL databases (like MySQL, PostgreSQL) use structured tables with relationships, while NoSQL databases (like MongoDB, Firebase) offer flexible document storage. Key concepts include tables, queries, indexes, and transactions. Databases are essential for applications that need to store, retrieve, and analyze data at scale. Learn SQL fundamentals, then explore different database types based on your needs!`;
  }

  // Study/academic help
  if (lowerQuery.includes('study') || lowerQuery.includes('exam') || lowerQuery.includes('homework')) {
    return `📚 Study Tips for Success:\n1. **Active Recall**: Test yourself rather than just re-reading\n2. **Spaced Repetition**: Review material at increasing intervals\n3. **Study Groups**: Explain concepts to others - teaching helps learning\n4. **Practice Problems**: Work through examples and past papers\n5. **Time Management**: Break study into focused 25-50 minute sessions\n6. **Sleep & Exercise**: Rest and physical activity boost memory and focus\n7. **Resources**: Use textbooks, online courses (Coursera, Khan Academy), and campus tutoring\n\nRemember: Consistency beats cramming every time!`;
  }

  if (lowerQuery.includes('how') && lowerQuery.includes('learn')) {
    return `🎯 How to Learn Effectively:\n1. **Set Clear Goals**: Know what you want to achieve\n2. **Active Learning**: Engage with material, don't just consume\n3. **Teach Others**: Explaining concepts solidifies your understanding\n4. **Apply Knowledge**: Work on real projects and problems\n5. **Get Feedback**: Learn from mistakes and corrections\n6. **Stay Curious**: Ask questions and explore deeply\n7. **Track Progress**: Monitor what you're learning and improving\n\nThe best learning comes from practice and persistence!`;
  }

  if (lowerQuery.includes('career') || lowerQuery.includes('job')) {
    return `💼 Career Development Tips:\n1. **Build Skills**: Focus on both technical and soft skills\n2. **Network**: Connect with professionals in your field\n3. **Projects**: Build a portfolio of real work\n4. **Internships**: Gain practical experience early\n5. **Certifications**: Get recognized credentials\n6. **Interview Prep**: Practice coding problems and behavioral interviews\n7. **LinkedIn**: Maintain a professional online presence\n\nStart early, stay consistent, and keep learning!`;
  }

  // Campus-specific help
  if (lowerQuery.includes('event')) {
    return `📅 Looking for events? Check the events section to see what's happening on campus! From festivals to workshops, there's always something interesting. Events are great ways to meet people, learn new things, and have fun. Don't miss out!`;
  } else if (lowerQuery.includes('club')) {
    return `🎓 We have diverse clubs on campus covering academics, sports, arts, culture, and more. Joining a club helps you meet people with shared interests, develop skills, and have fun. Visit the clubs section to see all options and reach out to club leaders!`;
  } else if (lowerQuery.includes('facility') || lowerQuery.includes('library') || lowerQuery.includes('gym')) {
    return `🏢 Our campus has excellent facilities including libraries, sports complexes, laboratories, computer labs, cafeterias, and more. Check the facilities section for locations, hours, and what each offers. Most facilities require a student ID for access.`;
  } else if (lowerQuery.includes('food') || lowerQuery.includes('canteen') || lowerQuery.includes('menu')) {
    return `🍽️ Our campus canteen serves a variety of food options including vegetarian and non-vegetarian items. Check the canteen menu section for available items, prices, and availability. You can also find information about special dietary options and peak hours!`;
  }

  // Default helpful response
  return `👋 I'm the Campus AI Assistant! I can help you with:\n- **Campus Info**: Events, clubs, facilities, food\n- **Academic Advice**: Study tips, exam prep, course selection\n- **General Knowledge**: Programming, AI, science, technology\n- **Career Help**: Resume tips, interview prep, skill development\n\nWhat would you like to know more about?`;
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
