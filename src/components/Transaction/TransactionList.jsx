import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";
import { db } from "../../firebase/db";
import { auth } from "../../firebase/auth";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [editTxn, setEditTxn] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (rawDate) => {
    try {
      if (rawDate?.toDate) return rawDate.toDate().toISOString().slice(0, 10);
      if (rawDate instanceof Date) return rawDate.toISOString().slice(0, 10);
      if (typeof rawDate === "string") {
        const parsed = new Date(rawDate);
        return Number.isNaN(parsed.getTime()) ? "-" : parsed.toISOString().slice(0, 10);
      }
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
    if (!user || pendingDeleteId) return;
    setPendingDeleteId(id);
    const docRef = doc(db, `users/${user.uid}/transactions/${id}`);
    try {
      await deleteDoc(docRef);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !editTxn?.id || isUpdating) return;
    setIsUpdating(true);

    try {
      const { id, ...data } = editTxn;
      const docRef = doc(db, `users/${user.uid}/transactions/${id}`);

      await updateDoc(docRef, {
        ...data,
        date: Timestamp.fromDate(new Date(`${data.date}T00:00:00`)),
        updatedAt: new Date(),
      });
      setEditTxn(null);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((snapshotDoc) => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
      }));
      setTransactions(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mx-auto mt-8 w-full max-w-4xl">
      <h2 className="mb-4 text-center text-4xl font-bold">Your Transactions</h2>
      <div className="overflow-x-auto rounded-xl bg-white shadow-md">
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
                <td colSpan="6" className="py-6 text-center text-gray-500">
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
                  <td className="p-3">{txn.description || "-"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-md p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setEditTxn({ ...txn, date: formatDate(txn.date) })}
                        aria-label={`Edit transaction ${txn.category}`}
                        disabled={Boolean(pendingDeleteId)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => handleDelete(txn.id)}
                        aria-label={`Delete transaction ${txn.category}`}
                        disabled={Boolean(pendingDeleteId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setEditTxn(null)}
              className="absolute right-3 top-3 text-gray-500 hover:text-red-500"
            >
              x
            </button>
            <h2 className="mb-4 text-center text-xl font-semibold">Edit Transaction</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="date"
                value={editTxn.date}
                onChange={(e) => setEditTxn({ ...editTxn, date: e.target.value })}
                className="w-full rounded border p-2"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={editTxn.category}
                onChange={(e) => setEditTxn({ ...editTxn, category: e.target.value })}
                className="w-full rounded border p-2"
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={editTxn.amount}
                onChange={(e) =>
                  setEditTxn({ ...editTxn, amount: parseFloat(e.target.value) })
                }
                className="w-full rounded border p-2"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={editTxn.description}
                onChange={(e) => setEditTxn({ ...editTxn, description: e.target.value })}
                className="w-full rounded border p-2"
              />
              <select
                value={editTxn.type}
                onChange={(e) => setEditTxn({ ...editTxn, type: e.target.value })}
                className="w-full rounded border p-2"
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Updating..." : "Update Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
