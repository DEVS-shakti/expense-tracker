import { findCategory } from "./categoryMap";

/**
 * Extracts the date range from the input string.
 */
export const extractDateRange = (input) => {
  const normalized = input.toLowerCase();
  
  if (normalized.includes("today")) return "today";
  if (normalized.includes("yesterday")) return "yesterday";
  if (normalized.includes("this week")) return "this_week";
  if (normalized.includes("last week")) return "last_week";
  if (normalized.includes("this month")) return "this_month";
  if (normalized.includes("last month")) return "last_month";
  if (normalized.includes("this year")) return "this_year";
  
  return "all"; // Default
};

/**
 * Extracts the comparison reference date range.
 * E.g., "compare this week vs last week" -> base=this_week, compareRange=last_week
 */
const extractCompareRange = (input) => {
  const match = input.toLowerCase().match(/vs (last week|last month|this week|this month)/);
  if (match) {
    if (match[1] === "last week") return "last_week";
    if (match[1] === "last month") return "last_month";
    if (match[1] === "this week") return "this_week";
    if (match[1] === "this month") return "this_month";
  }
  return null;
};

/**
 * Parses user input to extract intent type among the advanced operations.
 */
const extractIntent = (input) => {
  const normalized = input.toLowerCase();
  
  // Trend / Comparison triggers
  if (normalized.includes("compare") || normalized.includes("vs ") || normalized.includes("difference")) {
    return "compare"; // trend is handled mostly identically, difference in UI
  }

  // Average triggers
  if (normalized.includes("average") || normalized.includes("avg")) {
    return "average";
  }

  // Grouping triggers
  if (normalized.includes("group by") || normalized.includes("breakdown") || normalized.includes("by category") || normalized.includes("by date")) {
    return "group";
  }

  // Max / Min triggers
  if (normalized.includes("highest") || normalized.includes("max") || normalized.includes("biggest") || normalized.includes("most")) {
    return "max";
  }
  if (normalized.includes("lowest") || normalized.includes("min") || normalized.includes("smallest") || normalized.includes("least")) {
    return "min";
  }

  // Count triggers
  if (normalized.includes("how many") || normalized.includes("count")) {
    return "count";
  }
  
  // Sum/Total triggers
  if (normalized.includes("how much") || normalized.includes("total") || normalized.includes("sum") || normalized.includes("spent") || normalized.includes("spending")) {
    return "sum";
  }
  
  // Search trigger (e.g. search pizza)
  if (normalized.includes("search") || normalized.includes("keyword") || normalized.includes("note contains")) {
    return "search";
  }

  // List/Show triggers
  if (normalized.includes("show") || normalized.includes("list") || normalized.includes("what are") || normalized.includes("get") || normalized.includes("transactions") || normalized.includes("expenses")) {
    return "list";
  }
  
  return "unknown";
};

/**
 * The advanced rule-based parser that handles combinations.
 * @param {string} query
 * @returns {object} Intent Object
 */
export const parseQuery = (query) => {
  const normalizedQuery = query.trim();

  // Handle excluded categories (e.g., "except rent", "excluding food")
  let includePart = normalizedQuery;
  let excludePart = "";
  const excludeRegex = /(?:except|excluding|without|but not)\s+(.+)/i;
  const excludeMatch = normalizedQuery.match(excludeRegex);

  if (excludeMatch) {
    includePart = normalizedQuery.substring(0, excludeMatch.index);
    excludePart = excludeMatch[1];
  }
  
  // Basic category parsing
  const category = findCategory(includePart);
  const excludedCategory = findCategory(excludePart) || (excludePart ? excludePart.trim() : null);
  
  const dateRange = extractDateRange(includePart);
  const compareRange = extractCompareRange(includePart);
  let type = extractIntent(includePart);
  
  // Extract custom search keyword: look for text in quotes, or after the word "search"
  let keyword = null;
  const quoteMatch = includePart.match(/"([^"]+)"/);
  if (quoteMatch) {
    keyword = quoteMatch[1];
  } else if (type === "search") {
    // try to get words after "search" or "keyword"
    const words = includePart.split(/\s+/);
    const searchIdx = words.findIndex(w => w === "search" || w === "keyword");
    if (searchIdx >= 0 && searchIdx + 1 < words.length) {
      keyword = words.slice(searchIdx + 1).join(" ").replace(/(this|last|week|month|today|yesterday|total|sum|list|show|count|max|min|avg|average|group|by|category|date|vs|compare)/gi, "").trim();
    }
  }

  // If no main intent verb detected, deduce from context
  if (type === "unknown") {
    if (category || dateRange !== "all" || keyword) {
      type = "list";
    } else {
      type = "fallback";
    }
  }

  // Determine if grouping is by date or category
  let groupBy = "category"; // default
  if (type === "group" && (includePart.includes("by date") || includePart.includes("by day"))) {
    groupBy = "date";
  }

  // Determine an average modifier
  let averageBy = "transaction";
  if (type === "average" && includePart.includes("per day")) {
    averageBy = "day";
  }

  return {
    type,        // "sum" | "list" | "count" | "max" | "min" | "group" | "average" | "compare" | "search" | "fallback"
    category,    
    rawCategory: includePart.trim(),
    excludedCategory,
    rawExcludedCategory: excludePart ? excludePart.trim() : null,
    dateRange,   // "today", "this_week", "all", etc.
    compareRange,
    keyword,     // string | null
    groupBy,     // "category" | "date"
    averageBy,   // "transaction" | "day"
    original: query
  };
};
