import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  CreditCard,
  Plus,
  Receipt,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { db } from "../firebase/db";
import { useAuth } from "../context/AuthContext";
import SeoMeta from "../components/SeoMeta";
import demoSeed from "../data/demoSeed.json";

const LOCAL_KEYS = {
  transactions: "expense-tracker.roommate-transactions",
  roommates: "expense-tracker.roommates",
  splits: "expense-tracker.roommate-splits",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const parseTxnDate = (rawDate) => {
  if (!rawDate) return null;
  if (rawDate?.toDate) return rawDate.toDate();
  if (rawDate?.seconds) return new Date(rawDate.seconds * 1000);
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (rawDate) => {
  const date = parseTxnDate(rawDate);
  if (!date) return "No date";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const createSplitDraft = (transactionId = "") => ({
  transactionId,
  splitMode: "equal",
  participantIds: [],
  customShares: {},
  notes: "",
});

const createExpenseDraft = () => ({
  category: "",
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
});

const createLocalId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getLocalData = (key, fallback) => {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalData = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const getDemoTransactions = () =>
  demoSeed.transactions
    .filter((transaction) => transaction.type === "expense")
    .map((transaction) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - Number(transaction.daysAgo || 0));

      return {
        id: transaction.id,
        amount: Number(transaction.amount || 0),
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        date: date.toISOString(),
        source: "demo",
      };
    });

const EmptyState = ({ title, description }) => (
  <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white/75 px-5 py-10 text-center">
    <p className="text-lg font-semibold text-slate-900">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
  </div>
);

const StatCard = ({ label, value, tone }) => {
  const tones = {
    slate: "border-slate-200 bg-white",
    sky: "border-sky-200 bg-sky-50/70",
    emerald: "border-emerald-200 bg-emerald-50/80",
    amber: "border-amber-200 bg-amber-50/80",
  };

  return (
    <div className={`rounded-[1.5rem] border p-5 ${tones[tone] || tones.slate}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
};

const RoommateSplitPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [splits, setSplits] = useState([]);
  const [roommateDraft, setRoommateDraft] = useState({ name: "", contact: "", note: "" });
  const [expenseDraft, setExpenseDraft] = useState(createExpenseDraft());
  const [splitDraft, setSplitDraft] = useState(
    createSplitDraft(searchParams.get("transaction") || ""),
  );
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [savingRoommate, setSavingRoommate] = useState(false);
  const [savingSplit, setSavingSplit] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [splitFilter, setSplitFilter] = useState("all");

  const isSignedIn = Boolean(user?.uid);

  useEffect(() => {
    if (!feedback) return undefined;

    const timeout = window.setTimeout(() => setFeedback(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!isSignedIn) {
      const localTransactions = getLocalData(LOCAL_KEYS.transactions, []);
      const nextTransactions =
        localTransactions.length > 0 ? localTransactions : getDemoTransactions();
      setTransactions(nextTransactions);
      setRoommates(getLocalData(LOCAL_KEYS.roommates, []));
      setSplits(getLocalData(LOCAL_KEYS.splits, []));
      if (localTransactions.length === 0) {
        setLocalData(LOCAL_KEYS.transactions, nextTransactions);
      }
      return undefined;
    }

    const transactionsUnsubscribe = onSnapshot(
      query(collection(db, `users/${user.uid}/transactions`), orderBy("date", "desc")),
      (snapshot) => {
        setTransactions(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
      },
    );

    const roommatesUnsubscribe = onSnapshot(
      query(collection(db, `users/${user.uid}/roommates`), orderBy("createdAt", "asc")),
      (snapshot) => {
        setRoommates(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
      },
    );

    const splitsUnsubscribe = onSnapshot(
      query(collection(db, `users/${user.uid}/roommateSplits`), orderBy("createdAt", "desc")),
      (snapshot) => {
        setSplits(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
      },
    );

    return () => {
      transactionsUnsubscribe();
      roommatesUnsubscribe();
      splitsUnsubscribe();
    };
  }, [isSignedIn, user?.uid]);

  useEffect(() => {
    if (isSignedIn) return;
    setLocalData(LOCAL_KEYS.transactions, transactions);
  }, [isSignedIn, transactions]);

  useEffect(() => {
    if (isSignedIn) return;
    setLocalData(LOCAL_KEYS.roommates, roommates);
  }, [isSignedIn, roommates]);

  useEffect(() => {
    if (isSignedIn) return;
    setLocalData(LOCAL_KEYS.splits, splits);
  }, [isSignedIn, splits]);

  useEffect(() => {
    const transactionId = searchParams.get("transaction") || "";
    setSplitDraft((current) =>
      current.transactionId === transactionId ? current : createSplitDraft(transactionId),
    );
  }, [searchParams]);

  const expenseTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "expense")
        .sort((left, right) => (parseTxnDate(right.date)?.getTime() || 0) - (parseTxnDate(left.date)?.getTime() || 0)),
    [transactions],
  );

  const selectedTransaction = useMemo(
    () => expenseTransactions.find((transaction) => transaction.id === splitDraft.transactionId) || null,
    [expenseTransactions, splitDraft.transactionId],
  );

  const splitPreview = useMemo(() => {
    const selectedRoommates = roommates.filter((roommate) =>
      splitDraft.participantIds.includes(roommate.id),
    );
    const totalAmount = Number(selectedTransaction?.amount || 0);

    if (!selectedTransaction || selectedRoommates.length === 0 || totalAmount <= 0) {
      return { rows: [], valid: false, totalAssigned: 0 };
    }

    if (splitDraft.splitMode === "equal") {
      const base = Number((totalAmount / selectedRoommates.length).toFixed(2));
      const rows = selectedRoommates.map((roommate, index) => ({
        roommateId: roommate.id,
        roommateName: roommate.name,
        amount:
          index === selectedRoommates.length - 1
            ? Number((totalAmount - base * index).toFixed(2))
            : base,
      }));

      return {
        rows,
        valid: true,
        totalAssigned: Number(rows.reduce((sum, row) => sum + row.amount, 0).toFixed(2)),
      };
    }

    const rows = selectedRoommates.map((roommate) => ({
      roommateId: roommate.id,
      roommateName: roommate.name,
      amount: Number(splitDraft.customShares[roommate.id] || 0),
    }));
    const totalAssigned = Number(rows.reduce((sum, row) => sum + row.amount, 0).toFixed(2));

    return {
      rows,
      valid: Math.abs(totalAssigned - totalAmount) < 0.01 && rows.every((row) => row.amount > 0),
      totalAssigned,
    };
  }, [roommates, selectedTransaction, splitDraft]);

  const balanceRows = useMemo(() => {
    const totals = {};

    roommates.forEach((roommate) => {
      totals[roommate.id] = { roommateId: roommate.id, name: roommate.name, amount: 0, count: 0 };
    });

    splits.forEach((split) => {
      (split.participants || []).forEach((participant) => {
        if (!totals[participant.roommateId] || participant.settled) return;
        totals[participant.roommateId].amount += Number(participant.amount || 0);
        totals[participant.roommateId].count += 1;
      });
    });

    return Object.values(totals).sort((left, right) => right.amount - left.amount);
  }, [roommates, splits]);

  const totalOutstanding = useMemo(
    () => balanceRows.reduce((sum, row) => sum + row.amount, 0),
    [balanceRows],
  );

  const totalSplitAmount = useMemo(
    () => splits.reduce((sum, split) => sum + Number(split.totalAmount || 0), 0),
    [splits],
  );

  const settlementSummary = useMemo(() => {
    let settled = 0;
    let total = 0;

    splits.forEach((split) => {
      (split.participants || []).forEach((participant) => {
        total += 1;
        if (participant.settled) settled += 1;
      });
    });

    return { settled, total };
  }, [splits]);

  const linkedRoommateIds = useMemo(() => {
    const ids = new Set();
    splits.forEach((split) => {
      (split.participants || []).forEach((participant) => ids.add(participant.roommateId));
    });
    return ids;
  }, [splits]);

  const visibleSplits = useMemo(() => {
    if (splitFilter === "all") return splits;
    if (splitFilter === "open") {
      return splits.filter((split) => (split.participants || []).some((participant) => !participant.settled));
    }
    return splits.filter((split) => (split.participants || []).every((participant) => participant.settled));
  }, [splitFilter, splits]);

  const updateLocalSplit = (splitId, updater) => {
    setSplits((currentSplits) =>
      currentSplits.map((split) => (split.id === splitId ? updater(split) : split)),
    );
  };

  const handleSaveRoommate = async (event) => {
    event.preventDefault();
    if (savingRoommate || !roommateDraft.name.trim()) return;

    const payload = {
      id: createLocalId("roommate"),
      name: roommateDraft.name.trim(),
      contact: roommateDraft.contact.trim(),
      note: roommateDraft.note.trim(),
      createdAt: new Date().toISOString(),
    };

    setSavingRoommate(true);
    setError("");
    try {
      if (isSignedIn) {
        await addDoc(collection(db, `users/${user.uid}/roommates`), {
          name: payload.name,
          contact: payload.contact,
          email: payload.contact,
          note: payload.note,
          createdAt: serverTimestamp(),
        });
      } else {
        setRoommates((current) => [...current, payload]);
      }

      setRoommateDraft({ name: "", contact: "", note: "" });
      setFeedback("Roommate added.");
    } catch {
      setError("Could not save roommate details.");
    } finally {
      setSavingRoommate(false);
    }
  };

  const handleSaveExpense = async (event) => {
    event.preventDefault();
    const normalizedAmount = Number(expenseDraft.amount);

    if (!expenseDraft.category.trim() || !expenseDraft.date || !normalizedAmount || savingExpense) {
      return;
    }

    setSavingExpense(true);
    setError("");
    try {
      if (isSignedIn) {
        await addDoc(collection(db, `users/${user.uid}/transactions`), {
          amount: normalizedAmount,
          type: "expense",
          category: expenseDraft.category.trim(),
          description: expenseDraft.description.trim(),
          date: Timestamp.fromDate(new Date(`${expenseDraft.date}T00:00:00`)),
          source: "roommate-split",
          createdAt: serverTimestamp(),
        });
      } else {
        setTransactions((current) => [
          {
            id: createLocalId("txn"),
            amount: normalizedAmount,
            type: "expense",
            category: expenseDraft.category.trim(),
            description: expenseDraft.description.trim(),
            date: new Date(`${expenseDraft.date}T00:00:00`).toISOString(),
            source: "manual",
          },
          ...current,
        ]);
      }

      setExpenseDraft(createExpenseDraft());
      setFeedback("Expense added to the split workspace.");
    } catch {
      setError("Could not add the expense.");
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteRoommate = async (roommateId) => {
    if (linkedRoommateIds.has(roommateId)) {
      setError("This roommate already belongs to a saved split and cannot be removed.");
      return;
    }

    if (isSignedIn) {
      await deleteDoc(doc(db, `users/${user.uid}/roommates/${roommateId}`));
    } else {
      setRoommates((current) => current.filter((roommate) => roommate.id !== roommateId));
    }
  };

  const handleSaveSplit = async (event) => {
    event.preventDefault();
    if (!selectedTransaction || savingSplit) return;
    if (!splitPreview.valid) {
      setError("Select roommates and make sure the split total matches the expense amount.");
      return;
    }

    const payload = {
      id: createLocalId("split"),
      transactionId: selectedTransaction.id,
      transactionCategory: selectedTransaction.category,
      transactionDescription: selectedTransaction.description || "",
      transactionDate: isSignedIn
        ? selectedTransaction.date instanceof Timestamp
          ? selectedTransaction.date
          : Timestamp.fromDate(parseTxnDate(selectedTransaction.date) || new Date())
        : parseTxnDate(selectedTransaction.date)?.toISOString() || new Date().toISOString(),
      totalAmount: Number(selectedTransaction.amount || 0),
      splitMode: splitDraft.splitMode,
      notes: splitDraft.notes.trim(),
      participants: splitPreview.rows.map((row) => ({
        roommateId: row.roommateId,
        roommateName: row.roommateName,
        amount: row.amount,
        settled: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavingSplit(true);
    setError("");
    try {
      if (isSignedIn) {
        await addDoc(collection(db, `users/${user.uid}/roommateSplits`), {
          transactionId: payload.transactionId,
          transactionCategory: payload.transactionCategory,
          transactionDescription: payload.transactionDescription,
          transactionDate: payload.transactionDate,
          totalAmount: payload.totalAmount,
          splitMode: payload.splitMode,
          notes: payload.notes,
          participants: payload.participants,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        setSplits((current) => [payload, ...current]);
      }

      setSplitDraft(createSplitDraft(""));
      setSearchParams({});
      setFeedback("Split saved.");
    } catch {
      setError("Could not save the roommate split.");
    } finally {
      setSavingSplit(false);
    }
  };

  const markSettled = async (split, roommateId) => {
    if (isSignedIn) {
      await updateDoc(doc(db, `users/${user.uid}/roommateSplits/${split.id}`), {
        participants: (split.participants || []).map((participant) =>
          participant.roommateId === roommateId ? { ...participant, settled: true } : participant,
        ),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    updateLocalSplit(split.id, (currentSplit) => ({
      ...currentSplit,
      participants: (currentSplit.participants || []).map((participant) =>
        participant.roommateId === roommateId ? { ...participant, settled: true } : participant,
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeSplit = async (splitId) => {
    if (isSignedIn) {
      await deleteDoc(doc(db, `users/${user.uid}/roommateSplits/${splitId}`));
      return;
    }

    setSplits((current) => current.filter((split) => split.id !== splitId));
  };

  const handleCopyReminder = async (split) => {
    const openParticipants = (split.participants || []).filter((participant) => !participant.settled);
    if (openParticipants.length === 0) {
      setFeedback("Everyone in this split is already settled.");
      return;
    }

    const reminder = `Shared expense reminder: ${split.transactionCategory} on ${formatDate(
      split.transactionDate,
    )}. Pending shares: ${openParticipants
      .map((participant) => `${participant.roommateName} ${formatCurrency(participant.amount)}`)
      .join(", ")}.`;

    try {
      await navigator.clipboard.writeText(reminder);
      setFeedback("Reminder copied.");
    } catch {
      setError("Could not copy the reminder.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.14),_transparent_26%),linear-gradient(180deg,_#fffdf7_0%,_#f8fafc_45%,_#ffffff_100%)] text-slate-800">
      <SeoMeta
        title="Roommate Splitting - TrackExpense"
        description="Split expenses with roommates even without making them sign up, track unsettled balances, and manage shared household costs."
        path="/roommate-splits"
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_80px_-40px_rgba(15,23,42,0.35)]">
          <div className="grid gap-6 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.14),_transparent_26%),linear-gradient(135deg,_#ffffff,_#f8fafc_42%,_#fff7ed)] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link to={isSignedIn ? "/dashboard/transactions" : "/"} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" />
                  {isSignedIn ? "Back to transactions" : "Back to home"}
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Shared expense studio
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${isSignedIn ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-amber-200 bg-amber-50 text-amber-700"}`}>
                  {isSignedIn ? "Cloud mode" : "Guest mode"}
                </span>
              </div>
              <div>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Split bills without forcing your roommate to create an account.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Add people, drop in an expense, choose equal or custom shares, and track who still owes you. Signed-in users sync to Firebase. Guests can use the same flow locally in the browser.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Step 1</p>
                  <p className="mt-2 font-semibold text-slate-900">Add people</p>
                  <p className="mt-1 text-sm text-slate-500">Only a name is required.</p>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Step 2</p>
                  <p className="mt-2 font-semibold text-slate-900">Choose an expense</p>
                  <p className="mt-1 text-sm text-slate-500">Use an existing one or add it here.</p>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Step 3</p>
                  <p className="mt-2 font-semibold text-slate-900">Save and collect</p>
                  <p className="mt-1 text-sm text-slate-500">Track balances and settlements.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <StatCard label="People" value={roommates.length} tone="slate" />
              <StatCard label="Outstanding" value={formatCurrency(totalOutstanding)} tone="sky" />
              <StatCard label="Tracked split value" value={formatCurrency(totalSplitAmount)} tone="amber" />
              <StatCard
                label="Settled shares"
                value={`${settlementSummary.settled}/${settlementSummary.total || 0}`}
                tone="emerald"
              />
            </div>
          </div>
        </section>

        {error ? <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
        {feedback ? <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{feedback}</div> : null}

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">People</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Roommates and friends</h2>
              <p className="mt-2 text-sm text-slate-500">
                They do not need their own TrackExpense account. Add a name and optional contact.
              </p>
            </div>
            <form onSubmit={handleSaveRoommate} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <input
                type="text"
                value={roommateDraft.name}
                onChange={(event) => setRoommateDraft((current) => ({ ...current, name: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Name"
                required
              />
              <input
                type="text"
                value={roommateDraft.contact}
                onChange={(event) => setRoommateDraft((current) => ({ ...current, contact: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Contact info (optional)"
              />
              <input
                type="text"
                value={roommateDraft.note}
                onChange={(event) => setRoommateDraft((current) => ({ ...current, note: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Note (flatmate, trip partner, office lunch group...)"
              />
              <button type="submit" disabled={savingRoommate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                <UserPlus className="h-4 w-4" />
                {savingRoommate ? "Saving..." : "Add person"}
              </button>
            </form>
            <div className="mt-5 grid gap-4">
              {roommates.length === 0 ? (
                <EmptyState title="No people added yet" description="Start by adding the people you normally split expenses with." />
              ) : (
                roommates.map((roommate) => {
                  const contact = roommate.contact || roommate.email || "";
                  return (
                    <div key={roommate.id} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.96))] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{roommate.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{contact || "No contact added"}</p>
                          <p className="mt-1 text-sm text-slate-500">{roommate.note || "No note added"}</p>
                        </div>
                        <button type="button" onClick={() => handleDeleteRoommate(roommate.id)} disabled={linkedRoommateIds.has(roommate.id)} className="rounded-2xl border border-rose-200 p-3 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Expense source</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Use one expense or add one here</h2>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                  {expenseTransactions.length} expense {expenseTransactions.length === 1 ? "entry" : "entries"} ready
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Choose an expense
                    <select
                      value={splitDraft.transactionId}
                      onChange={(event) => {
                        setSplitDraft(createSplitDraft(event.target.value));
                        setSearchParams(event.target.value ? { transaction: event.target.value } : {});
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Select an expense</option>
                      {expenseTransactions.map((transaction) => (
                        <option key={transaction.id} value={transaction.id}>
                          {transaction.category} | {formatCurrency(transaction.amount)} | {formatDate(transaction.date)}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedTransaction ? (
                    <div className="mt-4 rounded-[1.35rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected expense</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{selectedTransaction.category}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedTransaction.description?.trim() || "No description"} | {formatDate(selectedTransaction.date)}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(selectedTransaction.amount)}</p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[1.35rem] border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                      Pick an expense from the list, or add a new one using the form on the right.
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveExpense} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(240,249,255,0.6),_rgba(255,255,255,0.95))] p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Quick add expense</p>
                    <p className="mt-1 text-sm text-slate-500">Useful when the split starts before you visit the full transaction page.</p>
                  </div>
                  <input
                    type="text"
                    value={expenseDraft.category}
                    onChange={(event) => setExpenseDraft((current) => ({ ...current, category: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                    placeholder="Category"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseDraft.amount}
                    onChange={(event) => setExpenseDraft((current) => ({ ...current, amount: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                    placeholder="Amount"
                    required
                  />
                  <input
                    type="text"
                    value={expenseDraft.description}
                    onChange={(event) => setExpenseDraft((current) => ({ ...current, description: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                    placeholder="Description (optional)"
                  />
                  <input
                    type="date"
                    value={expenseDraft.date}
                    onChange={(event) => setExpenseDraft((current) => ({ ...current, date: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                    required
                  />
                  <button type="submit" disabled={savingExpense} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                    <Receipt className="h-4 w-4" />
                    {savingExpense ? "Adding..." : "Add expense"}
                  </button>
                </form>
              </div>
            </article>

            <article id="split-form" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Split builder</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Build the split</h2>
                <p className="mt-2 text-sm text-slate-500">Choose equal or custom shares, then save the split to start tracking collection.</p>
              </div>
              {expenseTransactions.length === 0 ? (
                <EmptyState title="No expense transactions available" description="Add one expense first, then return here to assign shares." />
              ) : (
                <form onSubmit={handleSaveSplit} className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => setSplitDraft((current) => ({ ...current, splitMode: "equal" }))} className={`rounded-[1.4rem] border p-4 text-left transition ${splitDraft.splitMode === "equal" ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                      <p className="font-semibold text-slate-900">Equal split</p>
                      <p className="mt-1 text-sm text-slate-500">Divide the expense evenly across selected people.</p>
                    </button>
                    <button type="button" onClick={() => setSplitDraft((current) => ({ ...current, splitMode: "custom" }))} className={`rounded-[1.4rem] border p-4 text-left transition ${splitDraft.splitMode === "custom" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                      <p className="font-semibold text-slate-900">Custom split</p>
                      <p className="mt-1 text-sm text-slate-500">Set a different amount for each person.</p>
                    </button>
                  </div>

                  {roommates.length === 0 ? (
                    <EmptyState title="Add at least one roommate first" description="The split builder becomes active after you add the people involved." />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {roommates.map((roommate) => {
                        const selected = splitDraft.participantIds.includes(roommate.id);
                        const subtitle = roommate.contact || roommate.email || roommate.note || "Shared expense participant";
                        return (
                          <label key={roommate.id} className={`flex items-start gap-3 rounded-[1.4rem] border p-4 transition ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"}`}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                setSplitDraft((current) => ({
                                  ...current,
                                  participantIds: selected
                                    ? current.participantIds.filter((id) => id !== roommate.id)
                                    : [...current.participantIds, roommate.id],
                                }))
                              }
                              className="mt-1 h-4 w-4 accent-slate-900"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold">{roommate.name}</p>
                              <p className={`mt-1 text-sm ${selected ? "text-white/75" : "text-slate-500"}`}>{subtitle}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {splitPreview.rows.length > 0 ? (
                    <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">Share preview</p>
                        <p className={`text-sm font-medium ${splitPreview.valid ? "text-emerald-700" : "text-rose-600"}`}>
                          {formatCurrency(splitPreview.totalAssigned)} / {formatCurrency(selectedTransaction?.amount || 0)}
                        </p>
                      </div>
                      {splitPreview.rows.map((row) => (
                        <div key={row.roommateId} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold text-slate-900">{row.roommateName}</p>
                          {splitDraft.splitMode === "custom" ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={splitDraft.customShares[row.roommateId] || ""}
                              onChange={(event) =>
                                setSplitDraft((current) => ({
                                  ...current,
                                  customShares: {
                                    ...current.customShares,
                                    [row.roommateId]: event.target.value,
                                  },
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white sm:w-40"
                              placeholder="0.00"
                            />
                          ) : (
                            <p className="text-lg font-semibold text-slate-900">{formatCurrency(row.amount)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <input
                    type="text"
                    value={splitDraft.notes}
                    onChange={(event) => setSplitDraft((current) => ({ ...current, notes: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Optional note"
                  />

                  <button type="submit" disabled={!selectedTransaction || roommates.length === 0 || savingSplit} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                    <Plus className="h-4 w-4" />
                    {savingSplit ? "Saving split..." : "Save split"}
                  </button>
                </form>
              )}
            </article>
          </div>
        </section>
        <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-sky-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Outstanding balances</h2>
            </div>
            {balanceRows.length === 0 ? (
              <EmptyState title="Nothing to collect yet" description="Outstanding balances appear after you save your first split." />
            ) : (
              <div className="grid gap-3">
                {balanceRows.map((row) => (
                  <div key={row.roommateId} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{row.name}</h3>
                        <p className="text-sm text-slate-500">{row.count} unsettled entries</p>
                      </div>
                      <p className={`text-lg font-semibold ${row.amount > 0 ? "text-rose-600" : "text-slate-900"}`}>{formatCurrency(row.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-sky-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Saved splits</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "open", "settled"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSplitFilter(filter)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${splitFilter === filter ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {filter === "all" ? "All" : filter === "open" ? "Open" : "Settled"}
                  </button>
                ))}
              </div>
            </div>
            {visibleSplits.length === 0 ? (
              <EmptyState title="No matching splits" description="Save a split or switch the filter to see more activity." />
            ) : (
              <div className="grid gap-4">
                {visibleSplits.map((split) => {
                  const totalParticipants = (split.participants || []).length;
                  const settledParticipants = (split.participants || []).filter((participant) => participant.settled).length;
                  const progress = totalParticipants === 0 ? 0 : (settledParticipants / totalParticipants) * 100;

                  return (
                    <article key={split.id} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.96))] p-5 transition hover:border-slate-300 hover:shadow-lg">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{split.transactionCategory}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${(split.participants || []).every((participant) => participant.settled) ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {(split.participants || []).every((participant) => participant.settled) ? "settled" : "collecting"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {split.transactionDescription || "No description"} | {formatDate(split.transactionDate)}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatCurrency(split.totalAmount)} | {split.splitMode} split
                          </p>
                          {split.notes ? <p className="mt-2 text-sm text-slate-600">{split.notes}</p> : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleCopyReminder(split)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                            <Copy className="h-4 w-4" />
                            Copy reminder
                          </button>
                          <button type="button" onClick={() => removeSplit(split.id)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-500">
                          <span>Settlement progress</span>
                          <span>{settledParticipants}/{totalParticipants} paid</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {(split.participants || []).map((participant) => (
                          <div key={`${split.id}-${participant.roommateId}`} className="flex flex-col gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{participant.roommateName}</p>
                              <p className="text-sm text-slate-500">Share: {formatCurrency(participant.amount)}</p>
                            </div>
                            {participant.settled ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Settled
                              </span>
                            ) : (
                              <button type="button" onClick={() => markSettled(split, participant.roommateId)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                                <CreditCard className="h-4 w-4" />
                                Mark settled
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </article>
        </section>

        {!isSignedIn ? (
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-900">
            You are using guest mode. Data stays in this browser via local storage until you sign in or clear site data.
          </section>
        ) : null}

        {!isSignedIn ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            Want this to sync across devices? Use <Link to="/login" className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4">login</Link> or <Link to="/register" className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4">create an account</Link>.
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default RoommateSplitPage;
