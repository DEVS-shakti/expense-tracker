import React, { useEffect, useState } from "react";
import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore";
import { Plus } from "lucide-react";
import { auth } from "../firebase/auth";
import { db } from "../firebase/db";
import BudgetList from "../components/Budget/BudgetList";
import BudgetForm from "../components/Budget/BudgetForm";

const BudgetingPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [budgetLimits, setBudgetLimits] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

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

  const handleDeleteBudget = async (category) => {
    const user = auth.currentUser;
    if (!user || deletingCategory) return;
    setDeletingCategory(category);

    try {
      const docRef = doc(db, `users/${user.uid}/budgets/${selectedMonth}`);
      await updateDoc(docRef, {
        [`categoryLimits.${category}`]: deleteField(),
      });

      setBudgetLimits((current) => {
        const updated = { ...current };
        delete updated[category];
        return updated;
      });
    } finally {
      setDeletingCategory(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setShowForm(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold text-indigo-700">Monthly Budget</h1>

      <div className="mb-4">
        <label className="mr-2 font-medium">Select Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded border p-2"
        />
      </div>

      <BudgetList
        budgetLimits={budgetLimits}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteBudget}
        deletingCategory={deletingCategory}
      />

      <button
        onClick={handleOpenCreate}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-indigo-600 p-4 text-white shadow-lg transition hover:bg-indigo-700"
      >
        <Plus className="h-6 w-6" />
      </button>

      {showForm && (
        <BudgetForm
          selectedMonth={selectedMonth}
          initialBudget={editingBudget}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default BudgetingPage;
