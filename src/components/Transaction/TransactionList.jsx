import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [editTxn, setEditTxn] = useState(null);

  const formatDate = (rawDate) => {
    try {
      if (rawDate?.toDate) return rawDate.toDate().toISOString().slice(0, 10);
      if (rawDate instanceof Date) return rawDate.toISOString().slice(0, 10);
      return "-";
    } catch {
      return "-";
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleDelete = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/transactions/${id}`);
    await deleteDoc(docRef);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !editTxn?.id) return;

    const { id, ...data } = editTxn;
    const docRef = doc(db, `users/${user.uid}/transactions/${id}`);

    await updateDoc(docRef, {
      ...data,
      date: new Date(data.date),
      updatedAt: new Date(),
    });
    setEditTxn(null);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-4xl font-bold text-center mb-4">Your Transactions</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase tracking-wider">
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Description</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn.id} className="border-t text-sm">
                  <td className="p-3">{formatDate(txn.date)}</td>
                  <td
                    className={`p-3 ${
                      txn.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {txn.type}
                  </td>
                  <td className="p-3">{txn.category}</td>
                  <td className="p-3 font-medium">{formatCurrency(txn.amount)}</td>
                  <td className="p-3">{txn.description || "—"}</td>
                  <td className="p-3 space-x-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => setEditTxn({ ...txn, date: formatDate(txn.date) })}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(txn.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editTxn && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md mx-4 p-6 rounded-xl shadow-xl relative">
            <button
              onClick={() => setEditTxn(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">Edit Transaction</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="date"
                value={editTxn.date}
                onChange={(e) => setEditTxn({ ...editTxn, date: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={editTxn.category}
                onChange={(e) => setEditTxn({ ...editTxn, category: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={editTxn.amount}
                onChange={(e) =>
                  setEditTxn({ ...editTxn, amount: parseFloat(e.target.value) })
                }
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={editTxn.description}
                onChange={(e) => setEditTxn({ ...editTxn, description: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <select
                value={editTxn.type}
                onChange={(e) => setEditTxn({ ...editTxn, type: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                Update Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
