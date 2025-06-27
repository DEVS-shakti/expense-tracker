// src/pages/CategoriesPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

const CategoriesPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, `users/${user.uid}/categories`));
    setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addCategory = async () => {
    if (!name) return;
    await addDoc(collection(db, `users/${user.uid}/categories`), {
      name,
      type,
      createdAt: new Date(),
    });
    setName('');
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/categories/${id}`));
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name"
          className="border px-3 py-2 rounded"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="border px-2 py-2 rounded">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button onClick={addCategory} className="bg-indigo-500 text-white px-4 py-2 rounded">Add</button>
      </div>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
            <span>{cat.name} ({cat.type})</span>
            <button onClick={() => deleteCategory(cat.id)} className="text-red-600 hover:underline">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;
