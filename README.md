
# 📊 Power Usage Dashboard – Honors Stage Project

This project is a web-based energy monitoring tool designed to help users estimate household electricity consumption, identify high-impact devices, and receive personalised energy-saving recommendations.

Built as part of my final-year Honors project, the system emphasizes user-friendly design, affordability, and privacy — with no reliance on smart meters or hardware installations.

---

## 🛠️ Features

- 🔐 Firebase Authentication – Sign up, log in, and secure personal device data
- ⚙️ Device Manager – Add, edit, or delete household devices with usage patterns
- 💡 Smart Estimations – Calculates monthly cost and CO₂ emissions per device
- 📈 Reports Page – View energy usage by device with sortable tables and insights
- 🌱 Recommendation Engine – Provides personalised suggestions (reduce usage, go green, or praise efficient habits)
- ⚙️ Settings Page – Lets users define cost per kWh and carbon intensity, used in all calculations

---

## 🧰 Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Backend Services:** Firebase Authentication + Firestore
- **Hosting:** Static frontend with GitHub Pages-compatible architecture
- **Data Source:** Custom JSON dataset hosted on GitHub to simulate API behaviour

---

## 📁 Pages Included

- `devices.html` – Add/view household devices and see live estimates  
- `reports.html` – Analyze monthly usage and environmental impact  
- `recommendations.html` – Get customised energy-saving tips  
- `settings.html` – Manage personal preferences (e.g. cost per kWh, carbon intensity)  
- `signup.html` / `signin.html` – User registration and login  

---

## 📂 Project Structure

```
.
├── devices.html
├── reports.html
├── recommendations.html
├── settings.html
├── signup.html / signin.html
├── save-device.js
├── recommendation-logic.js
├── load-reports.js
├── firebase-config.js
├── style.css
├── uk_household_devices_40.json
```

---

## 📌 Project Goal

To provide an accessible, sensor-free dashboard that empowers non-technical users to take control of their energy consumption — promoting both financial savings and environmental awareness.
