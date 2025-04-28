
---

## Project Structure
- `index.html` – Main landing page (redirects to devices if logged in).
- `devices.html` – Add, edit, and delete household devices.
- `reports.html` – View energy reports and usage insights.
- `recommendations.html` – View personalised energy-saving tips.
- `signup.html` – User registration page.
- `signin.html` – User login page.
- `css/` – Stylesheets for layout and design.
- `js/` – JavaScript files for Firebase integration, device management, reporting, and recommendations.
- `uk_household_devices_40.json` – Local JSON dataset containing common household devices and typical power usage.

---

## Firebase Configuration
The project uses Firebase services for Authentication and Firestore database operations.  
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
- The Firebase configuration only includes public information and is safe for use in client-side applications.

---

## Firestore Security Rules
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

- Only authenticated users can read, write, or delete their own data.
- Cross-user access is strictly prohibited.
- No public or unauthenticated access is permitted.

---

## External Data
- The `uk_household_devices_40.json` file simulates an external API.
- It provides predefined power ratings and usage patterns for typical household devices.
- Device suggestions and default values are dynamically retrieved from this file.

---



## How to Run
1. Extract the contents of the ZIP file.
2. Open `index.html` in a modern web browser (e.g., Chrome, Firefox).
3. To access full functionality:
   - Create an account using the "Sign Up" page (`signup.html`).
   - Log in through the "Sign In" page (`signin.html`).
4. Once logged in, users can add devices, view reports, and read personalised recommendations.

An internet connection is required for Firebase authentication and database operations.
