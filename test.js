// --- Unit Test: Cost Calculation ---
function calculateMonthlyCost(powerWatts, usageHoursPerDay, costPerKwh) {
    const powerKw = powerWatts / 1000;
    return powerKw * usageHoursPerDay * 30 * costPerKwh;
}

function testCalculateMonthlyCost() {
    const result = calculateMonthlyCost(1000, 2, 0.30);
    const expected = 18.00;
    console.log(result.toFixed(2) == expected.toFixed(2) ? "✅ Cost Calculation Test Passed" : "❌ Cost Calculation Test Failed");
}

// --- Unit Test: CO2 Emission Calculation ---
function calculateMonthlyCO2(kwhPerMonth, co2Intensity) {
    return kwhPerMonth * co2Intensity;
}

function testCalculateMonthlyCO2() {
    const result = calculateMonthlyCO2(100, 0.233);
    const expected = 23.3;
    console.log(result.toFixed(2) == expected.toFixed(2) ? "✅ CO₂ Emission Calculation Test Passed" : "❌ CO₂ Emission Calculation Test Failed");
}

// --- Unit Test: Form Validation ---
function validateDeviceForm(deviceName, powerWatts, usageHours) {
    if (!deviceName.trim()) return false;
    if (isNaN(powerWatts) || powerWatts <= 0) return false;
    if (isNaN(usageHours) || usageHours <= 0) return false;
    return true;
}

function testValidateDeviceForm() {
    console.log(validateDeviceForm("Microwave", 1000, 1.5) ? "✅ Form Validation Test Passed" : "❌ Form Validation Test Failed (Valid)");
    console.log(!validateDeviceForm("", 1000, 1.5) ? "✅ Empty Name Validation Test Passed" : "❌ Empty Name Validation Test Failed");
    console.log(!validateDeviceForm("Microwave", -500, 1.5) ? "✅ Invalid Power Validation Test Passed" : "❌ Invalid Power Validation Test Failed");
    console.log(!validateDeviceForm("Microwave", 1000, 0) ? "✅ Invalid Hours Validation Test Passed" : "❌ Invalid Hours Validation Test Failed");
}

// --- Run all tests ---
function runAllTests() {
    console.log("Running Unit Tests...");
    testCalculateMonthlyCost();
    testCalculateMonthlyCO2();
    testValidateDeviceForm();
}

runAllTests();
