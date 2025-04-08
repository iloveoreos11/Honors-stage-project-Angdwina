import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';

const DEFAULT_CO2_FACTOR = 0.233;
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
  
    if (pattern === "Always On") {
      return `✅ <strong>${device}</strong> runs continuously as expected (Pattern: Always On). No changes recommended. ✅`;
    }
  
    if (adjustedUsage < 0.5) {
      return `✅ <strong>${device}</strong> is already efficient at <strong>${usage.toFixed(2)} hrs/day</strong> (Pattern: ${pattern}). Great job! 🎉`;
    }
  
    // Calculate full monthly cost and energy
    const fullKWh = (power * adjustedUsage * 30) / 1000;
    const fullCost = fullKWh * costPerKwh;
    const fullCO2 = fullKWh * CO2_FACTOR;
  
    const maxReduction = Math.min(2, adjustedUsage, usage * 0.25);
    if (maxReduction < 0.25) return null;
  
    const reductionRatio = maxReduction / adjustedUsage;
    const savedCost = fullCost * reductionRatio;
    const savedCO2 = fullCO2 * reductionRatio;
  
    return `
      🔌 <strong>${device}</strong> is used <strong>${usage.toFixed(2)} hrs/day</strong> (Pattern: ${pattern}).<br>
      Reducing by <strong>${maxReduction.toFixed(2)} hr${maxReduction !== 1 ? "s" : ""}/day</strong> could:
      <ul>
        <li>💸 Save <strong>${formatMoney(savedCost)}</strong> / month</li>
        <li>🌍 Reduce CO₂ by <strong>${savedCO2.toFixed(2)} kg</strong> / month</li>
      </ul>
    `;
  }
  

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
  const costPerKwh = parseFloat(userData.costPerKwh || DEFAULT_COST_PER_KWH);
  const co2Factor = parseFloat(userData.carbonIntensity || DEFAULT_CO2_FACTOR);

  const q = query(collection(db, "devices"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  const tips = [];
  snapshot.forEach((doc) => {
    const d = doc.data();
    const tip = generateTip(
      d.deviceName,
      parseFloat(d.deviceUsage),
      parseFloat(d.devicePower),
      costPerKwh,
      co2Factor,
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
