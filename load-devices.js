// load-devices.js
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);
const auth = getAuth();

const container = document.querySelector(".col-md-6 .card.p-4"); // Device card container

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const q = query(collection(db, "devices"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const div = document.createElement("div");
      div.className = "device-card";
      div.innerHTML = `
        <div>
          <strong>${data.deviceName}</strong><br>
          <span class='badge bg-light text-dark'>${getEmoji(data.usagePattern)} ${data.usagePattern}</span><br>
          <small>${data.devicePower}W • ${data.deviceUsage} hrs/day</small>
        </div>
        <button class="btn btn-outline-danger btn-sm">Delete</button>
      `;
      container.appendChild(div);
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
