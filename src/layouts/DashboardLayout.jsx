import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart2, DollarSign, Folder, Home, List, LogOut, Menu, User, X, Sparkles, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AssistantPanel } from "../components/Assistant/AssistantPanel";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/dashboard/transactions", icon: List, label: "Transactions" },
  { to: "/dashboard/insights", icon: BarChart2, label: "Insights" },
  { to: "/dashboard/categories", icon: Folder, label: "Categories" },
  { to: "/dashboard/budgets", icon: DollarSign, label: "Budgets" },
  { to: "/dashboard/profile", icon: User, label: "Profile" },
];

const SidebarItem = ({ to, icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-4 py-2 transition duration-200 ${
        isActive ? "bg-indigo-100 font-semibold text-indigo-700" : "text-gray-700"
      } hover:bg-indigo-50 ${collapsed ? "flex justify-center" : ""}`
    }
  >
    {React.createElement(icon, { className: "h-5 w-5" })}
    {!collapsed && <span>{label}</span>}
  </NavLink>
);

const DashboardLayout = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed left-4 top-4 z-50 md:hidden">
        {!mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg bg-white p-2 text-gray-700 shadow"
          >
            <Menu />
          </button>
        )}
      </div>

      <aside
        className={`fixed left-0 top-0 z-40 h-full transform bg-white shadow-md transition-transform duration-300 md:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div>
            <div className="mb-6 flex items-center justify-between">
              {!collapsed && <h1 className="text-xl font-bold text-indigo-600">ExpenseTrack</h1>}
              <button
                type="button"
                className="hidden text-gray-600 md:block"
                onClick={toggleCollapse}
              >
                {collapsed ? <Menu /> : <X />}
              </button>
              <button
                type="button"
                className="text-gray-600 md:hidden"
                onClick={() => setMobileOpen(false)}
              >
                <X />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <SidebarItem key={item.to} {...item} collapsed={collapsed} />
              ))}
            </nav>
          </div>

          <button
            type="button"
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 text-red-500 hover:underline ${
              collapsed ? "flex justify-center" : ""
            }`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden relative bg-gray-50 flex">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 transition-all duration-300 md:p-6">
          <Outlet />
        </div>

        {/* Smart Assistant Overlay Form */}
        {assistantOpen && (
          <div className="absolute inset-y-0 right-0 z-50 flex shadow-[rgba(0,_0,_0,_0.2)_0px_60px_40px_-7px] animate-in slide-in-from-right-8 duration-300">
            <AssistantPanel onClose={() => setAssistantOpen(false)} />
          </div>
        )}

        {/* Floating Action Button */}
        {!assistantOpen && (
          <button
            onClick={() => setAssistantOpen(true)}
            className="absolute bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-xl shadow-indigo-200 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all group duration-300"
            title="Ask Smart Assistant"
          >
            <Sparkles className="h-6 w-6" />
          </button>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;
