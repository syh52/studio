// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnsJyca_oLVVcgwAA9wjB8MLGdCPpBwu0",
  authDomain: "lexa-e87a6.firebaseapp.com",
  projectId: "lexa-e87a6",
  storageBucket: "lexa-e87a6.firebasestorage.app",
  messagingSenderId: "700494727737",
  appId: "1:700494727737:web:301922b472dc6151015be8",
  measurementId: "G-TH6WZ54XDR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firebase persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser doesn't support persistence
        console.warn('Firebase persistence not supported in this browser');
      }
    });
  });
}

export default app; 