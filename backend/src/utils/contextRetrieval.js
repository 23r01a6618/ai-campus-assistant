const { db } = require('./firebase');

// Simple keyword extraction
function extractKeywords(query) {
  const stopwords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
    'the', 'to', 'was', 'will', 'with', 'what', 'where', 'when', 'how'
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word))
    .slice(0, 5); // Limit to 5 keywords
}

// Determine which collections to query based on keywords
function determineCollections(keywords) {
  const collections = {
    events: ['event', 'events', 'happening', 'festival', 'program', 'schedule'],
    clubs: ['club', 'clubs', 'organization', 'group', 'society', 'team'],
    faqs: ['faq', 'question', 'answer', 'help', 'how', 'what'],
    facilities: ['facility', 'facilities', 'library', 'room', 'building', 'location', 'campus'],
    academic_info: ['academic', 'exam', 'registration', 'course', 'grades', 'study'],
    canteen_items: ['food', 'canteen', 'menu', 'eat', 'lunch', 'breakfast', 'dinner', 'coffee', 'snack', 'item', 'price']
  };

  const relevantCollections = new Set(['faqs']); // Always include FAQs

  keywords.forEach(keyword => {
    Object.entries(collections).forEach(([collection, relatedKeywords]) => {
      if (relatedKeywords.some(k => k.includes(keyword) || keyword.includes(k))) {
        relevantCollections.add(collection);
      }
    });
  });

  return Array.from(relevantCollections);
}

/**
 * Fetch relevant campus data based on user query
 */
async function getRelevantContext(userQuery) {
  try {
    const keywords = extractKeywords(userQuery);
    const relevantCollections = determineCollections(keywords);

    const contextData = {};
    const promises = relevantCollections.map(async (collection) => {
      try {
        const snapshot = await db
          .collection(collection)
          .limit(10) // Limit results for performance
          .get();

        const data = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });

        if (data.length > 0) {
          contextData[collection] = data;
        }
      } catch (error) {
        console.warn(`Error fetching ${collection}:`, error.message);
      }
    });

    await Promise.all(promises);
    return contextData;
  } catch (error) {
    console.error('Context retrieval error:', error);
    return {};
  }
}

module.exports = {
  extractKeywords,
  determineCollections,
  getRelevantContext
};
