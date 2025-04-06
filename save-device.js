// save-device.js
import { db, auth } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const form = document.getElementById("deviceForm");
const deviceContainer = document.querySelector(".col-md-6 .card.p-4");

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userDevicesRef = collection(db, "devices");

    const q = query(userDevicesRef, where("uid", "==", user.uid));
    onSnapshot(q, (snapshot) => {
      const existingCards = deviceContainer.querySelectorAll(".device-card");
      existingCards.forEach(card => card.remove());

      snapshot.forEach(doc => {
        const d = doc.data();
        const card = document.createElement("div");
        card.className = "device-card";
        card.innerHTML = `
          <div>
            <strong>${d.deviceName}</strong><br>
            <span class='badge bg-light text-dark'>${getEmoji(d.usagePattern)} ${d.usagePattern}</span><br>
            <small>${d.devicePower}W • ${d.deviceUsage} hrs/day</small>
          </div>
        `;
        deviceContainer.appendChild(card);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const deviceName = document.getElementById("deviceName").value;
      const devicePower = parseInt(document.getElementById("devicePower").value);
      const deviceUsage = parseFloat(document.getElementById("deviceUsage").value);
      const usagePattern = document.getElementById("usagePattern").value;

      if (!deviceName || isNaN(devicePower) || isNaN(deviceUsage)) return;

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
  }
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
