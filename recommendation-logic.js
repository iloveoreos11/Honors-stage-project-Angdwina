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
  const adjustedUsage = usage * multiplier;

  // Skip tips for always-on devices
  if (pattern === "Always On") {
    return `✅ <strong>${device}</strong> runs continuously as expected (Pattern: Always On). No changes recommended. ✅`;
  }

  // Already efficient
  if (adjustedUsage < 0.5) {
    return `✅ <strong>${device}</strong> is already efficient at ${usage.toFixed(2)} hrs/day (Pattern: ${pattern}). Great job! 🎉`;
  }

  // Recommend reducing up to 25% of original usage, or max 2 hours
  const maxReduction = Math.min(2, adjustedUsage, usage * 0.25);
  if (maxReduction < 0.25) return null;

  const savedKWh = (power * maxReduction * 30) / 1000;
  const savedCost = savedKWh * costPerKwh;
  const savedCO2 = savedKWh * CO2_FACTOR;

  return `
    <div class="mb-3">
      🔌 <strong>${device}</strong> is used <strong>${usage.toFixed(2)} hrs/day</strong> (Pattern: ${pattern}).<br>
      Reducing by <strong>${maxReduction.toFixed(2)} hr${maxReduction !== 1 ? "s" : ""}/day</strong> could:
      <ul>
        <li>💸 Save <strong>${formatMoney(savedCost)}</strong> / month</li>
        <li>🌍 Reduce CO₂ by <strong>${savedCO2.toFixed(2)} kg</strong> / month</li>
      </ul>
    </div>
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
    if (tip) tips.push(tip);
  });

  tipsContainer.innerHTML = `
    <h4 class="mb-3">💡 Personalized Recommendations</h4>
    ${tips.length > 0 ? tips.join('') : '<p>No tips yet – your usage is already efficient! 🔋✨</p>'}
  `;
});
