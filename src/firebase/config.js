import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, serverTimestamp } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID
};

let database = null;
let auth = null;
let firestore = null;

try {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
  firestore = getFirestore(app);
} catch (e) {
  console.error("Firebase init failed:", e);
}

function checkConnection() {
  return new Promise((resolve) => {
    if (!database) {
      resolve(false);
      return;
    }
    const timer = setTimeout(() => resolve(false), 5000);
    onValue(ref(database, ".info/connected"), (snap) => {
      if (snap.val() === true) {
        clearTimeout(timer);
        resolve(true);
      }
    }, () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

export { database, ref, onValue, set, serverTimestamp, auth, firestore, checkConnection };
