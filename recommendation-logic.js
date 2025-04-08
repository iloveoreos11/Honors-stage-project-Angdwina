// ✅ recommendation-logic.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const tipsContainer = document.getElementById("recommendationTips");

let averageUsageMap = {};

// Load baseline usage from JSON
fetch("https://raw.githubusercontent.com/iloveoreos11/Honors-stage-project-Angdwina/main/uk_household_devices_40.json")
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      averageUsageMap[item.device.toLowerCase()] = item.usage_hrs_per_day;
    });
  });

const CO2_FACTOR = 0.233;
const COST_PER_KWH = 0.34;

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "signup.html");

  const q = query(collection(db, "devices"), where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(docSnap => {
    const device = docSnap.data();
    const name = device.deviceName;
    const key = name.toLowerCase();

    if (!averageUsageMap[key]) return;

    const userUsage = device.deviceUsage;
    const avgUsage = averageUsageMap[key];

    if (userUsage > avgUsage + 0.25) {
      const reduceBy = Math.min(2, userUsage - avgUsage);
      const power = device.devicePower;

      const savedKwh = (power * reduceBy * 30) / 1000;
      const savedCost = savedKwh * (device.costPerKwh || COST_PER_KWH);
      const savedCO2 = savedKwh * CO2_FACTOR;

      const card = document.createElement("div");
      card.className = "card p-3 mb-3";
      card.innerHTML = `
        <h5 class="mb-2">${name}</h5>
        <p>You're using this for <strong>${userUsage} hrs/day</strong> — <strong>${(userUsage - avgUsage).toFixed(2)} hrs</strong> more than the average.</p>
        <p class="mb-1">🧠 Tip: Reducing by ${reduceBy} hrs/day could save <strong>£${savedCost.toFixed(2)}</strong> and <strong>${savedCO2.toFixed(2)} kg CO₂</strong> per month.</p>
        <p class="mb-0 text-success">🌿 Consider using it more efficiently or upgrading to a greener alternative.</p>
      `;

      tipsContainer.appendChild(card);
    }
  });
});
