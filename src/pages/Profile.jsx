import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Clock3,
  Bell,
  KeyRound,
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { getUserDisplayName, getUserInitials } from "../utils/user";
import { forceLoadDemoData, isAllowedDemoUser } from "../services/demoSeed";

const Profile = () => {
  const { user, logout } = useAuth();
  const [showPrefs, setShowPrefs] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const providerName =
    user?.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email";
  const joinedOn = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "-";
  const lastLogin = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : "-";

  const profileCompletion = useMemo(() => {
    let score = 60;
    if (user?.displayName) score += 20;
    if (user?.emailVerified) score += 20;
    return score;
  }, [user]);

  const handleChangePassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("Password reset email sent.");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      alert("Logout failed");
    }
  };

  const handleLoadDemoData = async () => {
    setSeeding(true);
    try {
      await forceLoadDemoData(user);
      alert("Demo data loaded successfully.");
    } catch (error) {
      console.error("Demo data load error:", error);
      alert("Failed to load demo data.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 sm:px-0">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{displayName}</h2>
                <p className="text-sm text-indigo-100">{user.email}</p>
              </div>
            </div>
            <button
              className="bg-white text-indigo-700 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 p-6">
          <StatCard
            title="Profile Completion"
            value={`${profileCompletion}%`}
            note="Add verified details for better security"
          />
          <StatCard title="Sign-In Method" value={providerName} note="Connected auth provider" />
          <StatCard
            title="Email Status"
            value={user.emailVerified ? "Verified" : "Not Verified"}
            note={user.emailVerified ? "Your account is verified" : "Please verify your email"}
          />
        </div>

        <div className="p-6 pt-0 grid lg:grid-cols-2 gap-6">
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="space-y-4 text-sm">
              <InfoRow icon={<User className="w-5 h-5 text-gray-500" />} label="Full Name" value={displayName} />
              <InfoRow icon={<Mail className="w-5 h-5 text-gray-500" />} label="Email" value={user.email} />
              <InfoRow icon={<Calendar className="w-5 h-5 text-gray-500" />} label="Joined On" value={joinedOn} />
              <InfoRow icon={<Clock3 className="w-5 h-5 text-gray-500" />} label="Last Login" value={lastLogin} />
              <InfoRow
                icon={<ShieldCheck className="w-5 h-5 text-gray-500" />}
                label="User ID"
                value={user.uid}
              />
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Manage your password and communication preferences.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleChangePassword}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition text-sm"
              >
                <KeyRound className="w-4 h-4" /> Change Password
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
              >
                <Bell className="w-4 h-4" /> Email Preferences
              </button>
              {isAllowedDemoUser(user) && (
                <button
                  onClick={handleLoadDemoData}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition text-sm disabled:opacity-60"
                >
                  {seeding ? "Loading..." : "Load Demo Data"}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {showPrefs && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative border border-gray-200">
            <button
              onClick={() => setShowPrefs(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              X
            </button>
            <h2 className="text-xl font-semibold mb-4">Email Preferences</h2>
            <form className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                Transaction Summary Emails
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Monthly Budget Reminders
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Promotional Updates
              </label>
              <button
                type="button"
                onClick={() => {
                  alert("Preferences saved (mock)");
                  setShowPrefs(false);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition mt-4"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, note }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
    <p className="text-2xl font-semibold mt-2 text-indigo-700">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{note}</p>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <div className="flex items-center gap-2 text-gray-600 min-w-32">
      {icon}
      <span className="font-medium">{label}:</span>
    </div>
    <span className="text-gray-800 break-all">{value}</span>
  </div>
);

export default Profile;
