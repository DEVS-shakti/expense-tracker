import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeSwitcher from "./components/ThemeSwitcher";
import LoadingScreen from "./components/ui/LoadingScreen";

const Landing = lazy(() => import("./pages/LandingPage"));
const LoginForm = lazy(() => import("./components/Auth/LoginForm"));
const RegisterForm = lazy(() => import("./components/Auth/RegisterForm"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transaction"));
const Insights = lazy(() => import("./pages/Insight"));
const Profile = lazy(() => import("./pages/Profile"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const BudgetingPage = lazy(() => import("./pages/BudgetingPage"));

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ThemeSwitcher />
          <Suspense fallback={<LoadingScreen fullScreen label="Loading page..." />}>
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
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
