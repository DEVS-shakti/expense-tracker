require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_API_URL =
  process.env.GEMINI_API_URL ||
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_TRANSACTIONS = Number(process.env.ASSISTANT_MAX_TRANSACTIONS || 250);

if (!GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set. Add it to your environment or .env file.");
}

const initializeAdmin = () => {
  if (admin.apps.length > 0) return;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      });
      return;
    } catch (err) {
      console.error("Invalid FIREBASE_SERVICE_ACCOUNT JSON:", err);
      process.exit(1);
    }
  }

  try {
    admin.initializeApp();
  } catch (error) {
    console.warn("Firebase admin initialization fallback failed:", error);
  }
};

initializeAdmin();

const db = admin.firestore();

let fetchFn = globalThis.fetch;
if (!fetchFn) {
  fetchFn = (...args) => import("node-fetch").then((mod) => mod.default(...args));
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const toDate = (value) => {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDate = (value) => {
  const date = toDate(value);
  return date ? date.toISOString() : null;
};

const toNumber = (value) => Number.parseFloat(value) || 0;

const getMonthKey = (value) => {
  const date = toDate(value);
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return monthKey || "";
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const cleanText = (value) => String(value || "").trim();

const buildRangeBounds = (rangeType) => {
  const now = new Date();
  const startOfDay = (date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };
  const endOfDay = (date) => {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
  };

  switch (rangeType) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "last_7_days": {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case "last_30_days": {
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case "this_week": {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      return { start: startOfDay(startOfWeek), end: endOfDay(now) };
    }
    case "last_week": {
      const dayOfWeek = now.getDay();
      const startOfLastWeek = new Date(now);
      startOfLastWeek.setDate(now.getDate() - dayOfWeek - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      return { start: startOfDay(startOfLastWeek), end: endOfDay(endOfLastWeek) };
    }
    case "this_month":
      return { start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), end: endOfDay(now) };
    case "last_month": {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: startOfDay(startOfLastMonth), end: endOfDay(endOfLastMonth) };
    }
    case "this_year":
      return { start: startOfDay(new Date(now.getFullYear(), 0, 1)), end: endOfDay(now) };
    default:
      return { start: null, end: null };
  }
};

const rangeAliasMap = [
  { range: "today", patterns: [/\btoday\b/i] },
  { range: "last_7_days", patterns: [/\brecent\b/i, /\blast 7 days\b/i, /\bpast week\b/i, /\brecently\b/i] },
  { range: "last_30_days", patterns: [/\blast 30 days\b/i, /\bpast month\b/i, /\blatest\b/i] },
  { range: "this_week", patterns: [/\bthis week\b/i] },
  { range: "last_week", patterns: [/\blast week\b/i] },
  { range: "this_month", patterns: [/\bthis month\b/i] },
  { range: "last_month", patterns: [/\blast month\b/i] },
  { range: "this_year", patterns: [/\bthis year\b/i] },
];

const extractRequestedRanges = (text) => {
  const normalized = cleanText(text).toLowerCase();
  const ranges = new Set();

  for (const entry of rangeAliasMap) {
    if (entry.patterns.some((pattern) => pattern.test(normalized))) {
      ranges.add(entry.range);
    }
  }

  return [...ranges];
};

const matchesMoneySummaryRequest = (text) => {
  const normalized = cleanText(text).toLowerCase();
  return /\b(total|expense|expenses|spend|spends|spent|spending|cost|costs)\b/i.test(normalized);
};

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

const buildSummaryOverview = (transactions, requestedRanges) => {
  const sections = requestedRanges.map((rangeType) => {
    const { start, end } = buildRangeBounds(rangeType);
    const filtered = transactions.filter((txn) => {
      const txnDate = toDate(txn.date || txn.createdAt);
      if (!txnDate || !start || !end) return rangeType === "all";
      return txnDate >= start && txnDate <= end;
    });
    const expenseTotal = filtered
      .filter((txn) => txn.type !== "income")
      .reduce((sum, txn) => sum + Math.abs(toNumber(txn.amount)), 0);

    return {
      range: rangeType,
      label: formatRangeLabel(rangeType),
      total: expenseTotal,
      count: filtered.filter((txn) => txn.type !== "income").length,
    };
  });

  return {
    type: "overview",
    message:
      "Here is a quick snapshot of the periods you asked for, kept in a human-friendly view.",
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

const isChartInsightQuery = (text) => {
  const normalized = cleanText(text).toLowerCase();
  return /(\bwhy\b|\bspike\b|\bspiked\b|\bincrease\b|\bincreased\b|\bdecrease\b|\bdecreased\b|\btrend\b|\bchart\b|\bgraph\b|\binsight\b|\bcompare\b|\bbecause\b)/i.test(
    normalized,
  );
};

const formatPlainAmount = (amount) => currencyFormatter.format(Math.abs(Number(amount || 0)));

const buildCategoryTotalsByMonth = (transactions, monthKey) => {
  const totals = new Map();

  for (const txn of transactions) {
    if (txn.type === "income") continue;
    const txnDate = toDate(txn.date || txn.createdAt);
    if (!txnDate) continue;

    const currentMonthKey = getMonthKey(txnDate);
    if (currentMonthKey !== monthKey) continue;

    const category = txn.category || "Uncategorized";
    totals.set(category, (totals.get(category) || 0) + Math.abs(toNumber(txn.amount)));
  }

  return totals;
};

const buildChartInsightResponse = (transactions, assistantContext) => {
  const monthlyTotals = assistantContext?.transactions?.monthlyTotals || [];
  if (monthlyTotals.length < 2) return null;

  const currentMonth = monthlyTotals[monthlyTotals.length - 1];
  const previousMonth = monthlyTotals[monthlyTotals.length - 2];
  const delta = (currentMonth?.expense || 0) - (previousMonth?.expense || 0);
  const deltaPercent =
    previousMonth?.expense > 0 ? Number(((delta / previousMonth.expense) * 100).toFixed(1)) : null;

  const currentCategories = buildCategoryTotalsByMonth(transactions, currentMonth.month);
  const previousCategories = buildCategoryTotalsByMonth(transactions, previousMonth.month);

  const categoryDeltas = [...new Set([...currentCategories.keys(), ...previousCategories.keys()])]
    .map((category) => {
      const current = currentCategories.get(category) || 0;
      const previous = previousCategories.get(category) || 0;
      return {
        category,
        delta: current - previous,
        current,
        previous,
      };
    })
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta));

  const biggestIncrease = categoryDeltas.find((item) => item.delta > 0) || null;
  const biggestDecrease = categoryDeltas.find((item) => item.delta < 0) || null;
  const direction = delta >= 0 ? "up" : "down";
  const messageParts = [
    `Your spending is ${direction} by ${formatPlainAmount(delta)} in ${currentMonth.monthLabel || currentMonth.month} compared with ${previousMonth.monthLabel || previousMonth.month}.`,
  ];

  if (biggestIncrease) {
    messageParts.push(
      `${biggestIncrease.category} increased by ${formatPlainAmount(biggestIncrease.delta)}.`,
    );
  }

  if (biggestDecrease) {
    messageParts.push(
      `${biggestDecrease.category} actually went down by ${formatPlainAmount(biggestDecrease.delta)}.`,
    );
  }

  return {
    type: "answer",
    message: messageParts.join(" "),
    card: {
      kind: "analysis",
      title: "Why this month changed",
      subtitle: `${currentMonth.monthLabel || currentMonth.month} vs ${previousMonth.monthLabel || previousMonth.month}`,
      metrics: [
        { label: "This month", value: formatPlainAmount(currentMonth.expense || 0) },
        { label: "Previous month", value: formatPlainAmount(previousMonth.expense || 0) },
        {
          label: "Change",
          value: `${delta >= 0 ? "+" : "-"}${formatPlainAmount(delta)}`,
        },
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
      thisMonth: currentMonth.month,
      previousMonth: previousMonth.month,
      delta,
      deltaPercent,
      biggestIncrease: biggestIncrease?.category || null,
      biggestDecrease: biggestDecrease?.category || null,
    },
    followUps: [
      "Compare this month with last month",
      "Show me my recent expenses",
      "Open the Insights page",
    ],
    confidence: 1,
  };
};

const isGreetingQuery = (text) =>
  /^(hi|hello|hey|yo|hii|howdy|good (morning|afternoon|evening))( there)?[!.?\s]*$/i.test(
    cleanText(text),
  );

const isIntroQuery = (text) => {
  const normalized = cleanText(text).toLowerCase();
  return (
    isGreetingQuery(normalized) ||
    normalized.includes("who are you") ||
    normalized.includes("what can you do") ||
    normalized.includes("about you") ||
    normalized.includes("developer") ||
    normalized.includes("who made you")
  );
};

const humanStyle = {
  greeting:
    "Hi, I am your assistant here to help you with ExpenseTrack. I can answer questions about your spending, budgets, recent activity, and roommate balances. I was created by Dev Shakti.",
  developerCard: {
    title: "Built by Dev Shakti",
    description:
      "Created and maintained by DEVS-shakti for tracking expenses, budgets, insights, and shared bills.",
    githubLabel: "GitHub",
    githubUrl: "https://github.com/DEVS-shakti",
  },
  followUpPrompts: [
    "Show my expense summary for this month",
    "What did I spend recently?",
    "How do I use this website?",
  ],
};

const normalizeTransactions = (docs) =>
  docs.map((docSnap) => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      amount: toNumber(data.amount),
      type: data.type || "expense",
      category: cleanText(data.category) || "Uncategorized",
      description: cleanText(data.description),
      source: cleanText(data.source),
      date: toIsoDate(data.date || data.createdAt),
      createdAt: toIsoDate(data.createdAt),
    };
  });

const normalizeCategories = (docs) =>
  docs.map((docSnap) => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      name: cleanText(data.name) || "Unnamed",
      type: cleanText(data.type) || "expense",
      createdAt: toIsoDate(data.createdAt),
    };
  });

const normalizeBudgets = (docs) =>
  docs.map((docSnap) => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      month: docSnap.id,
      monthLabel: formatMonthLabel(docSnap.id),
      categoryLimits: data.categoryLimits || {},
      updatedAt: toIsoDate(data.updatedAt),
    };
  });

const normalizeRoommates = (docs) =>
  docs.map((docSnap) => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      name: cleanText(data.name) || "Unnamed roommate",
      contact: cleanText(data.contact || data.email),
      note: cleanText(data.note),
      createdAt: toIsoDate(data.createdAt),
    };
  });

const normalizeRoommateSplits = (docs) =>
  docs.map((docSnap) => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      transactionId: cleanText(data.transactionId),
      transactionCategory: cleanText(data.transactionCategory),
      transactionDescription: cleanText(data.transactionDescription),
      transactionDate: toIsoDate(data.transactionDate),
      totalAmount: toNumber(data.totalAmount),
      splitMode: cleanText(data.splitMode) || "equal",
      notes: cleanText(data.notes),
      participants: Array.isArray(data.participants)
        ? data.participants.map((participant) => ({
            roommateId: cleanText(participant.roommateId),
            roommateName: cleanText(participant.roommateName) || "Unnamed roommate",
            amount: toNumber(participant.amount),
            settled: Boolean(participant.settled),
          }))
        : [],
      createdAt: toIsoDate(data.createdAt),
      updatedAt: toIsoDate(data.updatedAt),
    };
  });

const summarizeTransactions = (transactions) => {
  const totalsByCategory = new Map();
  const totalsByMonth = new Map();
  const recentTransactions = [...transactions]
    .filter((txn) => txn.date)
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 25);
  const relevantTransactions = [...transactions]
    .filter((txn) => txn.date)
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, MAX_TRANSACTIONS);

  let incomeTotal = 0;
  let expenseTotal = 0;

  for (const txn of transactions) {
    const amount = Math.abs(toNumber(txn.amount));
    const category = txn.category || "Uncategorized";
    const monthKey = txn.date ? getMonthKey(txn.date) : null;

    if (txn.type === "income") {
      incomeTotal += amount;
    } else {
      expenseTotal += amount;
    }

    totalsByCategory.set(category, (totalsByCategory.get(category) || 0) + amount);

    if (monthKey) {
      const monthEntry = totalsByMonth.get(monthKey) || {
        income: 0,
        expense: 0,
        net: 0,
        count: 0,
      };
      if (txn.type === "income") {
        monthEntry.income += amount;
      } else {
        monthEntry.expense += amount;
      }
      monthEntry.net = monthEntry.income - monthEntry.expense;
      monthEntry.count += 1;
      totalsByMonth.set(monthKey, monthEntry);
    }
  }

  const topCategories = [...totalsByCategory.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 8);

  const monthlyTotals = [...totalsByMonth.entries()]
    .map(([month, totals]) => ({ month, ...totals }))
    .sort((left, right) => left.month.localeCompare(right.month))
    .slice(-6);

  return {
    totalCount: transactions.length,
    incomeTotal,
    expenseTotal,
    netTotal: incomeTotal - expenseTotal,
    topCategories,
    monthlyTotals,
    recentTransactions,
    relevantTransactions,
  };
};

const summarizeBudgets = (budgets, transactions) => {
  const expenseByMonth = new Map();
  const expenseByMonthCategory = new Map();

  for (const txn of transactions) {
    if (txn.type === "income" || !txn.date) continue;
    const monthKey = getMonthKey(txn.date);
    if (!monthKey) continue;

    const amount = Math.abs(toNumber(txn.amount));
    const category = txn.category || "Uncategorized";

    const monthTotals = expenseByMonth.get(monthKey) || 0;
    expenseByMonth.set(monthKey, monthTotals + amount);

    const monthCategoryKey = `${monthKey}::${category}`;
    expenseByMonthCategory.set(
      monthCategoryKey,
      (expenseByMonthCategory.get(monthCategoryKey) || 0) + amount,
    );
  }

  return budgets
    .map((budget) => {
      const monthKey = budget.month;
      const categoryLimits = budget.categoryLimits || {};
      const categories = Object.entries(categoryLimits).map(([category, limit]) => {
        const spent = expenseByMonthCategory.get(`${monthKey}::${category}`) || 0;
        const remaining = Number(limit) - spent;
        return {
          category,
          limit: Number(limit) || 0,
          spent,
          remaining,
          usagePercent: Number(limit) > 0 ? Number(((spent / Number(limit)) * 100).toFixed(1)) : null,
        };
      });

      const totalBudget = Object.values(categoryLimits).reduce(
        (sum, value) => sum + (Number(value) || 0),
        0,
      );
      const totalSpent = categories.reduce((sum, item) => sum + item.spent, 0);
      const monthExpense = expenseByMonth.get(monthKey) || 0;

      return {
        month: monthKey,
        monthLabel: budget.monthLabel,
        totalBudget,
        totalSpent,
        monthExpense,
        categories: categories.sort((left, right) => right.spent - left.spent),
      };
    })
    .sort((left, right) => left.month.localeCompare(right.month));
};

const summarizeRoommates = (roommates, splits) => {
  const totals = new Map(
    roommates.map((roommate) => [
      roommate.id,
      {
        roommateId: roommate.id,
        name: roommate.name,
        amount: 0,
        count: 0,
      },
    ]),
  );

  let unsettledCount = 0;
  let settledCount = 0;

  for (const split of splits) {
    for (const participant of split.participants || []) {
      if (!totals.has(participant.roommateId)) {
        totals.set(participant.roommateId, {
          roommateId: participant.roommateId,
          name: participant.roommateName || "Unnamed roommate",
          amount: 0,
          count: 0,
        });
      }

      if (participant.settled) {
        settledCount += 1;
        continue;
      }

      unsettledCount += 1;
      const current = totals.get(participant.roommateId);
      current.amount += Math.abs(toNumber(participant.amount));
      current.count += 1;
    }
  }

  const topOutstanding = [...totals.values()]
    .filter((row) => row.amount > 0)
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 8);

  return {
    totalRoommates: roommates.length,
    openParticipants: unsettledCount,
    settledParticipants: settledCount,
    outstandingTotal: topOutstanding.reduce((sum, row) => sum + row.amount, 0),
    topOutstanding,
  };
};

const buildAssistantContext = ({ transactions, categories, budgets, roommates, splits }) => {
  const transactionSummary = summarizeTransactions(transactions);
  const budgetSummary = summarizeBudgets(budgets, transactions);
  const roommateSummary = summarizeRoommates(roommates, splits);

  return {
    snapshot: {
      generatedAt: new Date().toISOString(),
      transactionCount: transactionSummary.totalCount,
      categoryCount: categories.length,
      budgetCount: budgets.length,
      roommateCount: roommates.length,
      splitCount: splits.length,
    },
    transactions: {
      incomeTotal: transactionSummary.incomeTotal,
      expenseTotal: transactionSummary.expenseTotal,
      netTotal: transactionSummary.netTotal,
      topCategories: transactionSummary.topCategories,
      monthlyTotals: transactionSummary.monthlyTotals,
      recentTransactions: transactionSummary.recentTransactions,
      relevantTransactions: transactionSummary.relevantTransactions,
    },
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
    })),
    budgets: budgetSummary,
    roommates: roommateSummary,
    splits: splits
      .slice(0, 15)
      .map((split) => ({
        id: split.id,
        totalAmount: split.totalAmount,
        splitMode: split.splitMode,
        transactionCategory: split.transactionCategory,
        transactionDescription: split.transactionDescription,
        transactionDate: split.transactionDate,
        notes: split.notes,
        participants: (split.participants || []).map((participant) => ({
          roommateName: participant.roommateName,
          amount: participant.amount,
          settled: participant.settled,
        })),
      })),
  };
};

const buildHumanIntroResponse = () => ({
  type: "profile",
  message: humanStyle.greeting,
  card: humanStyle.developerCard,
  data: {
    creator: "Dev Shakti",
    githubUrl: humanStyle.developerCard.githubUrl,
    githubLabel: humanStyle.developerCard.githubLabel,
  },
  followUps: humanStyle.followUpPrompts,
  confidence: 1,
});

const siteGuide = {
  whatItIs:
    "ExpenseTrack is a personal finance dashboard for tracking income, expenses, categories, monthly budgets, insights, and roommate bill splits.",
  whyUseIt: [
    "See where money goes without manual spreadsheets.",
    "Compare monthly spending and spot patterns early.",
    "Keep budgets, transactions, and shared bills in one place.",
    "Explain the app in plain language when a user needs help getting started.",
  ],
  howToUse: [
    "Start on the dashboard for a summary of your financial snapshot.",
    "Go to Transactions to add, edit, filter, and review income or expenses.",
    "Use Categories to organize spending buckets.",
    "Set monthly budgets to watch limits and prevent overspending.",
    "Open Insights for charts, trends, and comparisons.",
    "Use Roommate Splits to track shared expenses and outstanding balances.",
    "Check Profile for account details and helpful account actions.",
  ],
  keyFeatures: [
    "Authentication and private Firebase storage",
    "Transaction management with filters and quick actions",
    "Category and budget management",
    "Charts and trend insights",
    "Roommate split tracking and settlement progress",
  ],
};

const assistantSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      enum: ["answer", "summary", "overview", "comparison", "group", "list", "profile", "fallback"],
    },
    message: {
      type: "string",
    },
    data: {
      type: ["object", "null"],
      additionalProperties: true,
    },
    card: {
      type: ["object", "null"],
      additionalProperties: true,
    },
    followUps: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 3,
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },
  required: ["type", "message", "data", "card", "followUps", "confidence"],
};

const callGemini = async (promptText) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: promptText,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 900,
      responseMimeType: "application/json",
      responseJsonSchema: assistantSchema,
    },
  };

  const response = await fetchFn(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok) {
    const errorMessage =
      json?.error?.message || json?.message || `Gemini request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim() || null;

  return { raw: json, text };
};

const parseStructuredResponse = (text) => {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}$/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/assistant", async (req, res) => {
  try {
    const authHeader = cleanText(req.headers.authorization);
    const idToken = authHeader.replace(/^Bearer\s+/i, "") || null;
    const { text, context = {} } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text in request body" });
    }

    if (!idToken) {
      return res.status(401).json({ error: "Missing Authorization Bearer token" });
    }

    if (isIntroQuery(text)) {
      return res.json(buildHumanIntroResponse());
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.error("Failed to verify ID token", err);
      return res.status(401).json({ error: "Invalid ID token" });
    }

    const uid = decoded.uid;

    const [transactionSnap, categorySnap, budgetSnap, roommateSnap, splitSnap] = await Promise.all([
      db.collection(`users/${uid}/transactions`).orderBy("date", "desc").limit(MAX_TRANSACTIONS).get(),
      db.collection(`users/${uid}/categories`).get(),
      db.collection(`users/${uid}/budgets`).get(),
      db.collection(`users/${uid}/roommates`).get(),
      db.collection(`users/${uid}/roommateSplits`).get(),
    ]);

    const transactions = normalizeTransactions(transactionSnap.docs);
    const categories = normalizeCategories(categorySnap.docs);
    const budgets = normalizeBudgets(budgetSnap.docs);
    const roommates = normalizeRoommates(roommateSnap.docs);
    const splits = normalizeRoommateSplits(splitSnap.docs);
    const assistantContext = buildAssistantContext({
      transactions,
      categories,
      budgets,
      roommates,
      splits,
    });

    const requestedRanges = extractRequestedRanges(text);
    if (matchesMoneySummaryRequest(text) && requestedRanges.length >= 2) {
      return res.json(buildSummaryOverview(transactions, requestedRanges));
    }

    if (isChartInsightQuery(text)) {
      const chartInsightResponse = buildChartInsightResponse(transactions, assistantContext);
      if (chartInsightResponse) {
        return res.json(chartInsightResponse);
      }
    }

    const memory = context?.memory || {};
    const route = cleanText(context?.route || "");
    const memoryHint = {
      tone: memory.tone || "friendly",
      brevity: memory.brevity || "balanced",
      lastTopics: Array.isArray(memory.lastTopics) ? memory.lastTopics.slice(0, 6) : [],
      route,
    };

    const prompt = [
      "You are the in-app finance assistant for an expense tracker.",
      "Speak like a helpful human, not a robotic chatbot.",
      "Keep the tone warm, direct, and concise.",
      "When the user greets you, respond naturally and casually before explaining anything else.",
      "Remember the user's style memory and mirror it naturally when appropriate.",
      "Answer using the provided Firebase data when the user asks about their finances.",
      "If the user asks how to use the website, why to use it, or what the features are, answer from the site guide below.",
      "Do not invent numbers or categories. If the data cannot support a finance answer, say so clearly and suggest the closest useful view.",
      "Use Indian Rupees when talking about money.",
      "Understand natural phrasing like recent, latest, this month, this year, all time, and nearby variations without requiring exact keywords.",
      "If the user asks about charts, trends, spikes, or why spending changed, explain the most likely driver from the data with a practical human explanation.",
      "Return a single JSON object that matches the schema exactly.",
      "",
      `User question: ${text}`,
      "",
      `Style memory: ${JSON.stringify(memoryHint)}`,
      "",
      `Site guide: ${JSON.stringify(siteGuide)}`,
      "",
      `Firebase data context: ${JSON.stringify(assistantContext)}`,
      "",
      "Guidance:",
      "- Use type 'overview' when the user asks for multiple time periods in one question.",
      "- Use type 'summary' for totals, spending highlights, budget checks, and similar numeric answers.",
      "- Use type 'comparison' when the question compares two periods.",
      "- Use type 'group' for breakdowns by category or month.",
      "- Use type 'list' when the user wants matching transactions or split rows.",
      "- Use type 'answer' for natural-language explanations, recommendations, or questions that do not need a card.",
      "- Use type 'profile' for creator/introduction responses.",
      "- Include up to 3 short follow-up questions that make sense from the same data.",
    ].join("\n");

    const geminiResponse = await callGemini(prompt);
    const parsed = parseStructuredResponse(geminiResponse.text);

    if (parsed && parsed.type && parsed.message) {
      return res.json(parsed);
    }

    return res.json({
      type: "answer",
      message:
        geminiResponse.text ||
        "I could not generate a structured answer from your data just now.",
      data: null,
      followUps: [],
      confidence: 0,
    });
  } catch (err) {
    console.error("Assistant endpoint error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy server listening on port ${PORT}`);
});
