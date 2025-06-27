// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Area,
  AreaChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  CartesianGrid,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import heroImg from "../assets/finnance.svg"; // optional image
import work from "../assets/work.svg"; // optional image
import secure from "../assets/secure.svg"; // optional image
import Visual from "../assets/visual.svg"; // optional image
import "../index.css";
const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) navigate("/dashboard");
    else navigate("/login");
  };

  return (
    <div className="overflow-x-hidden min-h-screen flex flex-col justify-between bg-white text-gray-800">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 shadow bg-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-indigo-700">💸 ExpenseTrack</h1>
        <nav className="space-x-4">
          <a href="#adtg" className="decoration-white">
            <button className=" text-black py-2 px-4 rounded-lg shadow hover:bg-blue-600 hover:text-white transition">
              Advantages
            </button>
          </a>
          <a href="#insight" className="decoration-white">
            <button className=" text-black py-2 px-4 rounded-lg shadow hover:bg-blue-600 hover:text-white transition">
              Insights
            </button>
          </a>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:text-black hover:bg-white transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:text-black hover:bg-white transition"
          >
            Register
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-16 bg-gradient-to-br from-indigo-100 to-white">
        <h2 className="text-5xl font-bold mb-4 text-indigo-700">
          Track, Save, Grow.
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Simplify your finances with a smart, personal expense tracker.
        </p>
        <button
          onClick={handleStart}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg shadow hover:bg-indigo-700 transition"
        >
          Get Started
        </button>

        {heroImg && (
          <img
            src={heroImg}
            alt="Finance Illustration"
            className="mt-12 w-full max-w-md mx-auto"
          />
        )}
      </section>

      {/* Features Section - Full Width Flex Column with SVGs */}
      <section className="w-[100vw] p-5 bg-white">
        <h3
          id="adtg"
          className="text-3xl font-bold text-indigo-700 mb-12 text-center"
        >
          Why Use ExpenseTracker?
        </h3>

        <div className=" max-w-5xl mx-auto flex flex-col justify-center gap-6">
          {/* Advantage 1 */}
          <div className="w-full flex flex-col md:flex-row items-center gap-6 hover:bg-indigo-50 p-10 rounded-xl shadow-md shadow-black ">
            <img alt="Analytics" src={Visual} className="w-48 h-48" />
            <div>
              <h4 className="text-3xl font-bold mb-2">📊 Visual Reports</h4>
              <p className="text-gray-600">
                Track your income, expenses, and budgets with beautiful charts
                and real-time data visualizations.
              </p>
            </div>
          </div>

          {/* Advantage 2 */}
          <div className="flex flex-col md:flex-row items-center gap-6 hover:bg-indigo-50 p-6 rounded-xl shadow-md shadow-black ">
            <div>
              <h4 className="text-3xl font-bold  mb-2">
                🔒 Secure & Private
              </h4>
              <p className="text-gray-600">
                Your data is secured with Firebase Auth and Firestore rules.
                Only you can access your finances.
              </p>
            </div>
            <img src={secure} alt="Secure" className="w-48 h-48 mr-auto" />
          </div>

          {/* Advantage 3 */}
          <div className="flex flex-col md:flex-row items-center gap-6 hover:bg-indigo-50 p-6 rounded-xl shadow-md shadow-black ">
            <img src={work} alt="Responsive" className="w-48 h-48" />
            <div>
              <h4 className="text-3xl font-bold mb-2">📱 Works Anywhere</h4>
              <p className="text-gray-600">
                Fully responsive — works on all screen sizes: mobile, tablet,
                and desktop.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 py-20 bg-gray-50">
        <h3
          id="insight"
          className="text-3xl font-bold text-indigo-700 mb-12 text-center"
        >
          Smart Insights
        </h3>

        <div className="charts grid grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h4 className="text-lg font-semibold text-indigo-700 mb-4">
              Spending by Category
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Food", value: 300 },
                    { name: "Rent", value: 700 },
                    { name: "Transport", value: 150 },
                    { name: "Travel", value: 350 },
                  ]}
                  dataKey="value"
                  outerRadius={80}
                  label
                >
                  <Cell fill="#6366F1" />
                  <Cell fill="#F87171" />
                  <Cell fill="#34D399" />
                  <Cell fill="#34D869" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h4 className="text-lg font-semibold text-indigo-700 mb-4">
              Income vs Expense
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: "June", Income: 4000, Expenses: 2800 },
                  { name: "July", Income: 2300, Expenses: 4000 },
                  { name: "August", Income: 1205, Expenses: 5000 },
                  { name: "September", Income: 7000, Expenses: 888 },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis dataKey="Expenses" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Income" fill="#4ADE80" />
                <Bar dataKey="Expenses" fill="#F87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h4 className="text-lg font-semibold text-indigo-700 mb-4">
              6-Month Trend
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={[
                  { name: "Jan", Income: 3000, Expenses: 2000 },
                  { name: "Feb", Income: 3200, Expenses: 2500 },
                  { name: "Mar", Income: 3100, Expenses: 2800 },
                  { name: "Apr", Income: 4500, Expenses: 3200 },
                  { name: "May", Income: 4700, Expenses: 3400 },
                  { name: "Jun", Income: 4000, Expenses: 2900 },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Income"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Area chart */}
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h4 className="text-lg font-semibold text-indigo-700 mb-4">
              Income & Expense Visualization
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={[
                  { name: "Jan", Income: 3000, Expenses: 2000 },
                  { name: "Feb", Income: 3200, Expenses: 2500 },
                  { name: "Mar", Income: 3100, Expenses: 2800 },
                  { name: "Apr", Income: 4500, Expenses: 3200 },
                  { name: "May", Income: 4700, Expenses: 3400 },
                  { name: "Jun", Income: 4000, Expenses: 2900 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis dataKey="Income" />
                <Tooltip />
                <Area type="monotone" dataKey="Income" fill="green"></Area>
                <Area type="monotone" dataKey="Expenses" fill="red"></Area>
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* composed graph */}
        <div className="bg-white w-full p-6 rounded-xl shadow text-center">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4">
            Total Income & Expense
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart
              data={[
                {
                  name: "Jan",
                  Income: 3000,
                  Expenses: 2000,
                  Savings: 1000,
                  Total: 5000,
                },
                {
                  name: "Feb",
                  Income: 3200,
                  Expenses: 2500,
                  Savings: 700,
                  Total: 5700,
                },
                {
                  name: "Mar",
                  Income: 3100,
                  Expenses: 2800,
                  Savings: 700,
                  Total: 5900,
                },
                {
                  name: "Apr",
                  Income: 4500,
                  Expenses: 3200,
                  Savings: 1300,
                  Total: 7700,
                },
                {
                  name: "May",
                  Income: 3000,
                  Expenses: 3000,
                  Savings: 1300,
                  Total: 6000,
                },
                {
                  name: "Jun",
                  Income: 4000,
                  Expenses: 2000,
                  Savings: 1100,
                  Total: 6000,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis dataKey="Total" />
              <Tooltip />
              <Legend />
              <Bar type="monotone" dataKey="Income" fill="green"></Bar>
              <Bar type="monotone" dataKey="Savings" fill="red"></Bar>
              <Area
                type="monotone"
                dataKey="Expenses"
                fill="violet"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Total"
                stroke="blue"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-slate-950 text-center p-6">
        <p>
          &copy; {new Date().getFullYear()} ExpenseTrack. Built with 💖 using
          React & Firebase.
        </p>
        <p className="text-sm mt-2">Made by DevSahu 😎</p>
      </footer>
    </div>
  );
};

export default Landing;
