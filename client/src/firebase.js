// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDs6cbviazcbkRpKcSMxpIrO5N0WRn8ZvU",
  authDomain: "mern-estate-fe9d4.firebaseapp.com",
  projectId: "mern-estate-fe9d4",
  storageBucket: "mern-estate-fe9d4.appspot.com",
  messagingSenderId: "605676036125",
  appId: "1:605676036125:web:68c2cd0f01afe3de17e6f4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);