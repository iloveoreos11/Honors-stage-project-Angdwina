import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const form = document.getElementById("deviceForm");
const deviceContainer = document.querySelector(".col-md-6 .card.p-4");

onAuthStateChanged(auth, (user) => {
  if (user) {
    const userDevicesRef = collection(db, "devices");

    // Load user's devices
    const q = query(userDevicesRef, where("userId", "==", user.uid));
    onSnapshot(q, (snapshot) => {
      const existingCards = deviceContainer.querySelectorAll(".device-card");
      existingCards.forEach(card => card.remove());

      snapshot.forEach(doc => {
        const d = doc.data();

        const card = document.createElement("div");
        card.className = "device-card";
        card.innerHTML = `
          <div>
            <strong>${d.name}</strong><br>
            <span class='badge bg-light text-dark'>${d.pattern}</span><br>
            <small>${d.power}W • ${d.hours} hrs/day</small>
          </div>
          <button class="btn btn-outline-danger btn-sm">Delete</button>
        `;
        deviceContainer.appendChild(card);
      });
    });

    // Handle device save
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("deviceName").value;
      const power = parseInt(document.getElementById("devicePower").value);
      const hours = parseFloat(document.getElementById("deviceUsage").value);
      const pattern = document.getElementById("usagePattern").value;

      if (!name || isNaN(power) || isNaN(hours)) return;

      try {
        await addDoc(userDevicesRef, {
          name,
          power,
          hours,
          pattern,
          userId: user.uid
        });
        form.reset();
      } catch (error) {
        alert("Error saving device: " + error.message);
      }
    });
  }
});
