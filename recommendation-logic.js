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

function generateTip(device, usage, power, costPerKwh) {
  const originalKWh = (power * usage * 30) / 1000;
  const reducedUsage = usage - 1;
  if (reducedUsage < 0.1) return null;
  const reducedKWh = (power * reducedUsage * 30) / 1000;

  const savedKWh = originalKWh - reducedKWh;
  const savedCost = savedKWh * costPerKwh;
  const savedCO2 = savedKWh * CO2_FACTOR;

  return `📺 You’re using your <strong>${device}</strong> for <strong>${usage.toFixed(2)} hrs/day</strong>. Try reducing it by <strong>1 hour</strong> and save <strong>${formatMoney(savedCost)}</strong> and <strong>${savedCO2.toFixed(2)} kg CO₂/month</strong>. Your wallet and the planet will thank you! 🌍💸`;
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
      parseFloat(d.costPerKwh || DEFAULT_COST_PER_KWH)
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
