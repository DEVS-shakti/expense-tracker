// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import LoadingScreen from "../components/ui/LoadingScreen";
import { seedDemoDataIfNeeded } from "../services/demoSeed";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    seedDemoDataIfNeeded(user).catch((error) => {
      console.error("Demo data seed failed:", error);
    });
  }, [user]);

  const logout = () => signOut(auth);

  if (loading) {
    return <LoadingScreen fullScreen label="Preparing your workspace..." />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
