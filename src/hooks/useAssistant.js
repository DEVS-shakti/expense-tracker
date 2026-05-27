import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/db";
import { useAuth } from "../context/AuthContext";
import { executeAssistantQuery } from "../services/assistantService";

const ASSISTANT_API_BASE = (import.meta.env.VITE_ASSISTANT_API_BASE || "").replace(/\/$/, "");
const ASSISTANT_MEMORY_KEY = "expense-tracker.assistant-memory";

const DEFAULT_MEMORY = {
  tone: "friendly",
  brevity: "balanced",
  lastTopics: [],
};

const loadMemory = () => {
  if (typeof window === "undefined") return DEFAULT_MEMORY;

  try {
    const raw = window.localStorage.getItem(ASSISTANT_MEMORY_KEY);
    if (!raw) return DEFAULT_MEMORY;

    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MEMORY,
      ...parsed,
      lastTopics: Array.isArray(parsed?.lastTopics) ? parsed.lastTopics.slice(0, 6) : [],
    };
  } catch {
    return DEFAULT_MEMORY;
  }
};

const saveMemory = (memory) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSISTANT_MEMORY_KEY, JSON.stringify(memory));
};

const extractTopics = (text) => {
  const normalized = String(text || "").toLowerCase();
  const topics = [];

  if (normalized.includes("budget")) topics.push("budgets");
  if (normalized.includes("roommate") || normalized.includes("split")) topics.push("roommates");
  if (normalized.includes("insight") || normalized.includes("chart") || normalized.includes("graph")) topics.push("insights");
  if (normalized.includes("transaction") || normalized.includes("expense") || normalized.includes("spend")) topics.push("transactions");
  if (normalized.includes("recent") || normalized.includes("latest")) topics.push("recent activity");
  if (normalized.includes("this month") || normalized.includes("last month")) topics.push("monthly spending");
  if (normalized.includes("this year")) topics.push("yearly spending");
  if (normalized.includes("how to use") || normalized.includes("what can you do") || normalized.includes("feature")) topics.push("app guide");

  return [...new Set(topics)];
};

const updateMemoryFromMessage = (memory, text) => {
  const normalized = String(text || "").toLowerCase();
  const next = { ...memory };

  if (normalized.includes("be brief") || normalized.includes("short answer") || normalized.includes("concise")) {
    next.brevity = "brief";
  } else if (normalized.includes("be detailed") || normalized.includes("in detail") || normalized.includes("explain fully")) {
    next.brevity = "detailed";
  }

  if (normalized.includes("like a friend") || normalized.includes("casual") || normalized.includes("human")) {
    next.tone = "friendly";
  } else if (normalized.includes("formal")) {
    next.tone = "formal";
  }

  const topics = extractTopics(text);
  const mergedTopics = [...topics, ...(memory.lastTopics || [])].filter(Boolean);
  next.lastTopics = [...new Set(mergedTopics)].slice(0, 6);

  return next;
};

const buildAssistantMessage = (payload) => ({
  id: (Date.now() + 1).toString(),
  role: "assistant",
  type: payload.type || "fallback",
  data: payload.data || null,
  card: payload.card || null,
  message: payload.message || payload.answer || null,
  followUps: Array.isArray(payload.followUps) ? payload.followUps : [],
  confidence: typeof payload.confidence === "number" ? payload.confidence : null,
});

export const useAssistant = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [memory, setMemory] = useState(() => loadMemory());
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      type: "fallback",
      message:
        "Hi, I am your assistant here to help you with ExpenseTrack. I can guide you through the app, explain why each feature exists, and answer questions from your Firebase finance data. Try one of the guided prompts below."
    }
  ]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    saveMemory(memory);
  }, [memory]);

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

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = { id: Date.now().toString(), role: "user", text };
    setMessages(prev => [...prev, userMessage]);
    const nextMemory = updateMemoryFromMessage(memory, text);
    setMemory(nextMemory);
    setIsLoading(true);

    try {
      // Try server-backed Gemini assistant
      let idToken = null;
      try {
        idToken = user?.getIdToken ? await user.getIdToken() : null;
      } catch (e) {
        console.warn('Failed to get ID token', e);
      }

      const res = await fetch(`${ASSISTANT_API_BASE}/api/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          text,
          context: {
            route: location.pathname,
            memory: nextMemory,
          },
        })
      });

      if (res.ok) {
        const payload = await res.json();
        const assistantMessage = buildAssistantMessage({
          ...payload,
          message: payload.message || (typeof payload === 'string' ? payload : null)
        });

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // If server failed, fall back to local rule-based assistant
      console.warn('Server assistant returned non-OK response, falling back to local parser');
      const response = executeAssistantQuery(text, transactions);
      const assistantMessage = buildAssistantMessage(response);
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Assistant error, falling back to local parser', err);
      const response = executeAssistantQuery(text, transactions);
      const assistantMessage = buildAssistantMessage(response);
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [location.pathname, memory, transactions, user]);

  // Clears chat
  const clearChat = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        type: "fallback",
        message:
          "Hi, I am your assistant here to help you with ExpenseTrack. I can guide you through the app, explain why each feature exists, and answer questions from your Firebase finance data. Try one of the guided prompts below."
      }
    ]);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    isInitializing,
    clearChat,
    memory,
    setMemory
  };
};
