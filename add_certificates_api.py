import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Tables
tables_sql = """
    // Create admin_credentials table (if missed earlier)
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id VARCHAR(255) PRIMARY KEY DEFAULT 'admin',
        username TEXT NOT NULL DEFAULT 'admin',
        password_hash TEXT NOT NULL
      )
    `);
    
    // Seed default admin if missing
    const adminRes = await client.query(`SELECT count(*) FROM admin_credentials`);
    if (parseInt(adminRes.rows[0].count) === 0) {
      const defaultHash = await bcrypt.hash('admin', 10);
      await client.query(`INSERT INTO admin_credentials (id, username, password_hash) VALUES ('admin', 'admin', $1)`, [defaultHash]);
    }

    // Create certificates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        certificate_id TEXT UNIQUE NOT NULL,
        volunteer_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create service_signatures table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_signatures (
        service_id TEXT PRIMARY KEY,
        signatory_1_name TEXT DEFAULT 'Rohit Pandit',
        signatory_1_designation TEXT DEFAULT 'Founder',
        signatory_2_name TEXT DEFAULT '',
        signatory_2_designation TEXT DEFAULT ''
      )
    `);
"""
content = content.replace('// Create passkeys table for WebAuthn', tables_sql + '\n    // Create passkeys table for WebAuthn')

# 2. Add API Routes
api_routes = """
// ---------------- CERTIFICATE ENGINE ----------------

app.get("/api/admin/hq/certificates/signatures/:service_id", async (req, res) => {
  try {
    const { service_id } = req.params;
    const result = await pool.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [service_id]);
    if (result.rows.length === 0) {
      return res.json({ success: true, data: { service_id, signatory_1_name: 'Rohit Pandit', signatory_1_designation: 'Founder', signatory_2_name: '', signatory_2_designation: '' } });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/hq/certificates/signatures", async (req, res) => {
  try {
    const { service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation } = req.body;
    await pool.query(`
      INSERT INTO service_signatures (service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (service_id) DO UPDATE SET
      signatory_1_name = EXCLUDED.signatory_1_name,
      signatory_1_designation = EXCLUDED.signatory_1_designation,
      signatory_2_name = EXCLUDED.signatory_2_name,
      signatory_2_designation = EXCLUDED.signatory_2_designation
    `, [service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/hq/certificates/issue", async (req, res) => {
  try {
    const { volunteer_id, service_id } = req.body;
    const certId = "RP-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    
    // Validate volunteer
    const volRes = await pool.query(`SELECT id FROM volunteers WHERE id = $1 OR username = $1 OR registration_number = $1`, [volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const realVolId = volRes.rows[0].id;

    // Check if already issued
    const existing = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 AND service_id = $2`, [realVolId, service_id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Certificate already issued for this service." });

    const result = await pool.query(
      `INSERT INTO certificates (certificate_id, volunteer_id, service_id) VALUES ($1, $2, $3) RETURNING *`,
      [certId, realVolId, service_id]
    );
    res.json({ success: true, certificate: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/volunteers/me/certificates", async (req, res) => {
  try {
    const { volunteer_id } = req.query;
    const result = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 ORDER BY issue_date DESC`, [volunteer_id]);
    res.json({ success: true, certificates: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

app.get("/api/certificates/download/:id", async (req, res) => {
  try {
    const certId = req.params.id;
    const certRes = await pool.query(`SELECT * FROM certificates WHERE id = $1 OR certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found" });
    const cert = certRes.rows[0];

    const volRes = await pool.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];

    let sigs = { signatory_1_name: 'Rohit Pandit', signatory_1_designation: 'Founder', signatory_2_name: '', signatory_2_designation: '' };
    const sigRes = await pool.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [cert.service_id]);
    if (sigRes.rows.length > 0) sigs = sigRes.rows[0];

    // Create PDF Document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Draw Border
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: rgb(0.1, 0.3, 0.6), borderWidth: 4 });
    page.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderColor: rgb(0.8, 0.6, 0.2), borderWidth: 2 });

    // Draw Content
    page.drawText('RP FOUNDATION', { x: width / 2 - 120, y: height - 80, size: 30, font, color: rgb(0.1, 0.2, 0.5) });
    page.drawText('CERTIFICATE OF APPRECIATION', { x: width / 2 - 200, y: height - 140, size: 24, font, color: rgb(0.8, 0.6, 0.2) });
    
    page.drawText(`Certificate ID: ${cert.certificate_id}`, { x: 50, y: height - 80, size: 10, font: fontNormal });
    page.drawText(`Date: ${new Date(cert.issue_date).toLocaleDateString()}`, { x: width - 150, y: height - 80, size: 10, font: fontNormal });

    page.drawText('This is proudly presented to', { x: width / 2 - 100, y: height - 200, size: 14, font: fontItalic });
    
    // Name
    const nameWidth = font.widthOfTextAtSize(vol.full_name, 36);
    page.drawText(vol.full_name, { x: (width - nameWidth) / 2, y: height - 260, size: 36, font, color: rgb(0.1, 0.1, 0.1) });
    
    page.drawText(`Reg No: ${vol.registration_number} | ${vol.city}, ${vol.state}`, { x: width / 2 - 120, y: height - 290, size: 12, font: fontNormal });

    page.drawText(`In recognition of their outstanding contribution and dedication to the`, { x: width / 2 - 200, y: height - 340, size: 14, font: fontNormal });
    
    const serviceName = cert.service_id.replace(/-/g, ' ').toUpperCase() + " SERVICE";
    const svcWidth = font.widthOfTextAtSize(serviceName, 18);
    page.drawText(serviceName, { x: (width - svcWidth) / 2, y: height - 370, size: 18, font, color: rgb(0.1, 0.3, 0.6) });

    // Signatures
    page.drawLine({ start: { x: 100, y: 120 }, end: { x: 300, y: 120 }, thickness: 1, color: rgb(0,0,0) });
    page.drawText(sigs.signatory_1_name, { x: 110, y: 100, size: 12, font });
    page.drawText(sigs.signatory_1_designation, { x: 110, y: 85, size: 10, font: fontItalic, color: rgb(0.3, 0.3, 0.3) });

    if (sigs.signatory_2_name) {
      page.drawLine({ start: { x: width - 300, y: 120 }, end: { x: width - 100, y: 120 }, thickness: 1, color: rgb(0,0,0) });
      page.drawText(sigs.signatory_2_name, { x: width - 290, y: 100, size: 12, font });
      page.drawText(sigs.signatory_2_designation, { x: width - 290, y: 85, size: 10, font: fontItalic, color: rgb(0.3, 0.3, 0.3) });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${cert.certificate_id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------- END CERTIFICATE ENGINE ----------------
"""
content = content.replace('// WEBAUTHN ENDPOINTS', api_routes + '\n// WEBAUTHN ENDPOINTS')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected Certificate API into server.ts!")
