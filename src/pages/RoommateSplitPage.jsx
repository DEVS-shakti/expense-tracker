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
  CreditCard,
  HandCoins,
  Mail,
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

const EmptyState = ({ title, description }) => (
  <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
    <p className="text-lg font-semibold text-slate-900">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
  </div>
);

const RoommateSplitPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [splits, setSplits] = useState([]);
  const [roommateDraft, setRoommateDraft] = useState({ name: "", email: "", note: "" });
  const [splitDraft, setSplitDraft] = useState(
    createSplitDraft(searchParams.get("transaction") || ""),
  );
  const [error, setError] = useState("");
  const [savingRoommate, setSavingRoommate] = useState(false);
  const [savingSplit, setSavingSplit] = useState(false);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = onSnapshot(
      query(collection(db, `users/${user.uid}/transactions`), orderBy("date", "desc")),
      (snapshot) => {
        setTransactions(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = onSnapshot(
      query(collection(db, `users/${user.uid}/roommates`), orderBy("createdAt", "asc")),
      (snapshot) => {
        setRoommates(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = onSnapshot(
      query(collection(db, `users/${user.uid}/roommateSplits`), orderBy("createdAt", "desc")),
      (snapshot) => {
        setSplits(snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() })));
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    const transactionId = searchParams.get("transaction") || "";
    setSplitDraft((current) =>
      current.transactionId === transactionId ? current : createSplitDraft(transactionId),
    );
  }, [searchParams]);

  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === "expense"),
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

  const linkedRoommateIds = useMemo(() => {
    const ids = new Set();
    splits.forEach((split) => {
      (split.participants || []).forEach((participant) => ids.add(participant.roommateId));
    });
    return ids;
  }, [splits]);

  const handleSaveRoommate = async (event) => {
    event.preventDefault();
    if (!user?.uid || savingRoommate || !roommateDraft.name.trim()) return;

    setSavingRoommate(true);
    setError("");
    try {
      await addDoc(collection(db, `users/${user.uid}/roommates`), {
        name: roommateDraft.name.trim(),
        email: roommateDraft.email.trim(),
        note: roommateDraft.note.trim(),
        createdAt: serverTimestamp(),
      });
      setRoommateDraft({ name: "", email: "", note: "" });
    } catch {
      setError("Could not save roommate details.");
    } finally {
      setSavingRoommate(false);
    }
  };

  const handleDeleteRoommate = async (roommateId) => {
    if (!user?.uid) return;
    if (linkedRoommateIds.has(roommateId)) {
      setError("This roommate already belongs to a saved split and cannot be removed.");
      return;
    }
    await deleteDoc(doc(db, `users/${user.uid}/roommates/${roommateId}`));
  };

  const handleSaveSplit = async (event) => {
    event.preventDefault();
    if (!user?.uid || !selectedTransaction || savingSplit) return;
    if (!splitPreview.valid) {
      setError("Select roommates and make sure the split total matches the expense amount.");
      return;
    }

    setSavingSplit(true);
    setError("");
    try {
      await addDoc(collection(db, `users/${user.uid}/roommateSplits`), {
        transactionId: selectedTransaction.id,
        transactionCategory: selectedTransaction.category,
        transactionDescription: selectedTransaction.description || "",
        transactionDate:
          selectedTransaction.date instanceof Timestamp
            ? selectedTransaction.date
            : Timestamp.fromDate(parseTxnDate(selectedTransaction.date) || new Date()),
        totalAmount: Number(selectedTransaction.amount || 0),
        splitMode: splitDraft.splitMode,
        notes: splitDraft.notes.trim(),
        participants: splitPreview.rows.map((row) => ({
          roommateId: row.roommateId,
          roommateName: row.roommateName,
          amount: row.amount,
          settled: false,
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSplitDraft(createSplitDraft(""));
      setSearchParams({});
    } catch {
      setError("Could not save the roommate split.");
    } finally {
      setSavingSplit(false);
    }
  };

  const markSettled = async (split, roommateId) => {
    if (!user?.uid) return;
    await updateDoc(doc(db, `users/${user.uid}/roommateSplits/${split.id}`), {
      participants: (split.participants || []).map((participant) =>
        participant.roommateId === roommateId ? { ...participant, settled: true } : participant,
      ),
      updatedAt: serverTimestamp(),
    });
  };

  const removeSplit = async (splitId) => {
    if (!user?.uid) return;
    await deleteDoc(doc(db, `users/${user.uid}/roommateSplits/${splitId}`));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(251,113,133,0.12),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_48%,_#ffffff_100%)] text-slate-800">
      <SeoMeta
        title="Roommate Splitting - TrackExpense"
        description="Split expense transactions with roommates, track unsettled balances, and manage shared household costs."
        path="/roommate-splits"
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_80px_-40px_rgba(15,23,42,0.35)]">
          <div className="grid gap-6 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(135deg,_#ffffff,_#eff6ff_42%,_#f8fafc)] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/dashboard/transactions" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" />
                  Back to transactions
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Shared expense studio
                </span>
              </div>
              <div>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Split real expense entries with roommates in a dedicated workspace.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  This page stays separate from the dashboard, but it links directly to your saved expense transactions so shared costs stay grounded in actual spending.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/dashboard/transactions" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  <Receipt className="h-4 w-4" />
                  Open transactions
                </Link>
                <button
                  type="button"
                  onClick={() => document.getElementById("split-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <HandCoins className="h-4 w-4" />
                  Start a split
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5">
                <p className="text-sm text-slate-500">Roommates</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{roommates.length}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5">
                <p className="text-sm text-slate-500">Outstanding</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalOutstanding)}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-5">
                <p className="text-sm text-slate-500">Saved splits</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{splits.length}</p>
              </div>
            </div>
          </div>
        </section>

        {error ? <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Roommates</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">People you split with</h2>
            </div>
            <form onSubmit={handleSaveRoommate} className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <input type="text" value={roommateDraft.name} onChange={(event) => setRoommateDraft((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400" placeholder="Roommate name" required />
              <input type="email" value={roommateDraft.email} onChange={(event) => setRoommateDraft((current) => ({ ...current, email: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400" placeholder="Email (optional)" />
              <input type="text" value={roommateDraft.note} onChange={(event) => setRoommateDraft((current) => ({ ...current, note: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400" placeholder="Note (flatmate, trip partner, etc.)" />
              <button type="submit" disabled={savingRoommate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                <UserPlus className="h-4 w-4" />
                {savingRoommate ? "Saving..." : "Add roommate"}
              </button>
            </form>
            <div className="mt-5 grid gap-4">
              {roommates.length === 0 ? (
                <EmptyState title="No roommates yet" description="Add people here before creating shared expense splits." />
              ) : (
                roommates.map((roommate) => (
                  <div key={roommate.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{roommate.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{roommate.email || "No email added"}</p>
                        <p className="mt-1 text-sm text-slate-500">{roommate.note || "No note added"}</p>
                      </div>
                      <button type="button" onClick={() => handleDeleteRoommate(roommate.id)} disabled={linkedRoommateIds.has(roommate.id)} className="rounded-2xl border border-rose-200 p-3 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article id="split-form" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Split builder</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Link roommates to one expense</h2>
            </div>
            {expenseTransactions.length === 0 ? (
              <EmptyState title="No expense transactions found" description="Add an expense in transactions first, then return here to split it." />
            ) : (
              <form onSubmit={handleSaveSplit} className="space-y-5">
                <select value={splitDraft.transactionId} onChange={(event) => { setSplitDraft(createSplitDraft(event.target.value)); setSearchParams(event.target.value ? { transaction: event.target.value } : {}); }} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white" required>
                  <option value="">Select an expense transaction</option>
                  {expenseTransactions.map((transaction) => (
                    <option key={transaction.id} value={transaction.id}>
                      {transaction.category} | {formatCurrency(transaction.amount)} | {formatDate(transaction.date)}
                    </option>
                  ))}
                </select>

                {selectedTransaction ? (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected expense</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{selectedTransaction.category}</h3>
                    <p className="mt-1 text-sm text-slate-500">{selectedTransaction.description?.trim() || "No description"} · {formatDate(selectedTransaction.date)}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setSplitDraft((current) => ({ ...current, splitMode: "equal" }))} className={`rounded-[1.4rem] border p-4 text-left transition ${splitDraft.splitMode === "equal" ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                    <p className="font-semibold text-slate-900">Equal split</p>
                    <p className="mt-1 text-sm text-slate-500">Divide the expense evenly.</p>
                  </button>
                  <button type="button" onClick={() => setSplitDraft((current) => ({ ...current, splitMode: "custom" }))} className={`rounded-[1.4rem] border p-4 text-left transition ${splitDraft.splitMode === "custom" ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                    <p className="font-semibold text-slate-900">Custom split</p>
                    <p className="mt-1 text-sm text-slate-500">Enter different share amounts.</p>
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {roommates.map((roommate) => {
                    const selected = splitDraft.participantIds.includes(roommate.id);
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
                          <p className={`mt-1 text-sm ${selected ? "text-white/75" : "text-slate-500"}`}>{roommate.email || roommate.note || "Shared expense participant"}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {splitPreview.rows.length > 0 ? (
                  <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">Share preview</p>
                      <p className="text-sm text-slate-500">
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

                <input type="text" value={splitDraft.notes} onChange={(event) => setSplitDraft((current) => ({ ...current, notes: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white" placeholder="Optional note" />

                <button type="submit" disabled={!selectedTransaction || roommates.length === 0 || savingSplit} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                  <Plus className="h-4 w-4" />
                  {savingSplit ? "Saving split..." : "Save split"}
                </button>
              </form>
            )}
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-sky-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Outstanding balances</h2>
            </div>
            {balanceRows.length === 0 ? (
              <EmptyState title="Nothing to collect yet" description="Outstanding roommate balances will appear once you save splits." />
            ) : (
              <div className="grid gap-3">
                {balanceRows.map((row) => (
                  <div key={row.roommateId} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{row.name}</h3>
                        <p className="text-sm text-slate-500">{row.count} unsettled entries</p>
                      </div>
                      <p className="text-lg font-semibold text-rose-600">{formatCurrency(row.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex items-center gap-3">
              <Users className="h-5 w-5 text-sky-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Saved roommate splits</h2>
            </div>
            {splits.length === 0 ? (
              <EmptyState title="No shared expenses saved" description="Create your first roommate split from an expense transaction." />
            ) : (
              <div className="grid gap-4">
                {splits.map((split) => (
                  <article key={split.id} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.96))] p-5 transition hover:border-slate-300 hover:shadow-lg">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{split.transactionCategory}</h3>
                        <p className="mt-1 text-sm text-slate-500">{split.transactionDescription || "No description"} · {formatDate(split.transactionDate)}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatCurrency(split.totalAmount)} · {split.splitMode} split</p>
                      </div>
                      <button type="button" onClick={() => removeSplit(split.id)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
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
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </div>
  );
};

export default RoommateSplitPage;
