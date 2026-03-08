import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/db";
import { auth } from "../firebase/auth";
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
import { COLORS, formatCurrency } from "../components/utils/mockUtils";
import LoadingScreen from "../components/ui/LoadingScreen";

const parseTxnDate = (rawDate) => {
  if (!rawDate) return null;
  if (rawDate?.toDate) return rawDate.toDate();
  if (rawDate?.seconds) return new Date(rawDate.seconds * 1000);
  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const Insight = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const txnRef = collection(db, `users/${currentUser.uid}/transactions`);
      const txnSnapshot = await getDocs(txnRef);
      const txnData = txnSnapshot.docs.map((snapshotDoc) => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
      }));

      const budgetRef = doc(
        db,
        `users/${currentUser.uid}/budgets/${currentMonthKey}`,
      );
      const budgetSnap = await getDoc(budgetRef);
      const budgetData = budgetSnap.exists()
        ? budgetSnap.data()
        : { categoryLimits: {} };

      setTransactions(txnData);
      setBudgets(budgetData.categoryLimits || {});
      setLoading(false);
    };

    fetchData();
  }, [currentMonthKey, currentUser]);

  const { income, expense } = useMemo(() => {
    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach((txn) => {
      const date = parseTxnDate(txn.date);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (key === currentMonthKey) {
        if (txn.type === "income") incomeTotal += txn.amount;
        else expenseTotal += txn.amount;
      }
    });

    return { income: incomeTotal, expense: expenseTotal };
  }, [transactions, currentMonthKey]);

  const spendingByCategory = useMemo(() => {
    const map = {};

    transactions.forEach((txn) => {
      const date = parseTxnDate(txn.date);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (txn.type === "expense" && key === currentMonthKey) {
        map[txn.category] = (map[txn.category] || 0) + txn.amount;
      }
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions, currentMonthKey]);

  const trendData = useMemo(() => {
    const map = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      map[key] = {
        name: date.toLocaleString("default", { month: "short" }),
        Income: 0,
        Expense: 0,
      };
    }

    transactions.forEach((txn) => {
      const date = parseTxnDate(txn.date);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (map[key]) {
        if (txn.type === "income") map[key].Income += txn.amount;
        else map[key].Expense += txn.amount;
      }
    });

    return Object.values(map);
  }, [transactions]);

  const spendingVsBudget = useMemo(() => {
    const actual = {};

    transactions.forEach((txn) => {
      const date = parseTxnDate(txn.date);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (key === currentMonthKey && txn.type === "expense") {
        actual[txn.category] = (actual[txn.category] || 0) + txn.amount;
      }
    });

    return Object.keys({ ...budgets, ...actual }).map((category) => ({
      name: category,
      Budget: budgets[category] || 0,
      Actual: actual[category] || 0,
    }));
  }, [budgets, transactions, currentMonthKey]);

  if (loading) {
    return <LoadingScreen label="Crunching your latest insights..." compact />;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg text-gray-500">Total Income</h2>
          <div className="text-3xl text-green-600 font-bold">
            {formatCurrency(income)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg text-gray-500">Total Expense</h2>
          <div className="text-3xl text-red-600 font-bold">
            {formatCurrency(expense)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg text-gray-500">Net Savings</h2>
          <div className="text-3xl text-blue-600 font-bold">
            {formatCurrency(income - expense)}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
        {Object.keys(budgets).length === 0 ? (
          <p className="text-gray-500">No budget set for this month.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(budgets).map(([category, limit]) => {
              const spent =
                spendingByCategory.find((entry) => entry.name === category)
                  ?.value || 0;

              return (
                <li key={category} className="border p-3 rounded-lg shadow-sm">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Spending by Category</h3>
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

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Income vs Expense Trend</h3>
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

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Spending vs Budget</h3>
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

