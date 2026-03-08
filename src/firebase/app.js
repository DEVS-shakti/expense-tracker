import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCscUKtJsd9HZHSZ6kOpUV5lo3ilgdB9t8",
  authDomain: "expense-tracker-bda1f.firebaseapp.com",
  projectId: "expense-tracker-bda1f",
  storageBucket: "expense-tracker-bda1f.firebasestorage.app",
  messagingSenderId: "958999620229",
  appId: "1:958999620229:web:c310f49ca0480cef60d7ec",
  measurementId: "G-J7R1NJKKHY",
};

export const firebaseApp = initializeApp(firebaseConfig);
