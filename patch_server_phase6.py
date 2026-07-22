import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add table to initDatabase
table_query = """
      await client.query(`
        CREATE TABLE IF NOT EXISTS service_content (
          service_id VARCHAR(50) PRIMARY KEY,
          content_en TEXT,
          content_hi TEXT,
          action_label_en VARCHAR(255),
          action_label_hi VARCHAR(255),
          action_url TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
"""
if "CREATE TABLE IF NOT EXISTS service_content" not in content:
    content = content.replace("await client.query(`\n        CREATE TABLE IF NOT EXISTS users", table_query.strip() + "\n\n      await client.query(`\n        CREATE TABLE IF NOT EXISTS users")

# 2. Add backend APIs
api_code = """
// =============================================================================
// PHASE 6: 21 SERVICES APIs
// =============================================================================

const CORE_SERVICES = [
  { id: "card", category: "welfare", iconName: "ShieldCheck", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड", descEn: "Apply for Foundational ID", descHi: "बुनियादी आईडी के लिए आवेदन" },
  { id: "blood", category: "urgent", iconName: "Heart", titleEn: "Blood Network", titleHi: "रक्त नेटवर्क", descEn: "Emergency Blood Donor Requests", descHi: "आपातकालीन रक्तदाता अनुरोध" },
  { id: "donations", category: "involved", iconName: "HandCoins", titleEn: "Donations", titleHi: "दान", descEn: "Support our causes directly", descHi: "हमारे कारणों का समर्थन करें" },
  { id: "grievance", category: "civic", iconName: "AlertTriangle", titleEn: "Grievances", titleHi: "शिकायतें", descEn: "Report Civic Issues", descHi: "नागरिक समस्याओं की रिपोर्ट" },
  { id: "volunteers", category: "involved", iconName: "Users", titleEn: "Volunteering", titleHi: "स्वयंसेवा", descEn: "Join the RP Force", descHi: "आरपी फोर्स से जुड़ें" },
  { id: "health-camps", category: "welfare", iconName: "Stethoscope", titleEn: "Health Camps", titleHi: "स्वास्थ्य शिविर", descEn: "Free checkups and drives", descHi: "मुफ्त जांच और अभियान" },
  // Expanding to full 21...
  { id: "education", category: "welfare", iconName: "GraduationCap", titleEn: "Education Aid", titleHi: "शिक्षा सहायता", descEn: "Scholarships and Books", descHi: "छात्रवृत्ति और किताबें" },
  { id: "women-safety", category: "urgent", iconName: "Shield", titleEn: "Women Safety", titleHi: "महिला सुरक्षा", descEn: "24/7 Helpline and support", descHi: "24/7 हेल्पलाइन" },
  { id: "environment", category: "involved", iconName: "TreePine", titleEn: "Environment", titleHi: "पर्यावरण", descEn: "Tree plantation drives", descHi: "वृक्षारोपण अभियान" },
  { id: "legal-aid", category: "civic", iconName: "Scale", titleEn: "Free Legal Aid", titleHi: "मुफ्त कानूनी सहायता", descEn: "Legal counseling for citizens", descHi: "नागरिकों के लिए कानूनी सलाह" },
];

app.get("/api/public/services", (req, res) => {
  res.json({ success: true, data: CORE_SERVICES });
});

app.get("/api/public/services/:id/content", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM service_content WHERE service_id = $1`, [id]);
    
    if (result.rows.length === 0) {
      // Return a 200 with success true, but data null so the frontend handles it properly without throwing error
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/admin/hq/services/:id/content", async (req, res) => {
  try {
    const body = req.body || {};
    const { id } = req.params;
    const { content_en, content_hi, action_label_en, action_label_hi, action_url } = body;
    
    await pool.query(`
      INSERT INTO service_content (service_id, content_en, content_hi, action_label_en, action_label_hi, action_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (service_id) DO UPDATE SET 
        content_en = EXCLUDED.content_en,
        content_hi = EXCLUDED.content_hi,
        action_label_en = EXCLUDED.action_label_en,
        action_label_hi = EXCLUDED.action_label_hi,
        action_url = EXCLUDED.action_url,
        updated_at = CURRENT_TIMESTAMP
    `, [id, content_en, content_hi, action_label_en, action_label_hi, action_url]);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
"""

if "PHASE 6: 21 SERVICES APIs" not in content:
    # Insert right before startServer()
    content = content.replace("// Serve static assets in production", api_code.strip() + "\n\n// Serve static assets in production")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched server.ts with Phase 6 APIs")
