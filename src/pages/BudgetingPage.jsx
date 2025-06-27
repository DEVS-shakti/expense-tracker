import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import BudgetList from "../components/Budget/BudgetList";
import BudgetForm from "../components/Budget/BudgetForm";
import { Plus } from "lucide-react";

const BudgetingPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [budgetLimits, setBudgetLimits] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchBudgets = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, `users/${user.uid}/budgets/${selectedMonth}`);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setBudgetLimits(snapshot.data().categoryLimits || {});
      } else {
        setBudgetLimits({});
      }
    };
    fetchBudgets();
  }, [selectedMonth, showForm]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">📊 Monthly Budget</h1>

      {/* Month Selector */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {/* Budget List */}
      <BudgetList budgetLimits={budgetLimits} />

      {/* Floating Add Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {showForm && (
        <BudgetForm selectedMonth={selectedMonth} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default BudgetingPage;
