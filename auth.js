// Import Firebase Auth functions
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { auth } from './firebase-config.js';

// Sign Up
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("🎉 Account created! Redirecting...");
        window.location.href = "index.html"; // redirect to dashboard
      })
      .catch((error) => {
        document.getElementById("signupError").textContent = error.message;
      });
  });
}

// Sign In
const signinForm = document.getElementById("signinForm");
if (signinForm) {
  signinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signinEmail").value;
    const password = document.getElementById("signinPassword").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("🔐 Signed in successfully!");
        window.location.href = "index.html";
      })
      .catch((error) => {
        document.getElementById("signinError").textContent = error.message;
      });
  });
}

// Sign Out (optional, use in navbar or settings page)
const signOutBtn = document.getElementById("signOutBtn");
if (signOutBtn) {
  signOutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      alert("👋 Signed out!");
      window.location.href = "login.html";
    });
  });
}
