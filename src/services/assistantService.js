import { parseQuery } from "../utils/assistantEngine";
import { getDateRange } from "../utils/dateUtils";

const isGreetingQuery = (query) =>
  /^(hi|hello|hey|yo|hii|howdy|good (morning|afternoon|evening))( there)?[!.?\s]*$/i.test(
    String(query || "").trim(),
  );

const RANGE_PATTERNS = [
  { range: "today", patterns: [/\btoday\b/i] },
  { range: "last_7_days", patterns: [/\brecent\b/i, /\blast 7 days\b/i, /\bpast week\b/i, /\brecently\b/i] },
  { range: "last_30_days", patterns: [/\blast 30 days\b/i, /\bpast month\b/i, /\blatest\b/i] },
  { range: "this_week", patterns: [/\bthis week\b/i] },
  { range: "last_week", patterns: [/\blast week\b/i] },
  { range: "this_month", patterns: [/\bthis month\b/i] },
  { range: "last_month", patterns: [/\blast month\b/i] },
  { range: "this_year", patterns: [/\bthis year\b/i] },
];

const extractRequestedRanges = (query) => {
  const normalized = String(query || "").toLowerCase();
  const ranges = new Set();

  RANGE_PATTERNS.forEach(({ range, patterns }) => {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      ranges.add(range);
    }
  });

  return [...ranges];
};

const isMoneySummaryRequest = (query) =>
  /\b(total|expense|expenses|spend|spends|spent|spending|cost|costs)\b/i.test(
    String(query || ""),
  );

const formatRangeLabel = (rangeType) => {
  switch (rangeType) {
    case "today":
      return "Today";
    case "last_7_days":
      return "Recent 7 days";
    case "last_30_days":
      return "Recent 30 days";
    case "this_week":
      return "This week";
    case "last_week":
      return "Last week";
    case "this_month":
      return "This month";
    case "last_month":
      return "Last month";
    case "this_year":
      return "This year";
    default:
      return rangeType.replaceAll("_", " ");
  }
};

const buildOverviewResponse = (transactions, requestedRanges) => {
  const sections = requestedRanges.map((rangeType) => {
    const { start, end } = getDateRange(rangeType);
    const filtered = transactions.filter((transaction) => {
      const transactionDate = transaction.date?.toDate
        ? transaction.date.toDate()
        : new Date(transaction.date || transaction.timestamp || transaction.createdAt);
      if (!start || !end) return rangeType === "all";
      return transactionDate >= start && transactionDate <= end;
    });

    const expenseTotal = filtered
      .filter((transaction) => transaction.type !== "income")
      .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0);

    return {
      range: rangeType,
      label: formatRangeLabel(rangeType),
      total: expenseTotal,
      count: filtered.filter((transaction) => transaction.type !== "income").length,
    };
  });

  return {
    type: "overview",
    message:
      "Here’s a quick snapshot of the periods you asked for, kept in a human-friendly view.",
    data: {
      title: "Spending overview",
      sections,
      currency: "INR",
    },
    followUps: [
      "Show the biggest category this month",
      "Compare this month with last month",
      "Tell me what I spent recently",
    ],
    confidence: 1,
  };
};

const isChartInsightQuery = (query) =>
  /(\bwhy\b|\bspike\b|\bspiked\b|\bincrease\b|\bincreased\b|\bdecrease\b|\bdecreased\b|\btrend\b|\bchart\b|\bgraph\b|\binsight\b|\bcompare\b|\bbecause\b)/i.test(
    String(query || ""),
  );

const formatPlainAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(Number(amount || 0)));

const getMonthKey = (date) => {
  const d = date?.toDate ? date.toDate() : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const buildCategoryTotalsByMonth = (transactions, monthKey) => {
  const totals = new Map();

  transactions.forEach((txn) => {
    if (txn.type === "income") return;
    const txnMonth = getMonthKey(txn.date || txn.timestamp || txn.createdAt);
    if (txnMonth !== monthKey) return;

    const category = txn.category || "Uncategorized";
    totals.set(category, (totals.get(category) || 0) + Math.abs(parseFloat(txn.amount) || 0));
  });

  return totals;
};

const buildChartInsightResponse = (transactions) => {
  const monthlyTotals = [];
  const monthMap = new Map();

  transactions.forEach((txn) => {
    if (txn.type === "income") return;
    const monthKey = getMonthKey(txn.date || txn.timestamp || txn.createdAt);
    if (!monthKey) return;

    const entry = monthMap.get(monthKey) || { month: monthKey, expense: 0 };
    entry.expense += Math.abs(parseFloat(txn.amount) || 0);
    monthMap.set(monthKey, entry);
  });

  [...monthMap.values()]
    .sort((left, right) => left.month.localeCompare(right.month))
    .forEach((entry) => monthlyTotals.push(entry));

  if (monthlyTotals.length < 2) return null;

  const currentMonth = monthlyTotals[monthlyTotals.length - 1];
  const previousMonth = monthlyTotals[monthlyTotals.length - 2];
  const delta = currentMonth.expense - previousMonth.expense;
  const deltaPercent =
    previousMonth.expense > 0 ? Number(((delta / previousMonth.expense) * 100).toFixed(1)) : null;

  const currentCategories = buildCategoryTotalsByMonth(transactions, currentMonth.month);
  const previousCategories = buildCategoryTotalsByMonth(transactions, previousMonth.month);

  const categoryDeltas = [...new Set([...currentCategories.keys(), ...previousCategories.keys()])]
    .map((category) => {
      const current = currentCategories.get(category) || 0;
      const previous = previousCategories.get(category) || 0;
      return { category, delta: current - previous };
    })
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta));

  const biggestIncrease = categoryDeltas.find((item) => item.delta > 0) || null;
  const biggestDecrease = categoryDeltas.find((item) => item.delta < 0) || null;
  const direction = delta >= 0 ? "up" : "down";

  return {
    type: "answer",
    message: [
      `Your spending is ${direction} by ${formatPlainAmount(delta)} this month compared with last month.`,
      biggestIncrease ? `${biggestIncrease.category} is the main driver.` : "",
      biggestDecrease ? `${biggestDecrease.category} went down, which softened the spike.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    card: {
      kind: "analysis",
      title: "Why this month changed",
      subtitle: `${currentMonth.month} vs ${previousMonth.month}`,
      metrics: [
        { label: "This month", value: formatPlainAmount(currentMonth.expense || 0) },
        { label: "Previous month", value: formatPlainAmount(previousMonth.expense || 0) },
        { label: "Change", value: `${delta >= 0 ? "+" : "-"}${formatPlainAmount(delta)}` },
      ],
      highlights: categoryDeltas.slice(0, 3).map((item) => ({
        label: item.category,
        value: `${item.delta >= 0 ? "+" : "-"}${formatPlainAmount(item.delta)}`,
      })),
      note:
        deltaPercent === null
          ? "Not enough data for a percent comparison yet."
          : `That is ${deltaPercent >= 0 ? "+" : ""}${deltaPercent}% versus the previous month.`,
    },
    data: {
      delta,
      deltaPercent,
      biggestIncrease: biggestIncrease?.category || null,
      biggestDecrease: biggestDecrease?.category || null,
    },
    followUps: ["Compare this month with last month", "Show my recent expenses", "Open the Insights page"],
    confidence: 1,
  };
};

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

  if (isGreetingQuery(query)) {
    return {
      type: "profile",
      message:
        "Hi, I am your assistant here to help you with ExpenseTrack. I can answer questions about your spending, budgets, recent activity, and roommate balances. I was created by Dev Shakti.",
      data: {
        creator: "Dev Shakti",
        githubUrl: "https://github.com/DEVS-shakti",
        githubLabel: "GitHub",
      },
      card: {
        title: "Built by Dev Shakti",
        description:
          "Created and maintained by DEVS-shakti for tracking expenses, budgets, insights, and shared bills.",
        githubLabel: "GitHub",
        githubUrl: "https://github.com/DEVS-shakti",
      },
      followUps: [
        "Show my expense summary for this month",
        "What did I spend recently?",
        "How do I use this website?",
      ],
      confidence: 1,
    };
  }

  const requestedRanges = extractRequestedRanges(query);
  if (isMoneySummaryRequest(query) && requestedRanges.length >= 2) {
    return buildOverviewResponse(transactions, requestedRanges);
  }

  if (isChartInsightQuery(query)) {
    const chartResponse = buildChartInsightResponse(transactions);
    if (chartResponse) {
      return chartResponse;
    }
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
