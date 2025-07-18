import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC22UbRLZZWvY3gjZ_0oey0_xdnbTGcFxE",
  authDomain: "ipatroller-system.firebaseapp.com",
  projectId: "ipatroller-system",
  storageBucket: "ipatroller-system.firebasestorage.app",
  messagingSenderId: "535849704432",
  appId: "1:535849704432:web:129401354ce22cd8285b35",
  measurementId: "G-5QRPRFXKC5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics, app }; 