import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { firebaseApp } from "./app";

export const auth = getAuth(firebaseApp);
export const provider = new GoogleAuthProvider();
