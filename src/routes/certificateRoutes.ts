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

export default router;
