// src/components/Budget/BudgetForm.jsx
import React, { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

const BudgetForm = ({ onClose, selectedMonth }) => {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !selectedMonth || !category || !limit) return;

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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-4 text-gray-500 hover:text-red-500" onClick={onClose}>✕</button>
        <h2 className="text-xl font-semibold mb-4 text-center">Add Budget</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Limit (₹)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Save Budget
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
