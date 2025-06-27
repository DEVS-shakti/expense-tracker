import React, { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";

const TransactionForm = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, `users/${user.uid}/categories`));
      const fetched = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(fetched.filter((cat) => cat.type === type));
    };
    fetchCategories();
  }, [type, user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    await addDoc(collection(db, `users/${user.uid}/transactions`), {
      amount: parseFloat(amount),
      type,
      category,
      description,
      date,
      createdAt: serverTimestamp(),
    });

    setAmount(0);
    setCategory("");
    setDescription("");
    setType("expense");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <select
          className="border p-2 rounded w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <select
          className="border p-2 rounded w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <input
        type="number"
        className="border p-2 rounded w-full"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <input
        type="text"
        className="border p-2 rounded w-full"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="date"
        className="border p-2 rounded w-full"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        Add Transaction
      </button>
    </form>
  );
};

export default TransactionForm;
