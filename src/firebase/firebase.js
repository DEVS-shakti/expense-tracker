// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCscUKtJsd9HZHSZ6kOpUV5lo3ilgdB9t8",
  authDomain: "expense-tracker-bda1f.firebaseapp.com",
  projectId: "expense-tracker-bda1f",
  storageBucket: "expense-tracker-bda1f.firebasestorage.app",
  messagingSenderId: "958999620229",
  appId: "1:958999620229:web:c310f49ca0480cef60d7ec",
  measurementId: "G-J7R1NJKKHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export { auth, provider,db };