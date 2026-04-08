import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/db";
import { useAuth } from "../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { COLORS, formatCurrency } from "../components/utils/mockUtils";
import LoadingScreen from "../components/ui/LoadingScreen";

const parseTxnDate = (rawDate) => {
  if (!rawDate) return null;
  if (rawDate?.toDate) return rawDate.toDate();
  if (rawDate?.seconds) return new Date(rawDate.seconds * 1000);
  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const monthKeyFromDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const formatMonthLabel = (monthKey) =>
  new Date(`${monthKey}-01`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

const Insight = ({ selectedDate: externalSelectedDate = "" }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return undefined;
    }

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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const availableMonths = useMemo(() => {
    const months = new Set([monthKeyFromDate(new Date())]);

    transactions.forEach((txn) => {
      const date = parseTxnDate(txn.date);
      if (date) months.add(monthKeyFromDate(date));
    });

    return Array.from(months).sort().reverse();
  }, [transactions]);

  useEffect(() => {
    if (externalSelectedDate && availableMonths.includes(externalSelectedDate)) {
      setSelectedMonth(externalSelectedDate);
      return;
    }

    if (selectedMonth && availableMonths.includes(selectedMonth)) return;
    if (availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, externalSelectedDate, selectedMonth]);

  useEffect(() => {
    const fetchBudget = async () => {
      if (!user?.uid || !selectedMonth) {
        setBudgets({});
        return;
      }

      const budgetRef = doc(db, `users/${user.uid}/budgets/${selectedMonth}`);
      const budgetSnap = await getDoc(budgetRef);
      setBudgets(budgetSnap.exists() ? budgetSnap.data().categoryLimits || {} : {});
    };

    fetchBudget();
  }, [selectedMonth, user?.uid]);

  const selectedMonthIndex = availableMonths.indexOf(selectedMonth);
  const canGoToPreviousMonth =
    selectedMonthIndex >= 0 && selectedMonthIndex < availableMonths.length - 1;
  const canGoToNextMonth = selectedMonthIndex > 0;

  const selectedMonthTransactions = useMemo(
    () =>
      transactions.filter((txn) => {
        const date = parseTxnDate(txn.date);
        return date && monthKeyFromDate(date) === selectedMonth;
      }),
    [selectedMonth, transactions],
  );

  const { income, expense } = useMemo(() => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    selectedMonthTransactions.forEach((txn) => {
      if (txn.type === "income") incomeTotal += txn.amount;
      else expenseTotal += txn.amount;
    });

    return { income: incomeTotal, expense: expenseTotal };
  }, [selectedMonthTransactions]);

  const spendingByCategory = useMemo(() => {
    const map = {};

    selectedMonthTransactions.forEach((txn) => {
      if (txn.type === "expense") {
        map[txn.category] = (map[txn.category] || 0) + txn.amount;
      }
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [selectedMonthTransactions]);

  const trendData = useMemo(() => {
    const map = {};
    const baseDate = selectedMonth
      ? new Date(`${selectedMonth}-01`)
      : new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const key = monthKeyFromDate(date);
      map[key] = {
        name: date.toLocaleString("default", { month: "short" }),
        Income: 0,
        Expense: 0,
      };
    }

    transactions.forEach((txn) => {
      const date = parseTxnDate(txn.date);
      if (!date) return;
      const key = monthKeyFromDate(date);

      if (map[key]) {
        if (txn.type === "income") map[key].Income += txn.amount;
        else map[key].Expense += txn.amount;
      }
    });

    return Object.values(map);
  }, [selectedMonth, transactions]);

  const spendingVsBudget = useMemo(() => {
    const actual = {};

    selectedMonthTransactions.forEach((txn) => {
      if (txn.type === "expense") {
        actual[txn.category] = (actual[txn.category] || 0) + txn.amount;
      }
    });

    return Object.keys({ ...budgets, ...actual }).map((category) => ({
      name: category,
      Budget: budgets[category] || 0,
      Actual: actual[category] || 0,
    }));
  }, [budgets, selectedMonthTransactions]);

  if (loading) {
    return <LoadingScreen label="Crunching your latest insights..." compact />;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Insight Timeline
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {selectedMonth ? formatMonthLabel(selectedMonth) : "Select a month"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Move across your available months and refresh every chart instantly.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 p-1.5">
            <button
              type="button"
              onClick={() => setSelectedMonth(availableMonths[selectedMonthIndex + 1])}
              disabled={!canGoToPreviousMonth}
              className="rounded-full p-2 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous month"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[150px] px-3 text-center text-sm font-semibold text-slate-900">
              {selectedMonth ? formatMonthLabel(selectedMonth) : "No month"}
            </span>
            <button
              type="button"
              onClick={() => setSelectedMonth(availableMonths[selectedMonthIndex - 1])}
              disabled={!canGoToNextMonth}
              className="rounded-full p-2 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next month"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <input
            type="range"
            min="0"
            max={Math.max(availableMonths.length - 1, 0)}
            step="1"
            value={Math.max(selectedMonthIndex, 0)}
            onChange={(event) =>
              setSelectedMonth(availableMonths[Number(event.target.value)])
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-600"
            aria-label="Insight month slider"
            disabled={availableMonths.length <= 1}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg text-gray-500">Total Income</h2>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(income)}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg text-gray-500">Total Expense</h2>
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(expense)}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg text-gray-500">Net Savings</h2>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(income - expense)}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-4 text-xl font-semibold">Budget Overview</h2>
        {Object.keys(budgets).length === 0 ? (
          <p className="text-gray-500">No budget set for {selectedMonth ? formatMonthLabel(selectedMonth) : "this month"}.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(budgets).map(([category, limit]) => {
              const spent =
                spendingByCategory.find((entry) => entry.name === category)
                  ?.value || 0;

              return (
                <li key={category} className="rounded-lg border p-3 shadow-sm">
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-gray-600">
                    Spent {formatCurrency(spent)} of {formatCurrency(limit)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByCategory}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {spendingByCategory.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatCurrency} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold">Income vs Expense Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatCurrency} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Income"
                stroke="#2563EB"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="Expense"
                stroke="#F97316"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="mb-4 text-xl font-semibold">Spending vs Budget</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={spendingVsBudget}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={formatCurrency} />
            <Legend />
            <Bar dataKey="Budget" fill="#22C55E" radius={[10, 10, 0, 0]} />
            <Bar dataKey="Actual" fill="#EF4444" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Insight;

