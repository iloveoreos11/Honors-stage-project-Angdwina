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

let costPerKwh = 0.34;
let carbonIntensity = 0.233;

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
        kwh: kWh,
        pattern: d.usagePattern
      });
    });
  
    const totalKwh = devices.reduce((sum, d) => sum + d.kwh, 0);
    const totalCost = devices.reduce((sum, d) => sum + d.cost, 0);
    const totalCO2 = devices.reduce((sum, d) => sum + d.co2, 0);
  
    totalEnergyEl.innerHTML = `🔌 <strong>Estimated Month’s Energy Usage:</strong><br>${totalKwh.toFixed(2)} kWh`;
    totalCostEl.innerHTML = `💸 <strong>Estimated Monthly Cost:</strong><br>£${totalCost.toFixed(2)}`;
    totalCarbonEl.innerHTML = `🌍 <strong>Estimated CO₂ Emissions:</strong><br>${totalCO2.toFixed(2)} kg`;
  
    // Update cost per kWh and CO₂ intensity display
    document.getElementById("costPerKwhDisplay").textContent = `£${costPerKwh.toFixed(2)}`;
    document.getElementById("carbonIntensityDisplay").textContent = `${carbonIntensity.toFixed(3)} kg/kWh`;
  
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
    li.innerHTML = `🔥 <strong>${d.name}</strong> • ${d.kwh.toFixed(1)} kWh/mo • £${d.cost.toFixed(2)}`;
    topDevicesList.appendChild(li);
  }
}

function showSmartTip(devices) {
  if (!devices.length) {
    smartTipEl.textContent = "💡 No devices added yet. Add a few to receive smart tips!";
    return;
  }

  const tips = [];

  devices.forEach((d) => {
    const tip = generateTip(
      d.name,
      d.usage,
      d.cost / (costPerKwh * 30) * 1000 / d.usage || 0, // reverse calculate power from cost estimate
      costPerKwh,
      carbonIntensity,
      d.pattern || "Intermittent"
    );
    if (tip) tips.push(tip);
  });

  smartTipEl.innerHTML = tips.length > 0
    ? `💡 ${tips[0]}`
    : "💡 You're already using your devices efficiently! Great job 🌿";
}

function generateTip(device, usage, power, costPerKwh, co2Factor, pattern = "Intermittent") {
    const patternMultipliers = {
      "Always On": 0.35,
      "Standby": 0.15,
      "Intermittent": 1.0,
      "Occasional": 0.5,
      "Seasonal": 0.25
    };
  
    const adjustedUsage = usage * (patternMultipliers[pattern] ?? 1.0);
  
    if (pattern === "Always On") {
      return `<strong>${device}</strong> runs continuously (Pattern: Always On). No changes recommended.`;
    }
  
    if (adjustedUsage < 0.5) {
      const usageDisplay = usage < 1
        ? `${Math.round(usage * 60)} minute${Math.round(usage * 60) !== 1 ? "s" : ""}/day`
        : `${usage.toFixed(2)} hrs/day`;
      return `<strong>${device}</strong> is already efficient at ${usageDisplay} (Pattern: ${pattern}). Great job! 🎉`;
    }
  
    const maxReduction = Math.min(2, adjustedUsage * 0.25);
    if (maxReduction < 0.25) return null;
  
    const fullKWh = (power * usage * 30) / 1000;
    const fullCost = fullKWh * costPerKwh;
    const fullCO2 = fullKWh * co2Factor;
  
    const realisticRatio = maxReduction / usage;
    const savedCost = fullCost * realisticRatio;
    const savedCO2 = fullCO2 * realisticRatio;
    const minutes = Math.round(maxReduction * 60);
  
    return `<strong>${device}</strong> is used ${usage.toFixed(2)} hrs/day (Pattern: ${pattern}).<br>By reducing usage by ${minutes} min/day, you could save <strong>£${savedCost.toFixed(2)}</strong> and cut <strong>${savedCO2.toFixed(2)} kg CO₂</strong> monthly.`;
  }
  

const signOutBtn = document.getElementById("signOutBtn");
if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "signup.html";
  });
}
