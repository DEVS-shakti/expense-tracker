import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, List, BarChart2, User, LogOut, Menu, X, Folder,DollarSign } from "lucide-react"; // Add Folder icon

const navItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/dashboard/transactions", icon: List, label: "Transactions" },
  { to: "/dashboard/insights", icon: BarChart2, label: "Insights" },
  { to: "/dashboard/categories", icon: Folder, label: "Categories" }, // ✅ Add this line
  { to: "/dashboard/budgets", icon: DollarSign, label: "Budgets" },
  { to: "/dashboard/profile", icon: User, label: "Profile" },
];


const SidebarItem = ({ to, Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 ${
        isActive
          ? "bg-indigo-100 text-indigo-700 font-semibold"
          : "text-gray-700"
      } hover:bg-indigo-50 ${collapsed ? "justify-center flex" : ""}`
    }
  >
    <Icon className="w-5 h-5" />
    {!collapsed && <span>{label}</span>}
  </NavLink>
);

const DashboardLayout = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="bg-white shadow p-2 rounded-lg text-gray-700"
          >
            <Menu />
          </button>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full bg-white shadow-md z-40 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="h-full flex flex-col justify-between p-4">
          <div>
            <div className="flex items-center justify-between mb-6">
              {!collapsed && (
                <h1 className="text-xl font-bold text-indigo-600">
                  💸 ExpenseTrack
                </h1>
              )}
              <button
                className="hidden md:block text-gray-600"
                onClick={toggleCollapse}
              >
                {collapsed ? <Menu /> : <X />}
              </button>
              <button
                className="md:hidden text-gray-600"
                onClick={() => setMobileOpen(false)}
              >
                <X />
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map(({ to, icon, label }) => (
                <SidebarItem
                  key={to}
                  to={to}
                  Icon={icon}
                  label={label}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className={`flex items-center gap-2 text-red-500 hover:underline px-4 py-2 ${
              collapsed ? "justify-center flex" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 bg-gray-50 overflow-y-auto transition-all duration-300 p-4 md:p-6`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
