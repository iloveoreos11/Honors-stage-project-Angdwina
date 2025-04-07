import { db, auth } from './firebase-config.js';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("deviceForm");
  const deviceContainer = document.querySelector("#deviceCardContainer");

  // Let the page style and autofill settle before doing anything
  setTimeout(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.warn("User not signed in.");
        return;
      }

      const userDevicesRef = collection(db, "devices");
      const q = query(userDevicesRef, where("uid", "==", user.uid));

      onSnapshot(q, (snapshot) => {
        const existingCards = deviceContainer.querySelectorAll(".device-card");
        existingCards.forEach(card => card.remove());

        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          const card = document.createElement("div");
          card.className = "device-card";
          card.innerHTML = `
            <div>
              <strong>${d.deviceName}</strong><br>
              <span class='badge bg-light text-dark'>${getEmoji(d.usagePattern)} ${d.usagePattern}</span><br>
              <small>${d.devicePower}W • ${d.deviceUsage} hrs/day</small>
            </div>
            <button class="btn btn-outline-danger btn-sm delete-btn">Delete</button>
          `;

          card.querySelector(".delete-btn").addEventListener("click", async () => {
            if (confirm(`Delete ${d.deviceName}?`)) {
              await deleteDoc(doc(db, "devices", docSnap.id));
            }
          });

          deviceContainer.appendChild(card);
        });
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const deviceName = document.getElementById("deviceName").value.trim();
        const devicePower = parseInt(document.getElementById("devicePower").value);
        const deviceUsage = parseFloat(document.getElementById("deviceUsage").value);
        const usagePattern = document.getElementById("usagePattern").value;

        if (!deviceName || isNaN(devicePower) || isNaN(deviceUsage)) {
          alert("Please enter valid device info.");
          return;
        }

        try {
          await addDoc(userDevicesRef, {
            uid: user.uid,
            deviceName,
            devicePower,
            deviceUsage,
            usagePattern
          });
          form.reset();
        } catch (error) {
          alert("Error saving device: " + error.message);
        }
      });
    });
  }, 200); // 💅 wait 200ms to let the beauty breathe
});

function getEmoji(pattern) {
  switch (pattern) {
    case "Always On": return "🔁";
    case "Standby": return "💤";
    case "Intermittent": return "⏱️";
    case "Occasional": return "🕓";
    case "Seasonal": return "❄️";
    default: return "⚡";
  }
}
