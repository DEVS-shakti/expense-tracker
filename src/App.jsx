import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Landing from "./pages/LandingPage";
import Transactions from "./pages/Transaction";
import Insights from "./pages/Insight";
import Profile from "./pages/Profile";
import DashboardLayout from "./layouts/DashboardLayout";
import CategoriesPage from "./pages/CategoriesPage";
import BudgetingPage from "./pages/BudgetingPage";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeSwitcher from "./components/ThemeSwitcher";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ThemeSwitcher />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoutes>
                  <DashboardLayout />
                </ProtectedRoutes>
              }
            >
              <Route
                path="categories"
                element={
                  <ProtectedRoutes>
                    <CategoriesPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                index
                element={
                  <ProtectedRoutes>
                    <Dashboard />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="transactions"
                element={
                  <ProtectedRoutes>
                    <Transactions />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="insights"
                element={
                  <ProtectedRoutes>
                    <Insights />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="budgets"
                element={
                  <ProtectedRoutes>
                    <BudgetingPage />
                  </ProtectedRoutes>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoutes>
                    <Profile />
                  </ProtectedRoutes>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
