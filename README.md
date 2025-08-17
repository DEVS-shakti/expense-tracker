# 💸 Expense Tracker App

A powerful and modern personal finance manager built with **React**, **Firebase**, and **Tailwind CSS**. Track income, expenses, budgets, and get actionable insights via interactive visualizations.

---


---

## 👥 For Users

### ✅ Key Features
- 🔐 **Secure Authentication** (Login/Register)
- 💼 **Track Transactions** (Income & Expenses)
- 📆 **Monthly Filters** for organizing data
- 📊 **Smart Insights** via charts & analytics
- 💸 **Budget Planner** per category/month
- 👤 **Profile Settings** (password reset, email prefs)

### 📱 Mobile-First Responsive Design
Optimized for all screen sizes including phones, tablets, and desktops.

---

## 👨‍💻 For Developers

### ⚙️ Tech Stack

| Frontend       | Backend         |
|----------------|------------------|
| React (Vite)   | Firebase Firestore |
| Tailwind CSS   | Firebase Auth     |
| Recharts       | Firebase Hosting  |
| Lucide Icons   | (Optional) Cloud Functions |

---

### 📦 Installation Steps

```bash
git clone https://github.com/DEVS-shakti/expense-tracker.git
cd expense-tracker
npm install 
 ```

### Configure Your Firebase Project
```
// src/firebase/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  ...
};
```

### Run App

```
npm run dev
```

### Project Structure

```
src/
├── components/
│   └── Transaction/
│   └── Budget/
├── context/
│   └── AuthContext.jsx
├── pages/
│   └── Dashboard.jsx
│   └── Profile.jsx
│   └── Insight.jsx
│   └── BudgetingPage.jsx
├── firebase/
│   └── firebase.js
└── App.jsx, main.jsx
```


