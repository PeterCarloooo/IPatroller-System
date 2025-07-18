import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC22UbRLZZWvY3gjZ_0oey0_xdnbTGcFxE",
  authDomain: "ipatroller-system.firebaseapp.com",
  projectId: "ipatroller-system",
  storageBucket: "ipatroller-system.appspot.com",
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

// Set auth persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

export { auth, db, analytics, app }; 