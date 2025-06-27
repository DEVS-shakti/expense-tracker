import React, { useState } from "react";
import TransactionList from "../components/Transaction/TransactionList";
import TransactionForm from "../components/Transaction/TransactionForm";
import { Plus } from "lucide-react";

const Transactions = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Your Transactions</h2>

      {/* Transaction List */}
      <TransactionList />

      {/* Floating Add Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition z-50"
        aria-label="Add Transaction"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Add Transaction
            </h2>
            <TransactionForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
