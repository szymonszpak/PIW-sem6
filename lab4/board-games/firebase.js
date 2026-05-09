// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxun7wC3Z-Sg-ikaK1IeXO7JvL4BSR_sc",
  authDomain: "sklep-swiat-planszowek.firebaseapp.com",
  projectId: "sklep-swiat-planszowek",
  storageBucket: "sklep-swiat-planszowek.firebasestorage.app",
  messagingSenderId: "544704090616",
  appId: "1:544704090616:web:056575d575d6c68f5e460d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);