import {
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/db";
import demoSeed from "../data/demoSeed.json";

const ALLOWED_DEMO_UIDS = new Set(["Wf3fvnABucXCDXm8wFylQHxDFBa2"]);

const formatMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getBudgetMonthKey = (monthAlias) => {
  const base = new Date();
  if (monthAlias === "previous") {
    base.setMonth(base.getMonth() - 1);
  }
  return formatMonthKey(base);
};

const normalizeDate = (daysAgo) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - Number(daysAgo || 0));
  return d;
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const seedDemoDataIfNeeded = async (user) => {
  if (!user?.uid || !ALLOWED_DEMO_UIDS.has(user.uid)) {
    return { seeded: false, reason: "not-demo-user" };
  }

  const batch = writeBatch(db);

  demoSeed.categories.forEach((category) => {
    const categoryRef = doc(
      db,
      `users/${user.uid}/categories/${slugify(`${category.type}-${category.name}`)}`,
    );

    batch.set(categoryRef, {
      name: category.name,
      type: category.type,
      createdAt: serverTimestamp(),
    });
  });

  demoSeed.transactions.forEach((txn) => {
    const txnRef = doc(db, `users/${user.uid}/transactions/${txn.id}`);

    batch.set(txnRef, {
      amount: Number(txn.amount),
      type: txn.type,
      category: txn.category,
      description: txn.description,
      date: normalizeDate(txn.daysAgo),
      createdAt: serverTimestamp(),
    });
  });

  demoSeed.budgets.forEach((budget) => {
    const monthKey = getBudgetMonthKey(budget.month);
    const budgetRef = doc(db, `users/${user.uid}/budgets/${monthKey}`);
    batch.set(budgetRef, {
      categoryLimits: budget.categoryLimits,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  return { seeded: true, reason: "upserted" };
};

export const isAllowedDemoUser = (user) =>
  Boolean(user?.uid && ALLOWED_DEMO_UIDS.has(user.uid));

export const forceLoadDemoData = async (user) => {
  if (!isAllowedDemoUser(user)) {
    return { seeded: false, reason: "not-demo-user" };
  }

  return seedDemoDataIfNeeded(user);
};

