// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "YOUR-KEY",
  authDomain: "YOUR.firebaseapp.com",
  projectId: "YOUR-ID",
  storageBucket: "YOUR.appspot.com",
  messagingSenderId: "XXXX",
  appId: "APP-ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
