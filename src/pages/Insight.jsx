import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
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
import { COLORS } from "../components/utils/mockUtils";
import { formatCurrency } from "../components/utils/mockUtils";

const Insight = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      const txnRef = collection(db, `users/${currentUser.uid}/transactions`);
      const txnSnapshot = await getDocs(txnRef);
      const txnData = txnSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const budgetRef = doc(db, `users/${currentUser.uid}/budgets/${currentMonthKey}`);
      const budgetSnap = await getDoc(budgetRef);
      const budgetData = budgetSnap.exists() ? budgetSnap.data() : { categoryLimits: {} };

      setTransactions(txnData);
      setBudgets(budgetData.categoryLimits || {});
      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  // Monthly summary
  const { income, expense } = useMemo(() => {
    let income = 0,
      expense = 0;
    transactions.forEach((t) => {
      const date = new Date(t.date?.seconds * 1000);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (key === currentMonthKey) {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      }
    });
    return { income, expense };
  }, [transactions]);

  const spendingByCategory = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const date = new Date(t.date?.seconds * 1000);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (t.type === "expense" && key === currentMonthKey) {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

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

    transactions.forEach((t) => {
      const d = new Date(t.date?.seconds * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (map[key]) {
        if (t.type === "income") map[key].Income += t.amount;
        else map[key].Expense += t.amount;
      }
    });

    return Object.values(map);
  }, [transactions]);

  const spendingVsBudget = useMemo(() => {
    const actual = {};
    transactions.forEach((t) => {
      const d = new Date(t.date?.seconds * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key === currentMonthKey && t.type === "expense") {
        actual[t.category] = (actual[t.category] || 0) + t.amount;
      }
    });

    return Object.keys({ ...budgets, ...actual }).map((cat) => ({
      name: cat,
      Budget: budgets[cat] || 0,
      Actual: actual[cat] || 0,
    }));
  }, [budgets, transactions]);

  if (loading) return <div className="p-6">Loading Insights...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg text-gray-500">Total Income</h2>
          <div className="text-3xl text-green-600 font-bold">{formatCurrency(income)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg text-gray-500">Total Expense</h2>
          <div className="text-3xl text-red-600 font-bold">{formatCurrency(expense)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg text-gray-500">Net Savings</h2>
          <div className="text-3xl text-blue-600 font-bold">{formatCurrency(income - expense)}</div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
        {Object.keys(budgets).length === 0 ? (
          <p className="text-gray-500">No budget set for this month.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(budgets).map(([category, limit]) => {
              const spent = spendingByCategory.find((c) => c.name === category)?.value || 0;
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
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

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Income vs Expense Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={formatCurrency} />
              <Legend />
              <Line type="monotone" dataKey="Income" stroke="#4CAF50" />
              <Line type="monotone" dataKey="Expense" stroke="#F44336" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Optional Budget Comparison */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Spending vs Budget</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={spendingVsBudget}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={formatCurrency} />
            <Legend />
            <Bar dataKey="Budget" fill="#8884d8" radius={[10, 10, 0, 0]} />
            <Bar dataKey="Actual" fill="#82ca9d" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Insight;
