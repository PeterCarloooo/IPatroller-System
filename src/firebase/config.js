// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtBFNjmuj5bJ0qWI6qZybJAxlgk3T7TBE",
  authDomain: "bataan-ipatroller.firebaseapp.com",
  projectId: "bataan-ipatroller",
  storageBucket: "bataan-ipatroller.firebasestorage.app",
  messagingSenderId: "714175029857",
  appId: "1:714175029857:web:18889ead2ee19c01f24020",
  measurementId: "G-SL0SV586QH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app; 