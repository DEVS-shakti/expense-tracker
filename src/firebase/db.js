import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "./app";

export const db = firebaseApp ? getFirestore(firebaseApp) : null;
