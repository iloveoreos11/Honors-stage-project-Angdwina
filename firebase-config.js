// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhmQPpQliV41ZH0cXofUsAWo1elsAvD2I",
  authDomain: "energy-dashboard-angdwina.firebaseapp.com",
  projectId: "energy-dashboard-angdwina",
  storageBucket: "energy-dashboard-angdwina.appspot.com",
  messagingSenderId: "446248966763",
  appId: "1:446248966763:web:a67c811f6456b17be02f2e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
