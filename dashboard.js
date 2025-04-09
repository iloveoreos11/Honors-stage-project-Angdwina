import { auth, db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const totalEnergyEl = document.getElementById("totalEnergy");
const totalCostEl = document.getElementById("totalCost");
const totalCarbonEl = document.getElementById("totalCarbon");
const topDevicesList = document.getElementById("topDevicesList");
const smartTipEl = document.getElementById("smartTip");

// Default fallback rates
let costPerKwh = 0.34;
let carbonIntensity = 0.233;

// Usage pattern multipliers
const patternMultipliers = {
  "Always On": 1.0,
  "Standby": 0.15,
  "Intermittent": 1.0,
  "Occasional": 0.5,
  "Seasonal": 0.25
};

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be signed in to view this page.");
    window.location.href = "signup.html";
    return;
  }

  currentUser = user;

  // Get user settings
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    costPerKwh = data.costPerKwh ?? costPerKwh;
    carbonIntensity = data.carbonIntensity ?? carbonIntensity;
  }

  loadDashboardData();
});

async function loadDashboardData() {
  const q = query(collection(db, "devices"), where("uid", "==", currentUser.uid));
  const snapshot = await getDocs(q);
  const devices = [];

  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const multiplier = patternMultipliers[d.usagePattern] ?? 1;
    const usageHours = parseFloat(d.deviceUsage) || 0;
    const powerWatts = parseFloat(d.devicePower) || 0;

    const kWh = (powerWatts * usageHours * 30 * multiplier) / 1000;
    const cost = kWh * costPerKwh;
    const co2 = kWh * carbonIntensity;

    devices.push({
      name: d.deviceName,
      usage: usageHours,
      cost: cost,
      co2: co2,
      kwh: kWh
    });
  });

  const totalKwh = devices.reduce((sum, d) => sum + d.kwh, 0);
  const totalCost = devices.reduce((sum, d) => sum + d.cost, 0);
  const totalCO2 = devices.reduce((sum, d) => sum + d.co2, 0);

  totalEnergyEl.textContent = `🌡️ Energy: ${totalKwh.toFixed(2)} kWh`;
  totalCostEl.textContent = `💸 Cost: £${totalCost.toFixed(2)}`;
  totalCarbonEl.textContent = `🌍 CO₂: ${totalCO2.toFixed(2)} kg`;

  showTopDevices(devices);
  showSmartTip(devices);
}

function showTopDevices(devices) {
  const sorted = [...devices].sort((a, b) => b.cost - a.cost).slice(0, 3);
  topDevicesList.innerHTML = "";

  if (sorted.length === 0) {
    topDevicesList.innerHTML = "<li>No devices added yet.</li>";
    return;
  }

  for (const d of sorted) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${d.name}</strong> • ${d.kwh.toFixed(1)} kWh/mo • £${d.cost.toFixed(2)}`;
    topDevicesList.appendChild(li);
  }
}

function showSmartTip(devices) {
  if (!devices.length) {
    smartTipEl.textContent = "Add some devices to get helpful energy tips!";
    return;
  }

  const highUsage = devices.find(d => d.usage > 5 && d.cost > 5);
  const highest = [...devices].sort((a, b) => b.cost - a.cost)[0];

  if (highUsage) {
    smartTipEl.textContent = `💡 Try reducing your ${highUsage.name}'s usage from ${highUsage.usage} hrs/day to 4 hrs to save up to £${(highUsage.cost * 0.25).toFixed(2)} monthly.`;
  } else if (highest) {
    smartTipEl.textContent = `💡 Your ${highest.name} uses the most energy. Consider reducing its daily usage.`;
  } else {
    smartTipEl.textContent = "💡 You're doing great! Keep monitoring your energy use.";
  }
}

// Sign-out logic
document.getElementById("signOutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "signup.html";
});
