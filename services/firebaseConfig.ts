import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --- PRODUCTION CONFIGURATION ---
// To make this app production ready:
// 1. Go to console.firebase.google.com
// 2. Create a new project
// 3. Enable Authentication (Email/Password)
// 4. Enable Firestore Database
// 5. Copy your config object below
// 6. Set USE_FIREBASE = true

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Toggle this to TRUE if you have added your valid config above
export const USE_FIREBASE = true;

let app, auth, db, storage;

if (USE_FIREBASE) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        // FORCE LONG POLLING: Fixes "transport errored" / QUIC / Firewall issues
        db = initializeFirestore(app, { experimentalForceLongPolling: true });
        storage = getStorage(app);
    } catch (e) {
        console.error("Firebase Initialization Error:", e);
    }
}

export { auth, db, storage, app };