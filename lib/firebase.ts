import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBPZuQ3XDSKM_Yh54m-rEkoAPDlNpXEM_M",
  authDomain: "mech-224f4.firebaseapp.com",
  projectId: "mech-224f4",
  storageBucket: "mech-224f4.firebasestorage.app",
  messagingSenderId: "741247014370",
  appId: "1:741247014370:web:20e82a3378dfe1468955bb",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;