import express from 'express';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import path from 'path';

import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs';

const router = express.Router();

router.get("/api/certificates/verify/:certificate_id", async (req, res) => {
  try {
    const certId = req.params.certificate_id;
    const certRes = await pool.query(`SELECT * FROM certificates WHERE certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found or invalid." });
    
    const cert = certRes.rows[0];
    const volRes = await pool.query(`SELECT full_name, registration_number, city FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];

    res.json({
      success: true,
      data: {
        certificate_id: cert.certificate_id,
        volunteer_name: vol.full_name,
        registration_number: vol.registration_number,
        service_name: cert.title,
        issue_date: cert.issue_date,
        location: vol.city || ""
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/certificates/download/:id", authenticateToken, async (req: any, res) => {
  try {
    const certId = req.params.id;
    const certRes = await pool.query(`SELECT * FROM certificates WHERE id = $1 OR certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found" });
    const cert = certRes.rows[0];
    if (String(cert.volunteer_id) !== String(req.user.id) && !["admin","super_admin","superadmin"].includes(req.user.role)) return res.status(403).json({ error: "You are not authorized to download this certificate." });

    const volRes = await pool.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];

    let sigs = { signatory_1_name: "Rohit Pandit", signatory_1_designation: "Founder, RP Foundation", signatory_2_name: "", signatory_2_designation: "" };
    try {
      const sigRes = await pool.query(`SELECT signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation FROM service_signatures WHERE service_id = $1 LIMIT 1`, [cert.certificate_id]);
      if (sigRes.rows.length > 0) sigs = { ...sigs, ...sigRes.rows[0] };
    } catch { /* certificate remains downloadable even if optional signature config is unavailable */ }

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
    const logoCandidates = [path.join(process.cwd(), 'public', 'assets', 'logo.png'), path.join(process.cwd(), 'public', 'assets', 'rpf-samahit-icon.png')];
    const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
    if (logoPath) {
      const logoImageBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      const logoDims = logoImage.scale(0.15); // Scale down logo
      page.drawImage(logoImage, {
        x: width / 2 - logoDims.width / 2,
        y: height - logoDims.height - 35,
        width: logoDims.width,
        height: logoDims.height,
      });
    }

    page.drawText('RP FOUNDATION SOCIAL WELFARE TRUST', { x: width / 2 - 190, y: height - 120, size: 24, font, color: rgb(0.08, 0.35, 0.24) });
    const certTitle = String(cert.title || 'Certificate of Appreciation');
    const titleWidth = font.widthOfTextAtSize(certTitle, 22);
    page.drawText(certTitle, { x: (width - titleWidth) / 2, y: height - 160, size: 22, font, color: rgb(0.75, 0.43, 0.05) });
    
    page.drawText(`Certificate ID: ${cert.certificate_id}`, { x: 50, y: height - 80, size: 10, font: fontNormal });
    page.drawText(`Date: ${new Date(cert.issue_date).toLocaleDateString()}`, { x: width - 150, y: height - 80, size: 10, font: fontNormal });

    page.drawText('This is proudly presented to', { x: width / 2 - 100, y: height - 230, size: 14, font: fontItalic });
    
    // Name
    const nameWidth = font.widthOfTextAtSize(vol.full_name, 36);
    page.drawText(vol.full_name, { x: (width - nameWidth) / 2, y: height - 320, size: 36, font, color: rgb(0.1, 0.1, 0.1) });
    
    const regLine = vol.registration_number ? `Volunteer No: ${vol.registration_number}` : 'Verified Volunteer Record';
    const regWidth = fontNormal.widthOfTextAtSize(regLine, 12);
    page.drawText(regLine, { x: (width - regWidth) / 2, y: height - 350, size: 12, font: fontNormal, color: rgb(0.35, 0.4, 0.45) });

    const serviceName = String(cert.title || 'Community Service').toUpperCase();
    const svcWidth = font.widthOfTextAtSize(serviceName, 16);
    page.drawText(serviceName, { x: (width - svcWidth) / 2, y: height - 400, size: 16, font, color: rgb(0.08, 0.35, 0.24) });
    page.drawText(`Verified Certificate ID: ${cert.certificate_id}`, { x: width / 2 - 145, y: 55, size: 9, font: fontNormal, color: rgb(0.35, 0.4, 0.45) });

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

// =============================================================================
// SAMAHIT ONLINE TEST CERTIFICATES API
// =============================================================================

async function ensureTestCertificatesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_certificates (
        id VARCHAR(255) PRIMARY KEY,
        certificate_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        duration_minutes INT NOT NULL,
        total_questions INT NOT NULL,
        correct_count INT NOT NULL,
        score_percentage INT NOT NULL,
        grade VARCHAR(10) NOT NULL,
        category_breakdown JSONB,
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_test_certificates_user_id ON test_certificates(user_id);
      CREATE INDEX IF NOT EXISTS idx_test_certificates_cert_id ON test_certificates(certificate_id);
    `);
  } catch (err: any) {
    console.warn("Could not ensure test_certificates table:", err.message);
  }
}

// Ensure table exists on first route load
let testCertTableEnsured = false;
router.use(async (_req, _res, next) => {
  if (!testCertTableEnsured) {
    await ensureTestCertificatesTable();
    testCertTableEnsured = true;
  }
  next();
});

// Save completed test certificate
router.post("/api/test-certificates/save", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      candidate_name,
      duration_minutes,
      total_questions,
      correct_count,
      score_percentage,
      grade,
      category_breakdown,
      certificate_id: customCertId
    } = req.body;

    const name = String(candidate_name || req.user.name || "Candidate").trim();
    const duration = Number(duration_minutes || 10);
    const totalQ = Number(total_questions || 25);
    const correctQ = Number(correct_count || 0);
    const scorePct = Number(score_percentage || 0);
    const gradeVal = String(grade || "B").trim();

    const certId =
      customCertId ||
      `RPF-TEST-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const id = crypto.randomUUID();

    const result = await pool.query(
      `INSERT INTO test_certificates
       (id, certificate_id, user_id, candidate_name, duration_minutes, total_questions, correct_count, score_percentage, grade, category_breakdown, issue_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (certificate_id) DO UPDATE SET
         score_percentage = EXCLUDED.score_percentage,
         correct_count = EXCLUDED.correct_count,
         grade = EXCLUDED.grade
       RETURNING *`,
      [
        id,
        certId,
        userId,
        name,
        duration,
        totalQ,
        correctQ,
        scorePct,
        gradeVal,
        JSON.stringify(category_breakdown || {})
      ]
    );

    // Also insert into generic certificates table for cross-module display
    try {
      await pool.query(
        `INSERT INTO certificates
         (id, certificate_id, volunteer_id, title, title_hi, recipient_name, role, duty_hours, issue_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (certificate_id) DO NOTHING`,
        [
          crypto.randomUUID(),
          certId,
          userId,
          "Online Test Assessment Certificate",
          "ऑनलाइन टेस्ट मूल्यांकन प्रमाणपत्र",
          name,
          "Student",
          Math.round(duration / 60)
        ]
      );
    } catch {
      // Safe fallback if certificates table has stricter constraint
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err: any) {
    console.error("Failed to save test certificate:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch all test certificates of current authenticated user
router.get("/api/test-certificates/my", authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM test_certificates WHERE user_id = $1 ORDER BY issue_date DESC`,
      [req.user.id]
    );
    res.json({
      success: true,
      certificates: result.rows
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch test certificate details by certificate ID with ownership check
router.get("/api/test-certificates/:certificate_id", authenticateToken, async (req: any, res) => {
  try {
    const certId = req.params.certificate_id;
    const result = await pool.query(
      `SELECT * FROM test_certificates WHERE certificate_id = $1 OR id = $1`,
      [certId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Certificate not found" });
    }
    const cert = result.rows[0];
    if (
      String(cert.user_id) !== String(req.user.id) &&
      !["admin", "super_admin", "superadmin"].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, error: "Access denied: Unauthorized certificate access" });
    }
    res.json({ success: true, certificate: cert });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download Official PDF Certificate for SAMAHIT Online Test
router.get("/api/test-certificates/download/:certificate_id", authenticateToken, async (req: any, res) => {
  try {
    const certId = req.params.certificate_id;
    const result = await pool.query(
      `SELECT * FROM test_certificates WHERE certificate_id = $1 OR id = $1`,
      [certId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Certificate not found" });
    }

    const cert = result.rows[0];
    if (
      String(cert.user_id) !== String(req.user.id) &&
      !["admin", "super_admin", "superadmin"].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, error: "Unauthorized download access" });
    }

    // Build PDF strictly following official guidelines:
    // [Official RP Foundation Logo at the top]
    // Organization name: exactly "RP Foundation"
    // "CERTIFICATE OF ACHIEVEMENT"
    // "This certificate is awarded to"
    // [Candidate Name]
    // "for completing the online test and achieving the following result."
    // Grade: [Calculated Grade]
    // Percentage: [Actual Percentage]%
    // "Online Test through Samahit App" (the ONLY place Samahit appears)
    // Certificate ID: [Unique Certificate ID]
    // Date: [Test Date]

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Decorative Dual Borders (Emerald & Gold)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.14, 0.36, 0.27), // #245D45 Emerald
      borderWidth: 4
    });
    page.drawRectangle({
      x: 26,
      y: 26,
      width: width - 52,
      height: height - 52,
      borderColor: rgb(0.85, 0.65, 0.13), // Gold border
      borderWidth: 1.5
    });

    // Top Logo
    const logoCandidates = [
      path.join(process.cwd(), "public", "assets", "logo.png"),
      path.join(process.cwd(), "public", "assets", "rpf-samahit-icon.png")
    ];
    const logoPath = logoCandidates.find((c) => fs.existsSync(c));
    if (logoPath) {
      try {
        const logoBytes = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoScale = 0.14;
        const logoDims = logoImage.scale(logoScale);
        page.drawImage(logoImage, {
          x: (width - logoDims.width) / 2,
          y: height - logoDims.height - 35,
          width: logoDims.width,
          height: logoDims.height
        });
      } catch {
        // Continue if logo embedding has any format issue
      }
    }

    // Exact Organization Name: "RP Foundation"
    const orgName = "RP Foundation";
    const orgWidth = fontBold.widthOfTextAtSize(orgName, 26);
    page.drawText(orgName, {
      x: (width - orgWidth) / 2,
      y: height - 120,
      size: 26,
      font: fontBold,
      color: rgb(0.14, 0.36, 0.27) // Emerald
    });

    // Certificate Title: "CERTIFICATE OF ACHIEVEMENT"
    const title = "CERTIFICATE OF ACHIEVEMENT";
    const titleWidth = fontBold.widthOfTextAtSize(title, 20);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: height - 155,
      size: 20,
      font: fontBold,
      color: rgb(0.8, 0.5, 0.05) // Gold/Amber
    });

    // Thin decorative line
    page.drawLine({
      start: { x: width / 2 - 140, y: height - 168 },
      end: { x: width / 2 + 140, y: height - 168 },
      thickness: 1,
      color: rgb(0.85, 0.65, 0.13)
    });

    // Subtitle Line
    const subtitle = "This certificate is awarded to";
    const subWidth = fontOblique.widthOfTextAtSize(subtitle, 14);
    page.drawText(subtitle, {
      x: (width - subWidth) / 2,
      y: height - 210,
      size: 14,
      font: fontOblique,
      color: rgb(0.3, 0.3, 0.3)
    });

    // Candidate Name
    const candidateName = String(cert.candidate_name || "Candidate").toUpperCase();
    const nameWidth = fontBold.widthOfTextAtSize(candidateName, 30);
    page.drawText(candidateName, {
      x: (width - nameWidth) / 2,
      y: height - 260,
      size: 30,
      font: fontBold,
      color: rgb(0.08, 0.15, 0.25)
    });

    // Explanation Line
    const expl = "for completing the online test and achieving the following result.";
    const explWidth = fontNormal.widthOfTextAtSize(expl, 13);
    page.drawText(expl, {
      x: (width - explWidth) / 2,
      y: height - 295,
      size: 13,
      font: fontNormal,
      color: rgb(0.35, 0.35, 0.35)
    });

    // Result Badges Box
    const scoreBoxY = height - 375;
    page.drawRectangle({
      x: width / 2 - 160,
      y: scoreBoxY,
      width: 320,
      height: 55,
      color: rgb(0.95, 0.98, 0.96),
      borderColor: rgb(0.7, 0.85, 0.75),
      borderWidth: 1
    });

    const gradeText = `Grade: ${cert.grade}`;
    const pctText = `Percentage: ${cert.score_percentage}%`;
    const scoreText = `${gradeText}    |    ${pctText}`;
    const scoreTextWidth = fontBold.widthOfTextAtSize(scoreText, 16);
    page.drawText(scoreText, {
      x: (width - scoreTextWidth) / 2,
      y: scoreBoxY + 30,
      size: 16,
      font: fontBold,
      color: rgb(0.14, 0.36, 0.27)
    });

    const detailText = `Correct: ${cert.correct_count} of ${cert.total_questions} Questions (${cert.duration_minutes} Mins)`;
    const detailWidth = fontNormal.widthOfTextAtSize(detailText, 11);
    page.drawText(detailText, {
      x: (width - detailWidth) / 2,
      y: scoreBoxY + 12,
      size: 11,
      font: fontNormal,
      color: rgb(0.4, 0.45, 0.4)
    });

    // Required App Attribution: "Online Test through Samahit App"
    const appLine = "Online Test through Samahit App";
    const appLineWidth = fontNormal.widthOfTextAtSize(appLine, 12);
    page.drawText(appLine, {
      x: (width - appLineWidth) / 2,
      y: height - 425,
      size: 12,
      font: fontNormal,
      color: rgb(0.2, 0.4, 0.3)
    });

    // Bottom Metadata: Certificate ID & Date
    const certIdLine = `Certificate ID: ${cert.certificate_id}`;
    page.drawText(certIdLine, {
      x: 50,
      y: 50,
      size: 10,
      font: fontNormal,
      color: rgb(0.4, 0.4, 0.4)
    });

    const issueDate = new Date(cert.issue_date || Date.now()).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const dateLine = `Date: ${issueDate}`;
    const dateLineWidth = fontNormal.widthOfTextAtSize(dateLine, 10);
    page.drawText(dateLine, {
      x: width - dateLineWidth - 50,
      y: 50,
      size: 10,
      font: fontNormal,
      color: rgb(0.4, 0.4, 0.4)
    });

    // Verification Seal Note
    const verifyNote = "Verified Digital Certificate • RP Foundation";
    const verifyWidth = fontNormal.widthOfTextAtSize(verifyNote, 9);
    page.drawText(verifyNote, {
      x: (width - verifyWidth) / 2,
      y: 35,
      size: 9,
      font: fontNormal,
      color: rgb(0.5, 0.5, 0.5)
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=RP_Foundation_Certificate_${cert.certificate_id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error("PDF download error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verification endpoint for QR or public lookup
router.get("/api/test-certificates/verify/:certificate_id", async (req, res) => {
  try {
    const certId = req.params.certificate_id;
    const result = await pool.query(
      `SELECT certificate_id, candidate_name, duration_minutes, total_questions, score_percentage, grade, issue_date
       FROM test_certificates WHERE certificate_id = $1`,
      [certId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Invalid or non-existent certificate ID" });
    }
    res.json({
      success: true,
      data: result.rows[0],
      organization: "RP Foundation",
      issuedThrough: "Samahit App"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

