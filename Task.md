## Project Task Breakdown: Expense Tracker / Budgeting App

*~_`This breakdown is structured to follow a logical development flow. Tackle tasks within each phase before moving to the next.`_~*

### Phase 1: Project Setup & Core Infrastructure (Foundation)

**Goal:** Get your development environment ready and connect to Firebase.

  * **Task 1.1: Create Firebase Project**
      * Go to the [Firebase Console](https://console.firebase.google.com/).
      * Click "Add project" and follow the prompts.
      * Choose a unique project ID.
      * (Optional but recommended) Disable Google Analytics for simplicity if it's a learning project.
  * **Task 1.2: Create React Project**
      * Open your terminal/command prompt.
      * Use Vite (recommended for speed):
        ```bash
        npm create vite@latest my-expense-tracker --template react
        cd my-expense-tracker
        npm install
        ```
      * (Alternatively, with Create React App if preferred):
        ```bash
        npx create-react-app my-expense-tracker
        cd my-expense-tracker
        npm install
        ```
  * **Task 1.3: Install Firebase SDK in React App**
      * In your React project directory:
        ```bash
        npm install firebase
        ```
  * **Task 1.4: Initialize Firebase in React App**
      * In your Firebase Console, go to "Project settings" (gear icon) -\> "Your apps".
      * Click the `</>` icon (Web app) to add a new web app. Register it and copy the `firebaseConfig` object.
      * Create a file `src/firebase.js` (or `src/lib/firebase.js` for better organization).
      * Paste the config and initialize Firebase:
        ```javascript
        // src/firebase.js
        import { initializeApp } from "firebase/app";
        import { getAuth } from "firebase/auth";
        import { getFirestore } from "firebase/firestore";
        // import { getFunctions } from "firebase/functions"; // If using Cloud Functions

        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        export const auth = getAuth(app);
        export const db = getFirestore(app);
        // export const functions = getFunctions(app); // For Cloud Functions
        ```
  * **Task 1.5: Set up Basic Routing (React Router)**
      * Install: `npm install react-router-dom`
      * Set up `BrowserRouter` in `src/main.jsx` (or `src/index.js`) and define placeholder routes (e.g., `/login`, `/register`, `/dashboard`).

### Phase 2: User Authentication

**Goal:** Allow users to sign up, log in, and manage their sessions.

  * **Task 2.1: Enable Authentication Providers (Firebase Console)**
      * In Firebase Console -\> "Build" -\> "Authentication" -\> "Get started".
      * Go to the "Sign-in method" tab.
      * Enable "Email/Password" and "Google" (or any other you prefer).
  * **Task 2.2: Create Login/Register UI Components (React)**
      * Create `src/components/Auth/LoginForm.jsx` and `src/components/Auth/RegisterForm.jsx`.
      * Include input fields for email/password, a submit button, and a link to the other form.
      * Add a "Sign in with Google" button.
  * **Task 2.3: Implement Authentication Logic (React)**
      * Use Firebase Auth functions (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signInWithPopup`, `signOut`).
      * Handle success (redirect to dashboard) and error states (display messages).
  * **Task 2.4: Create Authentication Context/Hook (React)**
      * Create `src/context/AuthContext.jsx` (or `src/hooks/useAuth.js`) to manage user state globally.
      * Use `onAuthStateChanged` to listen for auth state changes and provide the `currentUser` object to your app.
  * **Task 2.5: Implement Protected Routes (React)**
      * Create `src/components/ProtectedRoute.jsx` that checks if a user is logged in. If not, redirect to login page. Apply this to your dashboard and other private routes.

### Phase 3: Core Data Management (Transactions)

**Goal:** Allow authenticated users to add, view, edit, and delete their financial transactions.

  * **Task 3.1: Design Firestore Data Model for Transactions**
      * Remember: `users/{userId}/transactions/{transactionId}` for user-specific data.
      * Fields: `amount`, `type` (`"expense"`/`"income"`), `category`, `description`, `date` (Timestamp), `createdAt` (Timestamp).
  * **Task 3.2: Implement Firestore Security Rules for Transactions**
      * In Firebase Console -\> "Build" -\> "Firestore Database" -\> "Rules".
      * Write rules to ensure users can ONLY read/write their own transactions subcollection.
        ```firestore
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // User can only read/write their own user document
            match /users/{userId} {
              allow read, write: if request.auth.uid == userId;
            }

            // User can only read/write to their own transactions subcollection
            match /users/{userId}/transactions/{transactionId} {
              allow read, write: if request.auth.uid == userId;
            }
          }
        }
        ```
  * **Task 3.3: Create Add Transaction Form Component (React)**
      * `src/components/Transactions/TransactionForm.jsx`
      * Input fields for amount, type (radio/dropdown), category (will be dynamic later), date (date picker), description.
      * Connect to Firestore using `addDoc` (to `users/${auth.currentUser.uid}/transactions`).
  * **Task 3.4: Create Transactions List Component (React)**
      * `src/components/Transactions/TransactionList.jsx`
      * Fetch transactions from Firestore for the current user (`query`, `where`, `orderBy`).
      * Display them in a table or list.
      * Use `onSnapshot` for real-time updates.
  * **Task 3.5: Implement Edit/Delete Functionality for Transactions (React)**
      * Add "Edit" and "Delete" buttons to each transaction in the list.
      * For "Edit": Prefill the `TransactionForm` with existing data and use `updateDoc`.
      * For "Delete": Use `deleteDoc`.

### Phase 4: Categories Management

**Goal:** Allow users to define their own expense/income categories.

  * **Task 4.1: Design Firestore Data Model for Categories**
      * `users/{userId}/categories/{categoryId}`
      * Fields: `name` (string), `type` (`"expense"`/`"income"`), `createdAt` (Timestamp).
  * **Task 4.2: Update Firestore Security Rules for Categories**
      * Add rules similar to transactions for the `categories` subcollection.
  * **Task 4.3: Create Categories Management UI (React)**
      * `src/pages/CategoriesPage.jsx`
      * Component to list user's categories.
      * Form to add new categories.
      * Buttons to edit/delete existing categories.
  * **Task 4.4: Integrate Categories with Transaction Form (React)**
      * Modify `TransactionForm.jsx` to dynamically load categories from Firestore (for the current user) and populate the category dropdown.

### Phase 5: Budgeting Module

**Goal:** Enable users to set monthly budgets per category and track spending against them.

  * **Task 5.1: Design Firestore Data Model for Budgets**
      * `users/{userId}/budgets/{budgetId}` (e.g., `budgets/2025-07` for July 2025).
      * Fields: `month` (string, e.g., "2025-07"), `categoryLimits` (Map: `{ "Food": 500, "Transport": 200 }`).
  * **Task 5.2: Update Firestore Security Rules for Budgets**
      * Add rules for the `budgets` subcollection.
  * **Task 5.3: Create Budget Setup/Management UI (React)**
      * `src/pages/BudgetingPage.jsx`
      * Allow users to select a month/period.
      * Display current budget limits per category for that period.
      * Form to add/edit budget limits.
  * **Task 5.4: Display Budget Progress on Dashboard/Budget Page (React)**
      * Fetch current month's budget.
      * Calculate total spending for each category for the current month by querying transactions.
      * Display "Spent X of Y" for each category.

### Phase 6: Dashboard & Reporting (Data Visualization)

**Goal:** Present a visual overview of financial data.

  * **Task 6.1: Install Charting Library**
      * Choose one: `npm install recharts` or `npm install react-chartjs-2 chart.js`.
  * **Task 6.2: Design Dashboard Layout (React)**
      * `src/pages/Dashboard.jsx`
      * Section for summary (total income/expense this month).
      * Area for budget overview.
      * Sections for charts.
  * **Task 6.3: Implement Key Charts (React)**
      * **Monthly Spending by Category (Bar/Pie Chart):**
          * Fetch all transactions for the current month.
          * Aggregate spending per category.
          * Render chart.
      * **Income vs. Expense Trend (Line Chart):**
          * Fetch transactions for last N months.
          * Aggregate total income and total expense for each month.
          * Render line chart.
      * (Optional) **Spending vs. Budget Chart:** Combine budget limits and actual spending in a bar chart.

### Phase 7: Advanced Features (Firebase Cloud Functions - Node.js) - Optional but Good for Real-World Scenarios

**Goal:** Automate backend tasks that aren't easily done client-side. *Remember this requires the Blaze plan, but it has a free tier for basic usage.*

  * **Task 7.1: Initialize Cloud Functions (CLI)**
      * Ensure you have Firebase CLI installed: `npm install -g firebase-tools`.
      * In your project root (same level as `my-expense-tracker` folder):
        ```bash
        firebase init functions
        ```
          * Choose a new directory for functions (e.g., `functions/`).
          * Select JavaScript or TypeScript.
          * Install dependencies.
  * **Task 7.2: Write a Scheduled Function (Node.js)**
      * **Monthly Budget Creation/Reset:** A function that runs on the 1st of every month to:
          * Create a new budget document for each user for the new month, potentially copying over previous month's budget or setting defaults.
          * (Optional) Send a summary email of last month's spending.
  * **Task 7.3: Deploy Cloud Functions**
      * ```bash
          firebase deploy --only functions
        ```
  * **Task 7.4: (Optional) Implement HTTP Callable Function**
      * If there's any complex calculation or external API call that you don't want client-side, create an HTTPS callable function and call it from your React app.

### Phase 8: Deployment & Polish

**Goal:** Make your app live and refine user experience.

  * **Task 8.1: Configure Firebase Hosting**
      * In your React app's `package.json`, ensure your build script creates a `build` (or `dist` for Vite) folder.
      * In your project root: `firebase init hosting`
          * Select your Firebase project.
          * Set your public directory to `build` (or `dist`).
          * Configure as a single-page app (rewrite all URLs to `/index.html`).
  * **Task 8.2: Optimize for Production**
      * Run `npm run build` in your React app.
      * Review `firebase.json` for hosting settings.
  * **Task 8.3: Deploy to Firebase Hosting**
      * ```bash
          firebase deploy --only hosting
        ```
      * You'll get a public URL for your app\!
  * **Task 8.4: Add Error Handling & Loading States**
      * Throughout your React app, display loading spinners and informative error messages to the user.
  * **Task 8.5: Improve UI/UX (Styling)**
      * Use a CSS framework (e.g., Tailwind CSS, Material-UI, Chakra UI) or write custom CSS to make your app visually appealing.
  * **Task 8.6: Responsive Design**
      * Ensure your app looks good and functions well on different screen sizes (mobile, tablet, desktop).

-----
