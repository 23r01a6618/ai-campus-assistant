/**
 * Campus AI Assistant - Smart Response Engine
 * Generates intelligent responses based on campus data from Firestore
 * No external AI API required - fully self-contained
 */

const { db, isFirebaseInitialized } = require("./firebase");

/**
 * Extract keywords from user query
 */
function extractKeywords(query) {
  const keywords = query.toLowerCase().match(/\b\w+\b/g) || [];
  return keywords;
}

/**
 * Calculate similarity between two strings (Levenshtein distance)
 */
function getStringSimilarity(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate edit distance between strings
 */
function getEditDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * Fetch and search campus data
 */
async function searchCampusData(keywords) {
  if (!isFirebaseInitialized) {
    return { events: [], clubs: [], facilities: [], faqs: [], academic_info: [] };
  }

  try {
    const results = {
      events: [],
      clubs: [],
      facilities: [],
      faqs: [],
      academic_info: [],
      canteen_items: [],
    };

    // Search events
    if (keywords.some(k => ["event", "events", "happening", "coming"].includes(k))) {
      const eventsSnap = await db.collection("events").limit(10).get();
      results.events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Search clubs
    if (keywords.some(k => ["club", "clubs", "society", "group"].includes(k))) {
      const clubsSnap = await db.collection("clubs").limit(10).get();
      results.clubs = clubsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Search facilities
    if (keywords.some(k => ["facility", "facilities", "library", "cafeteria", "sports", "lab", "gym"].includes(k))) {
      const facilitiesSnap = await db.collection("facilities").limit(10).get();
      results.facilities = facilitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Search canteen items
    if (keywords.some(k => ["food", "canteen", "menu", "eat", "lunch", "breakfast", "dinner", "coffee", "snack"].includes(k))) {
      const canteenSnap = await db.collection("canteen_items").limit(10).get();
      results.canteen_items = canteenSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Search FAQs - ONLY if explicitly asked (contains "faq" or "question" or similar)
    if (keywords.some(k => ["faq", "faqs", "question", "questions"].includes(k))) {
      const faqsSnap = await db.collection("faqs").limit(10).get();
      results.faqs = faqsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Search academic info
    if (keywords.some(k => ["academic", "semester", "exam", "schedule", "grade", "course"])) {
      const academicSnap = await db.collection("academic_info").limit(10).get();
      results.academic_info = academicSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return results;
  } catch (error) {
    console.error("Error searching campus data:", error);
    return { events: [], clubs: [], facilities: [], faqs: [], academic_info: [] };
  }
}

/**
 * Find best matching items from search results
 */
function findBestMatches(query, results, collection, threshold = 0.3, limit = 3) {
  const keywords = extractKeywords(query);
  const items = results[collection] || [];

  const scored = items.map(item => {
    let score = 0;
    let matchedFields = [];

    // Search in all string fields
    Object.entries(item).forEach(([key, value]) => {
      if (typeof value === "string") {
        keywords.forEach(keyword => {
          const similarity = getStringSimilarity(keyword, value);
          if (similarity > threshold) {
            score += similarity;
            matchedFields.push({ field: key, similarity });
          }
        });
      }
    });

    return { ...item, score, matchedFields };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generate structured response based on query and campus data
 * Returns formatted data objects instead of text
 */
async function generateCampusResponse(userQuery) {
  try {
    const keywords = extractKeywords(userQuery);
    const campusData = await searchCampusData(keywords);
    const results = {
      events: [],
      clubs: [],
      facilities: [],
      faqs: [],
      academic_info: [],
      canteen_items: [],
    };

    // Search events
    if (keywords.some(k => ["event", "events", "happening", "coming", "festival"].includes(k))) {
      results.events = await fetchAndMatchEvents(userQuery);
    }

    // Search clubs
    if (keywords.some(k => ["club", "clubs", "society", "group", "team"].includes(k))) {
      results.clubs = await fetchAndMatchClubs(userQuery);
    }

    // Search facilities
    if (keywords.some(k => ["facility", "facilities", "library", "cafeteria", "sports", "lab", "gym", "where", "location", "place"].includes(k))) {
      results.facilities = await fetchAndMatchFacilities(userQuery);
    }

    // Search academic info
    if (keywords.some(k => ["academic", "semester", "exam", "schedule", "grade", "course", "registration"].includes(k))) {
      results.academic_info = await fetchAndMatchAcademic(userQuery);
    }

    // Search canteen items
    if (keywords.some(k => ["food", "canteen", "menu", "eat", "lunch", "breakfast", "dinner", "coffee", "snack", "item", "price"].includes(k))) {
      results.canteen_items = await fetchAndMatchCanteen(userQuery);
    }

    // Search FAQs - ONLY if explicitly asked for FAQs or questions
    if (keywords.some(k => ["faq", "faqs", "question", "questions"].includes(k))) {
      results.faqs = await fetchAndMatchFAQs(userQuery);
    }

    return results;
  } catch (error) {
    console.error("Error generating campus response:", error);
    return {
      events: [],
      clubs: [],
      facilities: [],
      faqs: [],
      academic_info: [],
      error: "Error processing request",
    };
  }
}

/**
 * Fetch and match events from database
 */
async function fetchAndMatchEvents(query) {
  if (!isFirebaseInitialized) return [];

  try {
    const snapshot = await db.collection("events").get();
    const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return findBestMatches(query, { events: allEvents }, "events", 0.2, 100);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

/**
 * Fetch and match clubs from database
 */
async function fetchAndMatchClubs(query) {
  if (!isFirebaseInitialized) return [];

  try {
    const snapshot = await db.collection("clubs").get();
    const allClubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return findBestMatches(query, { clubs: allClubs }, "clubs", 0.2, 100);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return [];
  }
}

/**
 * Fetch and match facilities from database
 */
async function fetchAndMatchFacilities(query) {
  if (!isFirebaseInitialized) return [];

  try {
    const snapshot = await db.collection("facilities").get();
    const allFacilities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return findBestMatches(query, { facilities: allFacilities }, "facilities", 0.2, 100);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return [];
  }
}

/**
 * Fetch and match academic info from database
 */
async function fetchAndMatchAcademic(query) {
  if (!isFirebaseInitialized) return [];

  try {
    const snapshot = await db.collection("academic_info").get();
    const allAcademic = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return findBestMatches(query, { academic_info: allAcademic }, "academic_info", 0.2, 100);
  } catch (error) {
    console.error("Error fetching academic info:", error);
    return [];
  }
}

/**
 * Fetch and match FAQs from database
 */
async function fetchAndMatchFAQs(query) {
  if (!isFirebaseInitialized) return [];

  try {
    const snapshot = await db.collection("faqs").get();
    const allFAQs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return findBestMatches(query, { faqs: allFAQs }, "faqs", 0.2, 100);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

/**
 * Fetch and match canteen items from database
 */
async function fetchAndMatchCanteen(query) {
  if (!isFirebaseInitialized) return [];

  try {
    const snapshot = await db.collection("canteen_items").get();
    const allItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // If asking for "menu" or "show all", return all items
    const queryLower = query.toLowerCase();
    if (queryLower.includes('menu') || queryLower.includes('show all') || queryLower.includes('all items')) {
      return allItems;
    }
    
    return findBestMatches(query, { canteen_items: allItems }, "canteen_items", 0.2, 100);
  } catch (error) {
    console.error("Error fetching canteen items:", error);
    return [];
  }
}

/**
 * Check if query is asking for menu
 */
function isMenuRequest(query) {
  const menuKeywords = ['menu', 'show all', 'all items', 'list all', 'what do you have', 'canteen items', 'food menu'];
  return menuKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

/**
 * Check if query is asking for specific item details
 */
function isSpecificItemQuery(query) {
  const detailKeywords = ['price', 'cost', 'availability', 'available', 'in stock', 'vegetarian', 'vegan', 'calories', 'how much'];
  return detailKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

/**
 * Find best matching canteen items given a user query
 * For specific item queries, returns only 1-2 top matches
 */
function findCanteenMatches(query, items = [], limit = 5) {
  if (!query || !items || items.length === 0) return [];

  const queryLower = query.toLowerCase();
  const scored = items.map(item => {
    const name = (item.name || item.itemName || '').toString().toLowerCase();
    const desc = (item.description || '').toString().toLowerCase();

    // Check for exact or near-exact name match (highest priority)
    let score = 0;
    
    if (name === queryLower) {
      score = 1.0; // Perfect match
    } else if (name.includes(queryLower)) {
      score = 0.95; // Contains exact query
    } else if (queryLower.includes(name) && name.length > 2) {
      score = 0.85; // Query contains item name
    } else {
      // Score using string similarity
      const nameScore = name ? getStringSimilarity(queryLower, name) : 0;
      const descScore = desc ? getStringSimilarity(queryLower, desc) : 0;
      score = Math.max(nameScore, descScore);
    }

    return { ...item, score, name };
  });

  // For specific item queries (not "menu"), return only top 1 match
  const isGeneralQuery = queryLower.includes('menu') || queryLower.includes('all');
  const resultLimit = isGeneralQuery ? limit : 1;

  const results = scored
    .filter(i => i.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, resultLimit);

  // If no good matches found, try substring match on name
  if (results.length === 0) {
    const substrMatches = items.filter(it => {
      const n = (it.name || it.itemName || '').toString().toLowerCase();
      return n && queryLower.split(/\s+/).some(tok => tok.length > 2 && n.includes(tok));
    }).slice(0, resultLimit);

    return substrMatches;
  }

  return results;
}

module.exports = { generateCampusResponse, isMenuRequest, isSpecificItemQuery, findCanteenMatches };
