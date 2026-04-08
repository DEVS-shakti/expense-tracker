export const categoryMap = {
  Food: ["food", "eat", "restaurant", "dining", "lunch", "dinner", "breakfast", "snacks", "groceries", "grocery"],
  Travel: ["travel", "uber", "bus", "train", "flight", "taxi", "cab", "commute", "transport", "fuel", "gas", "petrol"],
  Shopping: ["shopping", "clothes", "shoes", "electronics", "amazon", "mall", "buying"],
  Entertainment: ["entertainment", "movie", "movies", "cinema", "games", "gaming", "concert", "fun", "netflix", "spotify"],
  Bills: ["bills", "utility", "utilities", "electricity", "water", "rent", "internet", "wifi", "phone", "recharge"],
  Health: ["health", "medical", "doctor", "medicine", "pharmacy", "hospital", "clinic", "fitness", "gym"],
  Education: ["education", "school", "college", "tuition", "books", "course", "classes", "learning"],
  Miscellaneous: ["miscellaneous", "other", "general", "misc", "random"]
};

/**
 * Given a set of mapped words, finds the closest canonical category.
 * @param {string} input - The input string to parse.
 * @returns {string|null} The canonical category name or null if none found.
 */
export const findCategory = (input) => {
  const normalizedInput = input.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    // If the category name itself is in the input
    if (normalizedInput.includes(category.toLowerCase())) {
      return category;
    }
    
    // Check all keywords mapped to this category
    for (const keyword of keywords) {
      // Check for whole word match to avoid false positives (e.g. "eat" in "weather")
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalizedInput)) {
        return category;
      }
    }
  }
  
  return null;
};
