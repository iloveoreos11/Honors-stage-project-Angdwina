import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

// Handle the Sign-Up form
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const username = document.getElementById("signupUsername").value;

  // Capture Cost per kWh and Carbon Intensity from the form
  const costPerKwh = parseFloat(document.getElementById("costPerKwh").value);
  const carbonIntensity = parseFloat(document.getElementById("carbonIntensity").value);

  try {
    // Create the user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save the user and their data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      costPerKwh,  // Save the Cost per kWh
      carbonIntensity  // Save the Carbon Intensity
    });

    alert("Sign-up successful!");
    window.location.href = "index.html";  // Redirect to Dashboard or another page

  } catch (error) {
    alert(error.message);  // Handle any errors
  }
});

// Handle the Sign-In form
document.getElementById("signinForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signinEmail").value;
  const password = document.getElementById("signinPassword").value;

  try {
    // Sign in the user with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    alert("Sign-in successful!");
    window.location.href = "index.html";  // Redirect to Dashboard or another page

  } catch (error) {
    alert(error.message);  // Handle any errors
  }
});
