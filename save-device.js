// save-device.js
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);
const auth = getAuth(app);

document.getElementById("deviceForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("deviceName").value;
  const power = parseFloat(document.getElementById("devicePower").value);
  const usage = parseFloat(document.getElementById("deviceUsage").value);
  const pattern = document.getElementById("usagePattern").value;

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in!");

  try {
    await addDoc(collection(db, "users", user.uid, "devices"), {
      name,
      power,
      usage,
      pattern,
      createdAt: serverTimestamp()
    });

    alert("✅ Device saved successfully!");
    document.getElementById("deviceForm").reset();
  } catch (err) {
    alert("Error saving device: " + err.message);
  }
});
