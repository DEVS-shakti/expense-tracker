import { parseQuery } from "../utils/assistantEngine";
import { getDateRange } from "../utils/dateUtils";

/**
 * Filter transactions based on date range, category, and keyword search.
 */
const filterTransactions = (transactions, intent, specificDateRange = null) => {
  let filtered = [...transactions];
  const targetDateRange = specificDateRange || intent.dateRange;

  // 1. Filter by Date Range
  if (targetDateRange && targetDateRange !== "all") {
    const { start, end } = getDateRange(targetDateRange);
    if (start && end) {
      filtered = filtered.filter(t => {
        const tDate = t.date?.toDate ? t.date.toDate() : new Date(t.date || t.timestamp || t.createdAt);
        return tDate >= start && tDate <= end;
      });
    }
  }

  // 2. Filter by Category
  if (intent.category) {
    filtered = filtered.filter(t => 
      t.category && t.category.toLowerCase() === intent.category.toLowerCase()
    );
  }

  // 3. Exclude Categories
  if (intent.excludedCategory || intent.rawExcludedCategory) {
    filtered = filtered.filter(t => {
      if (!t.category) return true;
      const catLower = t.category.toLowerCase();
      const matchExcluded = intent.excludedCategory && catLower === intent.excludedCategory.toLowerCase();
      const matchRawExcluded = intent.rawExcludedCategory && catLower.includes(intent.rawExcludedCategory.toLowerCase());
      return !matchExcluded && !matchRawExcluded;
    });
  }

  // 4. Keyword Search in Description/Notes
  if (intent.keyword) {
    const keywordLower = intent.keyword.toLowerCase();
    filtered = filtered.filter(t => 
      (t.description && t.description.toLowerCase().includes(keywordLower)) ||
      (t.category && t.category.toLowerCase().includes(keywordLower))
    );
  }

  // Ensure default to expense for calculations, unless explicitly asked for list/search
  if (['sum', 'max', 'min', 'average', 'count', 'compare', 'group'].includes(intent.type)) {
    filtered = filtered.filter(t => t.type === 'expense');
  }

  return filtered;
};

const getDayKey = (rawDate) => {
  const d = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate);
  return d.toISOString().split("T")[0];
};

/**
 * Executes an Advanced Smart Assistant Query against an array of transactions.
 * @param {string} query User's natural language input
 * @param {Array} transactions The raw list of all transactions loaded natively
 */
export const executeAssistantQuery = (query, transactions) => {
  if (!query || !transactions) {
    return { type: "fallback", data: null, message: "Please provide a valid query." };
  }

  const intent = parseQuery(query);
  
  if (intent.type === "fallback") {
    return { 
      type: "fallback", 
      data: null, 
      message: "I couldn't quite catch that. Try commands like 'food this week total', 'highest travel expense', or 'compare this month vs last month'."
    };
  }

  // For comparisons, we need two filtered datasets
  if (intent.type === "compare" && intent.compareRange && intent.dateRange !== "all") {
    const currentFiltered = filterTransactions(transactions, intent, intent.dateRange);
    const compareFiltered = filterTransactions(transactions, intent, intent.compareRange);
    
    const currentTotal = currentFiltered.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const compareTotal = compareFiltered.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    
    const diff = currentTotal - compareTotal;
    const diffPercent = compareTotal === 0 ? 100 : ((diff / compareTotal) * 100).toFixed(1);

    return {
      type: "comparison",
      data: {
        currentRange: intent.dateRange,
        compareRange: intent.compareRange,
        currentTotal,
        compareTotal,
        diff,
        diffPercent: parseFloat(diffPercent),
        intent
      }
    };
  }

  const filtered = filterTransactions(transactions, intent);

  // Perform Operations
  switch (intent.type) {
    case "sum": {
      const total = filtered.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
      return { type: "summary", data: { total, count: filtered.length, intent, label: "Total Spent" } };
    }
    
    case "count": {
      const total = filtered.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
      return { type: "summary", data: { total, count: filtered.length, intent, label: "Total Transactions", isCountMode: true } };
    }

    case "max": {
      if (filtered.length === 0) return { type: "summary", data: { total: 0, count: 0, intent, highlightTransaction: null } };
      const maxTransaction = filtered.reduce((prev, current) => (parseFloat(prev.amount) > parseFloat(current.amount)) ? prev : current);
      return { type: "summary", data: { total: parseFloat(maxTransaction.amount) || 0, count: filtered.length, intent, highlightTransaction: maxTransaction, highlightLabel: "Highest Expense" } };
    }

    case "min": {
      if (filtered.length === 0) return { type: "summary", data: { total: 0, count: 0, intent, highlightTransaction: null } };
      const minTransaction = filtered.reduce((prev, current) => (parseFloat(prev.amount) < parseFloat(current.amount)) ? prev : current);
      return { type: "summary", data: { total: parseFloat(minTransaction.amount) || 0, count: filtered.length, intent, highlightTransaction: minTransaction, highlightLabel: "Lowest Expense" } };
    }

    case "average": {
      if (filtered.length === 0) return { type: "summary", data: { total: 0, count: 0, intent, label: `Average (${intent.averageBy})` } };
      let avgTotal = 0;
      const totalSum = filtered.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
      
      if (intent.averageBy === "day") {
        const uniqueDays = new Set(filtered.map(t => getDayKey(t.date || t.timestamp || t.createdAt)));
        avgTotal = uniqueDays.size > 0 ? totalSum / uniqueDays.size : 0;
      } else {
        avgTotal = totalSum / filtered.length;
      }
      
      return { type: "summary", data: { total: avgTotal, count: filtered.length, intent, label: `Avg per ${intent.averageBy}` } };
    }

    case "group": {
      const groups = {};
      filtered.forEach(t => {
        let key = "Other";
        if (intent.groupBy === "category") {
          key = t.category || "Unknown";
        } else if (intent.groupBy === "date") {
          key = getDayKey(t.date || t.timestamp || t.createdAt);
        }
        
        if (!groups[key]) groups[key] = { amount: 0, count: 0 };
        groups[key].amount += (parseFloat(t.amount) || 0);
        groups[key].count += 1;
      });

      const groupedArray = Object.keys(groups).map(k => ({
        label: k,
        amount: groups[k].amount,
        count: groups[k].count
      })).sort((a, b) => b.amount - a.amount); // Descending by amount

      let limitMsg = null;
      if (groupedArray.length > 10) {
        limitMsg = `Showing top 10 of ${groupedArray.length} groups.`;
      }

      return {
        type: "group",
        data: {
          groups: groupedArray.slice(0, 10),
          totalCount: groupedArray.length,
          message: limitMsg,
          intent
        }
      };
    }

    case "search":
    case "list":
    default: {
      const sorted = filtered.sort((a, b) => {
        const da = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.timestamp || a.createdAt);
        const db = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.timestamp || b.createdAt);
        return db - da;
      });
      return {
        type: "list",
        data: {
          transactions: sorted.slice(0, 50),
          count: sorted.length,
          intent
        }
      };
    }
  }
};
