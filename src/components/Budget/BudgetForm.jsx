import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase/db";
import { auth } from "../../firebase/auth";

const BudgetForm = ({ onClose, selectedMonth, initialBudget = null }) => {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await getDocs(collection(db, `users/${user.uid}/categories`));
      const expenseCategories = snapshot.docs
        .map((snapshotDoc) => snapshotDoc.data())
        .filter((item) => item.type === "expense")
        .map((item) => item.name)
        .sort((a, b) => a.localeCompare(b));

      setCategories(expenseCategories);
      setCategory((current) => (expenseCategories.includes(current) ? current : ""));
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!initialBudget) {
      setCategory("");
      setLimit("");
      return;
    }

    setCategory(initialBudget.category || "");
    setLimit(initialBudget.limit?.toString() || "");
  }, [initialBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !selectedMonth || !category || !limit || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const docRef = doc(db, `users/${user.uid}/budgets/${selectedMonth}`);
      const snap = await getDoc(docRef);
      const currentData = snap.exists() ? snap.data() : {};

      const newData = {
        ...currentData,
        categoryLimits: {
          ...(currentData.categoryLimits || {}),
          [category]: parseFloat(limit),
        },
      };

      await setDoc(docRef, newData, { merge: true });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <button
          type="button"
          className="absolute right-4 top-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          x
        </button>
        <h2 className="mb-4 text-center text-xl font-semibold">
          {initialBudget ? "Edit Budget" : "Add Budget"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border p-2"
            required
          >
            <option value="">Select Expense Category</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {categories.length === 0 && (
            <p className="text-sm text-amber-700">
              No expense categories found. Add one in Categories first.
            </p>
          )}

          <input
            type="number"
            placeholder="Limit (Rs)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full rounded-lg border p-2"
            required
          />

          <button
            type="submit"
            disabled={categories.length === 0 || isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Budget"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
