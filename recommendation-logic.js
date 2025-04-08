// recommendation-logic.js
import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const CO2_FACTOR = 0.233;
const DEFAULT_COST_PER_KWH = 0.34;

const tipsContainer = document.getElementById("recommendationTips");

function formatMoney(amount) {
  return "£" + amount.toFixed(2);
}

function generateTip(device, usage, power, costPerKwh, pattern = "Intermittent") {
    const patternMultipliers = {
      "Always On": 0.35,
      "Standby": 0.15,
      "Intermittent": 1.0,
      "Occasional": 0.5,
      "Seasonal": 0.25
    };
  
    const multiplier = patternMultipliers[pattern] ?? 1.0;
  
    // Skip tip for Always On devices
    if (pattern === "Always On") {
      return `✅ <strong>${device}</strong> runs continuously as expected (Pattern: Always On). No changes recommended. ✅`;
    }
  
    const adjustedUsage = usage * multiplier;
  
    if (adjustedUsage < 0.5) {
      return `✅ <strong>${device}</strong> is already efficient at <strong>${adjustedUsage.toFixed(2)} hrs/day</strong> (Pattern: ${pattern}). Great job! 🎉`;
    }
  
    const reducedUsage = adjustedUsage - 1;
    if (reducedUsage <= 0) return null;
  
    const originalKWh = (power * adjustedUsage * 30) / 1000;
    const reducedKWh = (power * reducedUsage * 30) / 1000;
  
    const savedKWh = originalKWh - reducedKWh;
    const savedCost = savedKWh * costPerKwh;
    const savedCO2 = savedKWh * CO2_FACTOR;
  
    const maxCost = originalKWh * costPerKwh;
    const maxCO2 = originalKWh * CO2_FACTOR;
  
    return `
      ⚡ <strong>${device}</strong> is currently used <strong>${adjustedUsage.toFixed(2)} hrs/day</strong> (Pattern: ${pattern}).
      Try reducing by <strong>1 hour/day</strong>:
      <ul>
        <li>💸 Save ${formatMoney(Math.min(savedCost, maxCost))} / month</li>
        <li>🌍 Reduce CO₂ by ${Math.min(savedCO2, maxCO2).toFixed(2)} kg / month</li>
      </ul>
    `;
  }
  

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const q = query(collection(db, "devices"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  const tips = [];
  snapshot.forEach((doc) => {
    const d = doc.data();
    const tip = generateTip(
      d.deviceName,
      parseFloat(d.deviceUsage),
      parseFloat(d.devicePower),
      parseFloat(d.costPerKwh || DEFAULT_COST_PER_KWH),
      d.usagePattern || "Intermittent"
    );
    if (tip) tips.push(`<li class="list-group-item">${tip}</li>`);
  });

  tipsContainer.innerHTML = `
    <div class="card p-4">
      <h4 class="mb-3">💡 Personalized Recommendations</h4>
      <ul class="list-group list-group-flush">
        ${tips.length > 0 ? tips.join('') : '<li class="list-group-item">No tips yet – your usage is already efficient! 🔋✨</li>'}
      </ul>
    </div>
  `;
});
