// src/pages/CategoriesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

const CategoriesPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, `users/${user.uid}/categories`));
    setCategories(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
  };

  const addCategory = async () => {
    const normalized = name.trim();
    if (!normalized) return;

    const exists = categories.some(
      (cat) =>
        cat.name.toLowerCase() === normalized.toLowerCase() && cat.type === type,
    );

    if (exists) {
      alert("This category already exists for the selected type.");
      return;
    }

    await addDoc(collection(db, `users/${user.uid}/categories`), {
      name: normalized,
      type,
      createdAt: new Date(),
    });

    setName("");
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/categories/${id}`));
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const expenseCategories = useMemo(
    () => categories.filter((cat) => cat.type === "expense"),
    [categories],
  );

  const incomeCategories = useMemo(
    () => categories.filter((cat) => cat.type === "income"),
    [categories],
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-2">Manage Categories</h2>
        <p className="text-sm text-gray-600 mb-4">
          Create and manage your income and expense groups for cleaner reporting.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="border px-3 py-2 rounded-lg flex-1"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <button
            onClick={addCategory}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add Category
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CategoryPanel
          title="Expense Categories"
          subtitle="Used for spending and budget tracking"
          tone="expense"
          categories={expenseCategories}
          onDelete={deleteCategory}
        />
        <CategoryPanel
          title="Income Categories"
          subtitle="Used for salary, freelance, and earnings"
          tone="income"
          categories={incomeCategories}
          onDelete={deleteCategory}
        />
      </div>
    </div>
  );
};

const CategoryPanel = ({ title, subtitle, tone, categories, onDelete }) => {
  const badgeClass =
    tone === "expense"
      ? "bg-rose-100 text-rose-700"
      : "bg-emerald-100 text-emerald-700";

  const icon = tone === "expense" ? "-" : "+";

  return (
    <div className="bg-white rounded-2xl shadow p-5 border border-gray-200">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClass}`}>
                  {icon}
                </span>
                <span className="font-medium">{cat.name}</span>
              </div>
              <button
                onClick={() => onDelete(cat.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoriesPage;
