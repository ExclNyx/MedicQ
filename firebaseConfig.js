// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TEMPEL KONFIGURASI KAMU DI SINI
const firebaseConfig = {
  apiKey: "AIzaSyDJJzOIVR41_0gVo8E3_x5QSPMVMxf4JT0",
  authDomain: "medicq-xxxx.firebaseapp.com",
  projectId: "medicq-xxxx",
  storageBucket: "medicq-xxxx.appspot.com",
  messagingSenderId: "12345678",
  appId: "1:12345678:web:abcde"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Database (Firestore) dan ekspor
export const db = getFirestore(app);