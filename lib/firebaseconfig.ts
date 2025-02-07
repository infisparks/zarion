// lib/firebaseconfig.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC6zTSkJwqQXpuJ_E86roWsW_0jaU_SHDA",
    authDomain: "billing4-44c05.firebaseapp.com",
    databaseURL: "https://billing4-44c05-default-rtdb.firebaseio.com",
    projectId: "billing4-44c05",
    storageBucket: "billing4-44c05.firebasestorage.app",
    messagingSenderId: "61902749754",
    appId: "1:61902749754:web:e9a4303733dda2f3cc3503",
    measurementId: "G-K7H6XVKQZH"
  };
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const database = getDatabase(app);
export const auth = getAuth(app);
