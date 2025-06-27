// src/utils/mockUtils.js

export const MOCK_TRANSACTIONS = [
  { id: 't1', amount: 50, type: 'expense', category: 'Food', description: 'Groceries', date: new Date('2025-06-05') },
  { id: 't2', amount: 1500, type: 'income', category: 'Salary', description: 'Monthly salary', date: new Date('2025-06-01') },
  { id: 't3', amount: 30, type: 'expense', category: 'Transportation', description: 'Bus fare', date: new Date('2025-06-07') },
  { id: 't4', amount: 200, type: 'expense', category: 'Entertainment', description: 'Movie tickets', date: new Date('2025-06-10') },
  { id: 't5', amount: 75, type: 'expense', category: 'Food', description: 'Restaurant dinner', date: new Date('2025-06-12') },
  { id: 't6', amount: 500, type: 'income', category: 'Freelance', description: 'Project payment', date: new Date('2025-06-15') },
  { id: 't7', amount: 60, type: 'expense', category: 'Utilities', description: 'Electricity bill', date: new Date('2025-05-28') },
  { id: 't8', amount: 45, type: 'expense', category: 'Food', description: 'Cafe', date: new Date('2025-05-18') },
  { id: 't9', amount: 100, type: 'expense', category: 'Shopping', description: 'New shirt', date: new Date('2025-05-22') },
  { id: 't10', amount: 1200, type: 'income', category: 'Salary', description: 'Monthly salary', date: new Date('2025-05-01') },
  { id: 't11', amount: 80, type: 'expense', category: 'Entertainment', description: 'Concert', date: new Date('2025-05-25') },
  { id: 't12', amount: 120, type: 'expense', category: 'Transportation', description: 'Gas', date: new Date('2025-04-15') },
  { id: 't13', amount: 2000, type: 'income', category: 'Bonus', description: 'Yearly bonus', date: new Date('2025-04-01') },
  { id: 't14', amount: 40, type: 'expense', category: 'Food', description: 'Lunch', date: new Date('2025-04-20') },
];

export const MOCK_BUDGETS = {
  '2025-06': {
    Food: 300,
    Transportation: 100,
    Entertainment: 250,
    Utilities: 100,
    Shopping: 150,
  },
  '2025-05': {
    Food: 250,
    Transportation: 80,
    Entertainment: 200,
    Utilities: 90,
    Shopping: 120,
  },
};

export const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00bcd4', '#f44336', '#9c27b0'];

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

export const getMonthName = (date) => {
  return new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
};
