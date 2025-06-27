// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  Home,
  DollarSign,
  Filter,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../index.css";
import TransactionList from "../components/Transaction/TransactionList";
import TransactionForm from "../components/Transaction/TransactionForm";
import Insights from "./Insight";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  const displayName = user.email.split("@")[0];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, `users/${user.uid}/transactions`),
        orderBy("date", "desc")
      ),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const raw = doc.data();
          const date = raw.date instanceof Timestamp ? raw.date.toDate() : new Date(raw.date);
          return { id: doc.id, ...raw, date };
        });
        setTransactions(data);

        const monthsSet = new Set();
        data.forEach((t) => {
          const d = new Date(t.date);
          const key = `${d.getFullYear()}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`;
          monthsSet.add(key);
        });
        const monthsArray = Array.from(monthsSet).sort().reverse();
        setAvailableMonths(monthsArray);
        if (!selectedDate && monthsArray.length > 0) {
          setSelectedDate(monthsArray[0]);
        }
      }
    );
    return () => unsubscribe();
  }, [user.uid, selectedDate]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      return key === selectedDate;
    });
  }, [transactions, selectedDate]);

  const { totalIncome, totalExpenses, netSavings } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expenses += t.amount;
    });
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses,
    };
  }, [filteredTransactions]);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
          <Home className="w-6 h-6 sm:w-8 sm:h-8" /> Dashboard
        </h1>
        <div className="flex items-center gap-4 text-gray-600">
          <span className="font-medium hidden sm:inline">Welcome, {displayName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600 transition cursor-pointer duration-300 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between bg-white p-4 rounded-xl shadow">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-600" />
          <label htmlFor="month-select" className="font-medium text-lg">
            Select Month:
          </label>
          <select
            id="month-select"
            className="p-2 border border-gray-300 border-solid rounded-lg shadow-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {new Date(`${month}-01`).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>
        <a href="#transactionlist">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition text-sm">
            See Transaction
          </button>
        </a>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <Insights selectedDate={selectedDate} />
      </div>

      <div id="transactionlist" className="mt-8">
        <TransactionList />
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition z-50"
        aria-label="Add Transaction"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg mx-4 p-6 rounded-xl shadow-xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Add Transaction
            </h2>
            <TransactionForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
