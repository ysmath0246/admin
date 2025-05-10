// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 🔥 Firestore 사용 시 추가
import { getAuth } from "firebase/auth"; // 🔥 Auth 사용 시 추가

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwgnZQobpYcoUcfvnlSV9NVluEKlY3Uco",
  authDomain: "ysmath-0246.firebaseapp.com",
  projectId: "ysmath-0246",
  storageBucket: "ysmath-0246.appspot.com",  // ❗️오타 수정: ".app" → ".appspot.com"
  messagingSenderId: "872357175895",
  appId: "1:872357175895:web:0981df81a507588d5fb912"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
