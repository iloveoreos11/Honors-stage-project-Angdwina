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

let allDevices = []; // global device list

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("deviceForm");
  const deviceContainer = document.querySelector("#deviceCardContainer");
  const searchInput = document.getElementById("deviceSearch");
  const sortSelect = document.getElementById("sortDevices");

  const renderDevices = () => {
    const keyword = searchInput?.value?.toLowerCase() || "";
    const sortBy = sortSelect?.value;

    let filtered = [...allDevices].filter(d => d.deviceName.toLowerCase().includes(keyword));

    if (sortBy === "name") filtered.sort((a, b) => a.deviceName.localeCompare(b.deviceName));
    else if (sortBy === "power") filtered.sort((a, b) => a.devicePower - b.devicePower);
    else if (sortBy === "usage") filtered.sort((a, b) => a.deviceUsage - b.deviceUsage);

    deviceContainer.innerHTML = "";
    filtered.forEach(d => {
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
          await deleteDoc(doc(db, "devices", d.id));
        }
      });

      deviceContainer.appendChild(card);
    });
  };

  if (searchInput) searchInput.addEventListener("input", renderDevices);
  if (sortSelect) sortSelect.addEventListener("change", renderDevices);

  onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const userDevicesRef = collection(db, "devices");
    const q = query(userDevicesRef, where("uid", "==", user.uid));

    onSnapshot(q, (snapshot) => {
      allDevices = [];
      snapshot.forEach(docSnap => {
        allDevices.push({ id: docSnap.id, ...docSnap.data() });
      });
      renderDevices();
    });
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const deviceName = document.getElementById("deviceName").value;
    const devicePower = parseFloat(document.getElementById("devicePower").value);
    const deviceUsage = parseFloat(document.getElementById("deviceUsage").value);
    const usagePattern = document.getElementById("usagePattern").value;

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "devices"), {
      uid: user.uid,
      deviceName,
      devicePower,
      deviceUsage,
      usagePattern
    });

    form.reset();
  });

  // 👇 Update estimate when selecting device from autocomplete
  window.updateEstimates = function () {
    const power = parseFloat(document.getElementById("devicePower").value);
    const usage = parseFloat(document.getElementById("deviceUsage").value);
    const costDisplay = document.getElementById("estimatedCost");
    const co2Display = document.getElementById("estimatedCO2");

    let costRate = 0.34;
    let carbonRate = 0.233;

    if (!isNaN(power) && !isNaN(usage)) {
      const dailyKWh = (power * usage) / 1000;
      const monthlyCost = (dailyKWh * 30 * costRate).toFixed(2);
      const monthlyCO2 = (dailyKWh * 30 * carbonRate).toFixed(2);

      if (costDisplay) costDisplay.textContent = `£${monthlyCost}`;
      if (co2Display) co2Display.textContent = `${monthlyCO2} kg/month`;
    }
  };
});

function getEmoji(pattern) {
  switch (pattern) {
    case "Morning": return "🌅";
    case "Afternoon": return "🌞";
    case "Evening": return "🌇";
    case "Night": return "🌙";
    default: return "🔌";
  }
}
