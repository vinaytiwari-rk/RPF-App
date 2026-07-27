const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:3000/api';

async function testLocalAPI() {
  console.log("Starting API Tests on LOCAL server: " + BASE_URL);

  try {
    // 1. Test Services Submission (JanSevaCard, etc.)
    console.log("\n--- Testing Service Submission ---");
    const servicePayload = {
      service_id: "test_service_999",
      full_name: "API_TEST_USER",
      phone: "9999999999",
      email: "test@example.com",
      address: "Test Address",
      city: "Bhopal",
      state: "MP",
      pincode: "462001",
      submitted_data: { test: true, note: "This is a test submission from the CI agent" }
    };
    const serviceRes = await axios.post(`${BASE_URL}/submissions`, servicePayload);
    console.log("Service Submission Response:", serviceRes.status, serviceRes.data);

    // 2. Test Blood Request
    console.log("\n--- Testing Blood Request ---");
    const bloodPayload = {
      patient_name: "TEST_PATIENT",
      blood_group: "O+",
      units_needed: 1,
      hospital_name: "Test Hospital",
      city: "Bhopal",
      contact_name: "Test Contact",
      contact_phone: "9999999999",
      urgency: "normal",
      notes: "Test API request"
    };
    const bloodRes = await axios.post(`${BASE_URL}/blood/requests`, bloodPayload);
    console.log("Blood Request Response:", bloodRes.status, bloodRes.data);

    // 3. Test Women Safety Complaint
    console.log("\n--- Testing Women Safety Complaint ---");
    const ncwPayload = {
      name: "TEST_COMPLAINANT",
      phone: "9999999999",
      type: "harassment",
      location: "Test Location",
      description: "Test API request for women safety complaint",
      is_anonymous: false
    };
    const ncwRes = await axios.post(`${BASE_URL}/women/complaints`, ncwPayload);
    console.log("Women Safety Complaint Response:", ncwRes.status, ncwRes.data);

  } catch (error) {
    console.error("API Test Failed:");
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error);
    }
  }
}

testLocalAPI();
