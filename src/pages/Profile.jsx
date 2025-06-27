import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Calendar } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Profile = () => {
  const { user, logout } = useAuth();
  const [showPrefs, setShowPrefs] = useState(false);
  const displayName = user.email?.split("@")[0];

  const handleChangePassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("Password reset email sent.");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleEmailPrefs = () => {
    setShowPrefs(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      alert("Logout failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden mt-8 font-sans">
      <div className="md:flex">
        {/* Sidebar Panel */}
        <div className="md:w-1/3 bg-indigo-600 text-white p-8 flex flex-col items-center">
          <div className="bg-indigo-500 rounded-full p-3 mb-4">
            <User className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-semibold text-center">{displayName}</h2>
          <p className="text-sm opacity-80 text-center">{user.email}</p>
          <button
            className="mt-6 bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Main Details Section */}
        <div className="md:w-2/3 p-8">
          <h3 className="text-xl font-semibold mb-6">Profile Information</h3>
          <div className="space-y-4 text-sm">
            <InfoRow
              icon={<Mail className="w-5 h-5 text-gray-500" />}
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={<Calendar className="w-5 h-5 text-gray-500" />}
              label="Joined On"
              value={new Date(user.metadata.creationTime).toLocaleDateString()}
            />
            <InfoRow
              icon={<User className="w-5 h-5 text-gray-500" />}
              label="User ID"
              value={user.uid}
            />
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-4">Account Settings</h4>
            <p className="text-gray-600 mb-4 text-sm">
              Use the options below to update your credentials or notification
              settings.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleChangePassword}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition text-sm"
              >
                Change Password
              </button>
              <button
                onClick={handleEmailPrefs}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm"
              >
                Email Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Preferences Modal */}
      {showPrefs && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setShowPrefs(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              ✕
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

const InfoRow = ({ icon, label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <div className="flex items-center gap-2 text-gray-600">
      {icon}
      <span className="font-medium">{label}:</span>
    </div>
    <span className="text-gray-800 break-all">{value}</span>
  </div>
);

export default Profile;
