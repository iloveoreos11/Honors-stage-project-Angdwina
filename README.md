
# 📊 Power Usage Dashboard – Honours Stage Project

**Author**: Angdwina Smith  


---

## Overview
The Power Usage Dashboard is a web-based energy monitoring tool designed to help users estimate household electricity consumption, identify high-impact devices, and receive personalised energy-saving recommendations.

Built as part of my final-year Honours project, the system emphasizes user-friendly design, affordability, and privacy — with no reliance on smart meters or hardware installations.

---

## 🛠️ Features

- 🔐 **Firebase Authentication** – Secure sign-up, login, and personal device data
- ⚙️ **Device Manager** – Add, edit, or delete household devices with usage patterns
- 💡 **Smart Estimations** – Calculate monthly cost and CO₂ emissions per device
- 📈 **Reports Page** – Analyze energy usage with sortable tables and insights
- 🌱 **Recommendation Engine** – Personalised suggestions to reduce energy usage or praise efficient behaviour
- ⚙️ **Settings Page** – Manage custom cost per kWh and carbon intensity

---

## 🧰 Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend Services:** Firebase Authentication + Firestore
- **Hosting:** Static frontend (works with GitHub Pages)
- **Data Source:** Local JSON dataset (`uk_household_devices_40.json`) simulating an API

---

## 📂 Project Structure

```
.
├── index.html
├── devices.html
├── reports.html
├── recommendations.html
├── settings.html
├── signup.html / signin.html
├── unittesting.html
├── test.js
├── css/
│   └── style.css
├── js/
│   ├── firebase-config.js
│   ├── save-device.js
│   ├── recommendation-logic.js
│   ├── load-reports.js
│   ├── auth.js
│   └── dashboard.js
├── uk_household_devices_40.json
├── README.md
```

---

## 📄 Firebase Configuration

The project uses Firebase Authentication and Firestore services.  
The Firebase SDK is initialized with the following configuration:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBt9JfcbCWqjmv1TptKke6ChTVGVWKRt9U",
    authDomain: "powerusagedashboard.firebaseapp.com",
    projectId: "powerusagedashboard",
    storageBucket: "powerusagedashboard.appspot.com",
    messagingSenderId: "158643652987",
    appId: "1:158643652987:web:be0ae3618650ff9a6545dc",
    measurementId: "G-FL1CFM29YY"
};
```

- Firebase Authentication securely manages user sign-up, login, and logout.
- Firestore stores device information for each authenticated user.
- Configuration uses public keys and follows Firebase client security standards.

---

## 🔒 Firestore Security Rules

The Firestore database is protected with user-specific access control:

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }
    match /devices/{deviceId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.uid;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.uid;
      allow delete: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

- Only authenticated users can read/write their own data.
- No public or cross-user access is permitted.

---

## 🌍 External Data

- `uk_household_devices_40.json` simulates a device metadata API.
- Provides standard device names, power ratings, and usage patterns.
- Data is loaded asynchronously when users add devices.

---

## 🚀 How to Run

1. Extract the ZIP file contents.
2. Open `index.html` in a modern web browser (e.g., Chrome, Firefox).
3. Create an account via the "Sign Up" page (`signup.html`).
4. Log in via "Sign In" (`signin.html`).
5. Add devices, view reports, and receive personalised energy-saving tips.

**Note**: Internet connection is required for Firebase Authentication and Firestore operations.

---

## 📌 Project Goal

To provide an accessible, sensor-free dashboard that empowers non-technical users to take control of their energy consumption — promoting both financial savings and environmental awareness.

---

## 🧪 Unit Testing

- The `unittesting.html` page runs all JavaScript unit tests.
- Please open the Console (F12) to view the test results.

---

