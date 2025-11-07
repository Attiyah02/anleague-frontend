// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhZSZBjDvA-3TjPvnylpphipiNd7J2v8w",
  authDomain: "anleague2026.firebaseapp.com",
  projectId: "anleague2026",
  storageBucket: "anleague2026.firebasestorage.app",
  messagingSenderId: "342014639795",
  appId: "1:342014639795:web:6ee3d9255839b28937bac6",
  measurementId: "G-2ZPHD4PTC8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);