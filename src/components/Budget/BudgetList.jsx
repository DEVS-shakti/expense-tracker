// src/components/Budget/BudgetList.jsx
import React from "react";

const BudgetList = ({ budgetLimits }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6 overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Your Budget Limits</h2>
      {Object.keys(budgetLimits).length === 0 ? (
        <p className="text-gray-500 text-center py-4">No budgets set for this month.</p>
      ) : (
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase tracking-wide">
              <th className="p-3">Category</th>
              <th className="p-3">Limit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(budgetLimits).map(([category, limit]) => (
              <tr key={category} className="border-t">
                <td className="p-3 capitalize">{category}</td>
                <td className="p-3 font-medium">₹{limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BudgetList;
