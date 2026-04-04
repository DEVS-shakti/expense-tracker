import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  Layers3,
  HandCoins,
  Pencil,
  Plus,
  Receipt,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../firebase/db";
import { useAuth } from "../context/AuthContext";

const createDraft = (overrides = {}) => ({
  id: null,
  type: "expense",
  category: "",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  ...overrides,
});

const parseTxnDate = (rawDate) => {
  if (!rawDate) return null;
  if (rawDate?.toDate) return rawDate.toDate();
  if (rawDate?.seconds) return new Date(rawDate.seconds * 1000);
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const monthKeyFromDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const ALL_MONTHS = "all-months";

const formatMonthLabel = (monthKey) => {
  if (monthKey === ALL_MONTHS) return "All months";
  return new Date(`${monthKey}-01`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDisplayDate = (rawDate) => {
  const date = parseTxnDate(rawDate);
  if (!date) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getCategoryTone = (index) => {
  const tones = [
    "from-rose-500/15 via-orange-500/10 to-amber-400/20 border-rose-200 text-rose-700",
    "from-sky-500/15 via-cyan-500/10 to-blue-400/20 border-sky-200 text-sky-700",
    "from-violet-500/15 via-fuchsia-500/10 to-pink-400/20 border-violet-200 text-violet-700",
    "from-emerald-500/15 via-lime-500/10 to-teal-400/20 border-emerald-200 text-emerald-700",
  ];

  return tones[index % tones.length];
};

const SummaryCard = ({ icon, title, value, accent, description }) => {
  const accentStyles = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    sky: "bg-sky-100 text-sky-700",
  };

  return (
    <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentStyles[accent]}`}>
          {React.createElement(icon, { className: "h-5 w-5" })}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{description}</p>
    </div>
  );
};

const EmptyState = ({ title, description }) => (
  <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
    <p className="text-lg font-semibold text-slate-900">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {description}
    </p>
  </div>
);

const chartPalette = ["#0f172a", "#2563eb", "#ec4899", "#f97316", "#14b8a6", "#8b5cf6"];

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-slate-900">{item.category}</p>
      <p className="mt-1 text-sm text-slate-600">{formatCurrency(item.total)}</p>
      <p className="mt-1 text-xs text-slate-500">{item.count} transactions</p>
    </div>
  );
};

const Transactions = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [draft, setDraft] = useState(createDraft());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/categories`),
      (snapshot) => {
        setCategories(
          snapshot.docs.map((snapshotDoc) => ({
            id: snapshotDoc.id,
            ...snapshotDoc.data(),
          })),
        );
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const txnQuery = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy("date", "desc"),
    );

    const unsubscribe = onSnapshot(txnQuery, (snapshot) => {
      setTransactions(
        snapshot.docs.map((snapshotDoc) => ({
          id: snapshotDoc.id,
          ...snapshotDoc.data(),
        })),
      );
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const monthOptions = useMemo(() => {
    const months = new Set([monthKeyFromDate(new Date())]);

    transactions.forEach((txn) => {
      const date = parseTxnDate(txn.date);
      if (date) months.add(monthKeyFromDate(date));
    });

    return [ALL_MONTHS, ...Array.from(months).sort().reverse()];
  }, [transactions]);

  useEffect(() => {
    if (!monthOptions.includes(selectedMonth) && monthOptions.length > 0) {
      setSelectedMonth(ALL_MONTHS);
    }
  }, [monthOptions, selectedMonth]);

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );

  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === "income"),
    [categories],
  );

  const selectedMonthTransactions = useMemo(
    () =>
      transactions.filter((txn) => {
        const date = parseTxnDate(txn.date);
        if (!date) return false;
        if (selectedMonth === ALL_MONTHS) return true;
        return monthKeyFromDate(date) === selectedMonth;
      }),
    [selectedMonth, transactions],
  );

  const filteredTransactions = useMemo(
    () =>
      selectedMonthTransactions.filter((txn) => {
        const matchesType = typeFilter === "all" || txn.type === typeFilter;
        const matchesCategory =
          activeCategory === "all" || txn.category === activeCategory;

        return matchesType && matchesCategory;
      }),
    [activeCategory, selectedMonthTransactions, typeFilter],
  );

  const summary = useMemo(() => {
    return selectedMonthTransactions.reduce(
      (accumulator, txn) => {
        if (txn.type === "income") {
          accumulator.income += txn.amount || 0;
        } else {
          accumulator.expense += txn.amount || 0;
        }
        return accumulator;
      },
      { income: 0, expense: 0 },
    );
  }, [selectedMonthTransactions]);

  const groupedExpenses = useMemo(() => {
    const totals = {};

    selectedMonthTransactions.forEach((txn) => {
      if (txn.type !== "expense") return;

      totals[txn.category] = totals[txn.category] || {
        category: txn.category,
        total: 0,
        count: 0,
      };

      totals[txn.category].total += txn.amount || 0;
      totals[txn.category].count += 1;
    });

    return Object.values(totals).sort((left, right) => right.total - left.total);
  }, [selectedMonthTransactions]);

  const availableCategoriesForDraft =
    draft.type === "expense" ? expenseCategories : incomeCategories;

  useEffect(() => {
    if (
      draft.category &&
      availableCategoriesForDraft.some((category) => category.name === draft.category)
    ) {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      category: availableCategoriesForDraft[0]?.name || "",
    }));
  }, [availableCategoriesForDraft, draft.category]);

  const resetFilters = () => {
    setTypeFilter("all");
    setActiveCategory("all");
  };

  const selectedMonthIndex = monthOptions.indexOf(selectedMonth);
  const canGoToPreviousMonth =
    selectedMonth !== ALL_MONTHS && selectedMonthIndex < monthOptions.length - 1;
  const canGoToNextMonth =
    selectedMonth === ALL_MONTHS ? monthOptions.length > 1 : selectedMonthIndex > 1;

  const goToPreviousMonth = () => {
    if (!canGoToPreviousMonth) return;
    setSelectedMonth(monthOptions[selectedMonthIndex + 1]);
  };

  const goToNextMonth = () => {
    if (!canGoToNextMonth) return;
    if (selectedMonth === ALL_MONTHS) {
      setSelectedMonth(monthOptions[1]);
      return;
    }
    if (selectedMonthIndex === 1) {
      setSelectedMonth(ALL_MONTHS);
      return;
    }
    setSelectedMonth(monthOptions[selectedMonthIndex - 1]);
  };

  const openCreateModal = ({ type = "expense", category = "" } = {}) => {
    setDraft(
      createDraft({
        type,
        category,
      }),
    );
    setIsModalOpen(true);
  };

  const openEditModal = (txn) => {
    setDraft(
      createDraft({
        id: txn.id,
        type: txn.type,
        category: txn.category,
        amount: String(txn.amount || ""),
        description: txn.description || "",
        date: parseTxnDate(txn.date)?.toISOString().slice(0, 10) || createDraft().date,
      }),
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setDraft(createDraft());
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedAmount = Number(draft.amount);

    if (!draft.category || !draft.date || !normalizedAmount || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        amount: normalizedAmount,
        type: draft.type,
        category: draft.category,
        description: draft.description.trim(),
        date: Timestamp.fromDate(new Date(`${draft.date}T00:00:00`)),
      };

      if (draft.id) {
        await updateDoc(doc(db, `users/${user.uid}/transactions/${draft.id}`), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, `users/${user.uid}/transactions`), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user?.uid || deletingId) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, `users/${user.uid}/transactions/${id}`));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_80px_-40px_rgba(15,23,42,0.35)]">
        <div className="grid gap-6 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.12),_transparent_25%),linear-gradient(135deg,_#ffffff,_#f8fafc_55%,_#eef2ff)] p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Transaction Studio
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Add expenses from category cards and review spending with clearer context.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                This workspace is centered around how you actually log money: quick
                category entry, monthly totals, and a cleaner transaction activity feed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openCreateModal({ type: "expense" })}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add expense
              </button>
              <button
                type="button"
                onClick={() => openCreateModal({ type: "income" })}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowUpRight className="h-4 w-4" />
                Add income
              </button>
              <Link
                to="/dashboard/categories"
                className="inline-flex items-center gap-2 rounded-2xl border border-transparent px-2 py-3 text-sm font-semibold text-sky-700 transition hover:text-sky-800"
              >
                <Layers3 className="h-4 w-4" />
                Manage categories
              </Link>
              <Link
                to="/roommate-splits"
                className="inline-flex items-center gap-2 rounded-2xl border border-transparent px-2 py-3 text-sm font-semibold text-violet-700 transition hover:text-violet-800"
              >
                <HandCoins className="h-4 w-4" />
                Roommate splitting
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  disabled={!canGoToPreviousMonth}
                  className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Previous month"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[160px] px-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Timeline
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatMonthLabel(selectedMonth)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  disabled={!canGoToNextMonth}
                  className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Next month"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <CalendarRange className="h-4 w-4 text-sky-600" />
                <span className="font-medium">Month</span>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="bg-transparent font-semibold text-slate-900 outline-none"
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {formatMonthLabel(month)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <SummaryCard
              icon={ArrowUpRight}
              title="Income"
              value={formatCurrency(summary.income)}
              accent="emerald"
              description="Money added this month"
            />
            <SummaryCard
              icon={ArrowDownRight}
              title="Expenses"
              value={formatCurrency(summary.expense)}
              accent="rose"
              description="Spending recorded this month"
            />
            <SummaryCard
              icon={Wallet}
              title="Net"
              value={formatCurrency(summary.income - summary.expense)}
              accent="sky"
              description="Balance after income and expense"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Quick Add
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Expense category cards
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tap a category and the form opens with it preselected.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <CalendarRange className="h-4 w-4 text-sky-600" />
              {formatMonthLabel(selectedMonth)}
            </div>
          </div>

          {expenseCategories.length === 0 ? (
            <EmptyState
              title="No expense categories yet"
              description="Create categories first so this page can give you one-tap expense cards."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {expenseCategories.map((category, index) => {
                const categoryStats =
                  groupedExpenses.find((entry) => entry.category === category.name) || {};
                const total = categoryStats.total || 0;
                const count = categoryStats.count || 0;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      openCreateModal({ type: "expense", category: category.name })
                    }
                    className={`group rounded-[1.75rem] border bg-gradient-to-br p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-xl ${getCategoryTone(index)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-current/70">
                          Expense
                        </p>
                        <h3 className="mt-3 text-xl font-semibold text-slate-900">
                          {category.name}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white/80 p-2 text-slate-700 shadow-sm transition group-hover:scale-110">
                        <Plus className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-8 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Spent this month</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {formatCurrency(total)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm">
                        <p className="text-xs text-slate-500">Entries</p>
                        <p className="text-sm font-semibold text-slate-900">{count}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Category View
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Expenses by category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              See where spending is concentrated for the selected period.
            </p>
          </div>

          {groupedExpenses.length === 0 ? (
            <EmptyState
              title="No expense activity yet"
              description="Start logging expenses and category totals will appear here."
            />
          ) : (
            <div className="space-y-3">
              {groupedExpenses.map((entry, index) => {
                const percentage = summary.expense
                  ? Math.round((entry.total / summary.expense) * 100)
                  : 0;

                return (
                  <button
                    key={entry.category}
                    type="button"
                    onClick={() => {
                      setTypeFilter("expense");
                      setActiveCategory(entry.category);
                    }}
                    className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                      activeCategory === entry.category
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                            activeCategory === entry.category
                              ? "text-white/65"
                              : "text-slate-400"
                          }`}
                        >
                          #{String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-2 text-base font-semibold">{entry.category}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(entry.total)}</p>
                        <p
                          className={`text-xs ${
                            activeCategory === entry.category
                              ? "text-white/70"
                              : "text-slate-500"
                          }`}
                        >
                          {entry.count} transactions
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mt-4 h-2 rounded-full ${
                        activeCategory === entry.category ? "bg-white/15" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`h-full rounded-full ${
                          activeCategory === entry.category ? "bg-white" : "bg-slate-900"
                        }`}
                        style={{ width: `${Math.max(percentage, 6)}%` }}
                      />
                    </div>
                    <p
                      className={`mt-2 text-xs ${
                        activeCategory === entry.category
                          ? "text-white/70"
                          : "text-slate-500"
                      }`}
                    >
                      {percentage}% of total monthly spending
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Insights
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Category expense comparison
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Compare which categories are driving most of your spending.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Highest spend:{" "}
            <span className="font-semibold text-slate-900">
              {groupedExpenses[0]
                ? `${groupedExpenses[0].category} (${formatCurrency(groupedExpenses[0].total)})`
                : "No data yet"}
            </span>
          </div>
        </div>

        {groupedExpenses.length === 0 ? (
          <EmptyState
            title="No chart data yet"
            description="Add some expenses and the category comparison graph will appear here."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Expense by category
                  </p>
                  <p className="text-sm text-slate-500">
                    Bigger bar means more spending in that category.
                  </p>
                </div>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={groupedExpenses}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => formatCurrency(value)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
                    <Bar
                      dataKey="total"
                      radius={[0, 14, 14, 0]}
                      onClick={(data) => {
                        setTypeFilter("expense");
                        setActiveCategory(data.category);
                      }}
                    >
                      {groupedExpenses.map((entry, index) => (
                        <Cell
                          key={entry.category}
                          fill={chartPalette[index % chartPalette.length]}
                          className="cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3">
              {groupedExpenses.map((entry, index) => {
                const gapToLeader = groupedExpenses[0].total - entry.total;

                return (
                  <button
                    key={entry.category}
                    type="button"
                    onClick={() => {
                      setTypeFilter("expense");
                      setActiveCategory(entry.category);
                    }}
                    className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                      activeCategory === entry.category
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                            activeCategory === entry.category
                              ? "text-white/65"
                              : "text-slate-400"
                          }`}
                        >
                          Rank #{index + 1}
                        </p>
                        <h3 className="mt-1 text-base font-semibold">{entry.category}</h3>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(entry.total)}</p>
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        activeCategory === entry.category
                          ? "text-white/75"
                          : "text-slate-500"
                      }`}
                    >
                      {index === 0
                        ? "Current top expense category."
                        : `${formatCurrency(gapToLeader)} lower than the top category.`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Activity Feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Transactions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Filter by type or category without leaving this page.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-1 lg:flex">
              <label className="flex min-w-[220px] flex-col gap-2 text-sm font-medium text-slate-600">
                Category
                <select
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value="all">All categories</option>
                  {[...new Set(selectedMonthTransactions.map((txn) => txn.category))].map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {["all", "expense", "income"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  typeFilter === type
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type === "all"
                  ? "All activity"
                  : type === "expense"
                    ? "Expenses"
                    : "Income"}
              </button>
            ))}

            {(typeFilter !== "all" || activeCategory !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Reset filters
              </button>
            )}
          </div>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              title="No transactions match these filters"
              description="Try another month or clear the filters to see more activity."
            />
          ) : (
            <div className="grid gap-4">
              {filteredTransactions.map((txn) => (
                <article
                  key={txn.id}
                  className="flex flex-col gap-4 rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.96))] p-5 transition hover:border-slate-300 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-2xl p-3 ${
                        txn.type === "income"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {txn.type === "income" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {txn.category}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                            txn.type === "income"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {txn.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span>{formatDisplayDate(txn.date)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Receipt className="h-3.5 w-3.5" />
                          {txn.description?.trim() || "No description"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    <p
                      className={`text-xl font-semibold ${
                        txn.type === "income" ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {txn.type === "income" ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </p>

                    <div className="flex items-center gap-2">
                      {txn.type === "expense" && (
                        <Link
                          to={`/roommate-splits?transaction=${txn.id}`}
                          className="rounded-2xl border border-violet-200 p-3 text-violet-600 transition hover:bg-violet-50"
                          aria-label={`Split ${txn.category} with roommates`}
                        >
                          <HandCoins className="h-4 w-4" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditModal(txn)}
                        className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        aria-label={`Edit ${txn.category}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(txn.id)}
                        disabled={deletingId === txn.id}
                        className="rounded-2xl border border-rose-200 p-3 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Delete ${txn.category}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-[linear-gradient(135deg,_#0f172a,_#1e293b_60%,_#334155)] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                  {draft.id ? "Edit entry" : "New entry"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {draft.id ? "Update transaction" : "Add transaction"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-white/15 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      type: "expense",
                      category:
                        expenseCategories.find(
                          (category) => category.name === currentDraft.category,
                        )?.name || expenseCategories[0]?.name || "",
                    }))
                  }
                  className={`rounded-[1.4rem] border p-4 text-left transition ${
                    draft.type === "expense"
                      ? "border-rose-200 bg-rose-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">Expense</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Spending for bills, food, transport, shopping, and more.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      type: "income",
                      category:
                        incomeCategories.find(
                          (category) => category.name === currentDraft.category,
                        )?.name || incomeCategories[0]?.name || "",
                    }))
                  }
                  className={`rounded-[1.4rem] border p-4 text-left transition ${
                    draft.type === "income"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">Income</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Salary, freelance, refunds, transfers, and credits.
                  </p>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Category
                  <select
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        category: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    required
                  >
                    {availableCategoriesForDraft.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      availableCategoriesForDraft.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.amount}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.25fr_0.75fr]">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Description
                  <input
                    type="text"
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Optional note"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Date
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        date: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    required
                  />
                </label>
              </div>

              {availableCategoriesForDraft.length === 0 && (
                <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  No {draft.type} categories found. Create one in{" "}
                  <Link
                    to="/dashboard/categories"
                    className="font-semibold underline decoration-amber-400 underline-offset-4"
                  >
                    categories
                  </Link>{" "}
                  first.
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableCategoriesForDraft.length === 0}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? draft.id
                      ? "Updating..."
                      : "Saving..."
                    : draft.id
                      ? "Update transaction"
                      : "Save transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
