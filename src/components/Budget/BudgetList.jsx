import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const BudgetList = ({ budgetLimits, onEdit, onDelete, deletingCategory }) => {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl bg-white p-4 shadow">
      <h2 className="mb-4 text-2xl font-semibold text-indigo-600">
        Your Budget Limits in Expense Categories.
      </h2>
      {Object.keys(budgetLimits).length === 0 ? (
        <p className="py-4 text-center text-gray-500">No budgets set for this month.</p>
      ) : (
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-100 text-left uppercase tracking-wide text-gray-600">
              <th className="p-3">Category</th>
              <th className="p-3">Limit (Rs)</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(budgetLimits).map(([category, limit]) => (
              <tr key={category} className="border-t">
                <td className="p-3 capitalize">{category}</td>
                <td className="p-3 font-medium">Rs {limit}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit({ category, limit })}
                      className="rounded-md p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Edit budget for ${category}`}
                      disabled={Boolean(deletingCategory)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(category)}
                      className="rounded-md p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Delete budget for ${category}`}
                      disabled={Boolean(deletingCategory)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BudgetList;
