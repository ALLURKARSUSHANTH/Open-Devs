// firebase-config.js
import { getAuth } from 'firebase/auth';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB9gcbe4-3yyokQTniG-yZGoTN71k3Ke2U",
  authDomain: "open-devs.firebaseapp.com",
  projectId: "open-devs",
  storageBucket: "open-devs.firebasestorage.app",
  messagingSenderId: "356642186485",
  appId: "1:356642186485:web:b1ed32bc6ed5c1bee051bc",
  measurementId: "G-QWK81VL7KZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
