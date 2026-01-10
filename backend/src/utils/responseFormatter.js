/**
 * Response Formatter - Creates structured, beautiful responses
 * Converts raw data into formatted objects for frontend display
 */

/**
 * Format events for display
 */
function formatEventsForDisplay(events) {
  if (!events || events.length === 0) {
    return {
      type: "empty",
      title: "No Events Found",
      message: "No upcoming events match your query. Check back soon!",
    };
  }

  return {
    type: "events",
    title: `📅 Upcoming Events (${events.length} found)`,
    items: events.map(event => ({
      id: event.id,
      title: event.title || event.Event_Name || event.name || "",
      date: event.date || event.Date || "",
      time: event.time || event.Time || "",
      venue: event.venue || event.Venue || event.location || "",
      organizer: event.organizer || event.Organizer || "",
      description: event.description || event.Category || "",
      category: event.category || event.Category || "",
      capacity: event.capacity || event.Participants || 0,
      duration: event.duration || event.Duration_Hours || "",
      status: event.status || event.Status || "upcoming",
      icon: "🎉",
    })),
  };
}

/**
 * Format clubs for display
 */
function formatClubsForDisplay(clubs) {
  if (!clubs || clubs.length === 0) {
    return {
      type: "empty",
      title: "No Clubs Found",
      message: "No clubs match your query. Visit the Admin Dashboard to add clubs!",
    };
  }

  return {
    type: "clubs",
    title: `🎓 Campus Clubs (${clubs.length} found)`,
    items: clubs.map(club => ({
      id: club.id,
      name: club.name,
      description: club.description,
      memberCount: club.memberCount || club.members || 0,
      president: club.president || club.head || "",
      coordinator: club.coordinator || "",
      contactEmail: club.contactEmail || club.email || "",
      meetingSchedule: club.meetingSchedule || club.meetingDay || "",
      category: club.category || "",
      status: club.status || "Active",
      icon: "🎓",
    })),
  };
}

/**
 * Format facilities for display
 */
function formatFacilitiesForDisplay(facilities) {
  if (!facilities || facilities.length === 0) {
    return {
      type: "empty",
      title: "No Facilities Found",
      message: "No facilities match your query.",
    };
  }

  return {
    type: "facilities",
    title: `📍 Campus Facilities (${facilities.length} found)`,
    items: facilities.map(facility => ({
      id: facility.id,
      name: facility.name,
      type: facility.type,
      location: facility.location,
      hours: facility.hours,
      capacity: facility.capacity,
      amenities: facility.amenities || [],
      icon: "📍",
    })),
  };
}

/**
 * Format FAQs for display
 */
function formatFAQsForDisplay(faqs) {
  if (!faqs || faqs.length === 0) {
    return {
      type: "empty",
      title: "No FAQs Found",
      message: "No frequently asked questions match your query.",
    };
  }

  return {
    type: "faqs",
    title: `❓ Frequently Asked Questions (${faqs.length} found)`,
    items: faqs.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      icon: "❓",
    })),
  };
}

/**
 * Format academic info for display
 */
function formatAcademicForDisplay(academic) {
  if (!academic || academic.length === 0) {
    return {
      type: "empty",
      title: "No Academic Info Found",
      message: "No academic information matches your query.",
    };
  }

  return {
    type: "academic",
    title: `📚 Academic Information (${academic.length} found)`,
    items: academic.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      icon: "📚",
    })),
  };
}

/**
 * Format canteen items for display
 */
function formatCanteenForDisplay(items) {
  if (!items || items.length === 0) {
    return {
      type: "empty",
      title: "No Food Items Found",
      message: "No food items match your query. Check the canteen menu!",
    };
  }

  return {
    type: "canteen",
    title: `🍽️ Canteen Menu (${items.length} found)`,
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      availability: item.availability,
      calories: item.calories,
      vegetarian: item.vegetarian,
      icon: "🍽️",
    })),
  };
}

/**
 * Create a comprehensive response with multiple sections
 */
function createStructuredResponse(query, results) {
  const sections = [];

  // Add each type of result found
  if (results.events && results.events.length > 0) {
    sections.push(formatEventsForDisplay(results.events));
  }

  if (results.clubs && results.clubs.length > 0) {
    sections.push(formatClubsForDisplay(results.clubs));
  }

  if (results.facilities && results.facilities.length > 0) {
    sections.push(formatFacilitiesForDisplay(results.facilities));
  }

  if (results.canteen_items && results.canteen_items.length > 0) {
    sections.push(formatCanteenForDisplay(results.canteen_items));
  }

  if (results.faqs && results.faqs.length > 0) {
    sections.push(formatFAQsForDisplay(results.faqs));
  }

  if (results.academic_info && results.academic_info.length > 0) {
    sections.push(formatAcademicForDisplay(results.academic_info));
  }

  // If no results found
  if (sections.length === 0) {
    sections.push({
      type: "empty",
      title: "No Results Found",
      message: `I couldn't find information matching "${query}". Try asking about events, clubs, facilities, food items, or academic schedules.`,
    });
  }

  return {
    query,
    sections,
    timestamp: new Date(),
    totalResults: sections.reduce((sum, s) => sum + (s.items?.length || 0), 0),
  };
}

module.exports = {
  formatEventsForDisplay,
  formatClubsForDisplay,
  formatFacilitiesForDisplay,
  formatFAQsForDisplay,
  formatAcademicForDisplay,
  formatCanteenForDisplay,
  createStructuredResponse,
};
