// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { Home, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../index.css";
import TransactionList from "../components/Transaction/TransactionList";
import TransactionForm from "../components/Transaction/TransactionForm";
import Insights from "./Insight";
import { getUserDisplayName } from "../utils/user";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const displayName = getUserDisplayName(user);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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

      <div className="mb-6 flex justify-end">
        <a href="#transactionlist">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition text-sm">
            See Transaction
          </button>
        </a>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <Insights />
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

