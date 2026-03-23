import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { firebaseApp } from "./app";

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const provider = auth ? new GoogleAuthProvider() : null;
