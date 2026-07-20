const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
// =============================================================================
// OPEN GOVERNMENT DATA (data.gov.in) INTEGRATIONS
// =============================================================================

// 1. Agriculture: Mandi Prices
app.get("/api/gov/mandi-prices", async (req, res) => {
  const { state, commodity } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070"; 
  
  if (apiKey && apiKey !== "MOCK_KEY") {
    try {
      const axios = require("axios");
      let url = \`https://api.data.gov.in/resource/\${resourceId}?api-key=\${apiKey}&format=json&limit=10\`;
      if (state) url += \`&filters[state]=\${encodeURIComponent(state as string)}\`;
      if (commodity) url += \`&filters[commodity]=\${encodeURIComponent(commodity as string)}\`;
      
      const response = await axios.get(url, { timeout: 5000 });
      return res.json(response.data);
    } catch (err) {
      console.error("Mandi Prices API failed, falling back to mock:", err.message);
    }
  }
  
  // Fallback Mock Data
  res.json({
    status: "ok",
    total: 3,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", market: "Bhopal (F&V)", commodity: commodity || "Wheat", min_price: "2200", max_price: "2450", modal_price: "2350", arrival_date: new Date().toISOString().split("T")[0] },
      { state: state || "Madhya Pradesh", district: "Sehore", market: "Sehore", commodity: commodity || "Soyabean", min_price: "4200", max_price: "4600", modal_price: "4500", arrival_date: new Date().toISOString().split("T")[0] },
      { state: state || "Madhya Pradesh", district: "Vidisha", market: "Vidisha", commodity: commodity || "Gram", min_price: "5100", max_price: "5800", modal_price: "5600", arrival_date: new Date().toISOString().split("T")[0] }
    ]
  });
});

// 2. Health: Hospital Directory
app.get("/api/gov/hospitals", async (req, res) => {
  const { state, district } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = "7924619d-71b5-4b47-b861-12c823055428"; 
  
  if (apiKey && apiKey !== "MOCK_KEY") {
    try {
      const axios = require("axios");
      let url = \`https://api.data.gov.in/resource/\${resourceId}?api-key=\${apiKey}&format=json&limit=10\`;
      if (state) url += \`&filters[state]=\${encodeURIComponent(state as string)}\`;
      if (district) url += \`&filters[district]=\${encodeURIComponent(district as string)}\`;
      
      const response = await axios.get(url, { timeout: 5000 });
      return res.json(response.data);
    } catch (err) {
      console.error("Hospitals API failed, falling back to mock:", err.message);
    }
  }
  
  // Fallback Mock Data
  res.json({
    status: "ok",
    total: 3,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "Hamidia Hospital", type: "District Hospital", address: "Royal Market Road", pincode: "462001", mobile_number: "0755-2540141" },
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "JP Hospital", type: "District Hospital", address: "Tulsi Nagar", pincode: "462003", mobile_number: "0755-2550186" },
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "AIIMS Bhopal", type: "Super Specialty", address: "Saket Nagar", pincode: "462020", mobile_number: "0755-2672322" }
    ]
  });
});
`;

// Insert the new routes before the Database schema block
const hookString = "// =============================================================================\n// DATABASE SCHEMA & AUTO-INITIALIZATION";
code = code.replace(hookString, newRoutes + "\n" + hookString);

fs.writeFileSync('server.ts', code);
console.log("Added gov APIs to server.ts");
