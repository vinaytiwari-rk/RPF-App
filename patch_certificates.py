import re
import os

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add verification endpoint
verify_api = """
app.get("/api/certificates/verify/:certificate_id", async (req, res) => {
  try {
    const certId = req.params.certificate_id;
    const certRes = await pool.query(`SELECT * FROM certificates WHERE certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found or invalid." });
    
    const cert = certRes.rows[0];
    const volRes = await pool.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];

    res.json({
      success: true,
      data: {
        certificate_id: cert.certificate_id,
        volunteer_name: vol.full_name,
        registration_number: vol.registration_number,
        service_name: cert.service_id.replace(/-/g, ' ').toUpperCase(),
        issue_date: cert.issue_date,
        location: `${vol.city}, ${vol.state}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
"""

# Insert before download endpoint
content = content.replace('app.get("/api/certificates/download/:id"', verify_api + '\napp.get("/api/certificates/download/:id"')

# 2. Add Logo Embedding Logic
logo_logic = """
    // Draw Content
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo.png');
    if (require('fs').existsSync(logoPath)) {
      const logoImageBytes = require('fs').readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      const logoDims = logoImage.scale(0.15); // Scale down logo
      page.drawImage(logoImage, {
        x: width / 2 - logoDims.width / 2,
        y: height - logoDims.height - 35,
        width: logoDims.width,
        height: logoDims.height,
      });
    }

    page.drawText('RP FOUNDATION', { x: width / 2 - 120, y: height - 120, size: 30, font, color: rgb(0.1, 0.2, 0.5) });
    page.drawText('CERTIFICATE OF APPRECIATION', { x: width / 2 - 200, y: height - 160, size: 24, font, color: rgb(0.8, 0.6, 0.2) });
"""

content = re.sub(r"    // Draw Content\n    page\.drawText\('RP FOUNDATION'.*?\);", logo_logic, content, flags=re.DOTALL)

# Adjust y positions for the rest of the text
content = content.replace("y: height - 140", "y: height - 160")
content = content.replace("y: height - 80", "y: height - 80") # Date/ID can stay top corners
content = content.replace("y: height - 200", "y: height - 230")
content = content.replace("y: height - 260", "y: height - 290")
content = content.replace("y: height - 290", "y: height - 320")
content = content.replace("y: height - 340", "y: height - 370")
content = content.replace("y: height - 370", "y: height - 400")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched server.ts successfully!")
