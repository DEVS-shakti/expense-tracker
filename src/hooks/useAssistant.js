import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/db";
import { useAuth } from "../context/AuthContext";
import { executeAssistantQuery } from "../services/assistantService";

export const useAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      type: "fallback",
      message: "Hi! I'm your financial assistant. Try asking: 'food this week', 'total this month', or 'show travel expenses'."
    }
  ]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load user transactions
  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setIsInitializing(false);
      return;
    }

    const txQuery = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(txQuery, (snapshot) => {
      const txData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(txData);
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = { id: Date.now().toString(), role: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate slight processing delay for natural feel
    setTimeout(() => {
      const response = executeAssistantQuery(text, transactions);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        type: response.type,
        data: response.data,
        message: response.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 400); // 400ms delay
  }, [transactions]);

  // Clears chat
  const clearChat = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        type: "fallback",
        message: "Hi! I'm your financial assistant. Try asking: 'food this week', 'total this month', or 'show travel expenses'."
      }
    ]);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    isInitializing,
    clearChat
  };
};
