import { initializeApp } from "firebase/app";

const defaultFirebaseConfig = {
  apiKey: "AIzaSyCscUKtJsd9HZHSZ6kOpUV5lo3ilgdB9t8",
  authDomain: "expense-tracker-bda1f.firebaseapp.com",
  projectId: "expense-tracker-bda1f",
  storageBucket: "expense-tracker-bda1f.firebasestorage.app",
  messagingSenderId: "958999620229",
  appId: "1:958999620229:web:c310f49ca0480cef60d7ec",
  measurementId: "G-J7R1NJKKHY",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    defaultFirebaseConfig.authDomain,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    defaultFirebaseConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    defaultFirebaseConfig.measurementId,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseConfigError =
  missingKeys.length > 0
    ? `Missing Firebase environment variables: ${missingKeys.join(", ")}. Create a .env file (see .env.example).`
    : null;

export const firebaseApp = firebaseConfigError
  ? null
  : initializeApp(firebaseConfig);
