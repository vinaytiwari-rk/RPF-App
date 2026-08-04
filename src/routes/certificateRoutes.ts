import express from 'express';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import path from 'path';

import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/certificates/verify/:certificate_id", async (req, res) => {
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

router.get("/api/certificates/download/:id", async (req, res) => {
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

    page.drawText('CERTIFICATE OF APPRECIATION', { x: width / 2 - 200, y: height - 160, size: 24, font, color: rgb(0.8, 0.6, 0.2) });
    
    page.drawText(`Certificate ID: ${cert.certificate_id}`, { x: 50, y: height - 80, size: 10, font: fontNormal });
    page.drawText(`Date: ${new Date(cert.issue_date).toLocaleDateString()}`, { x: width - 150, y: height - 80, size: 10, font: fontNormal });

    page.drawText('This is proudly presented to', { x: width / 2 - 100, y: height - 230, size: 14, font: fontItalic });
    
    // Name
    const nameWidth = font.widthOfTextAtSize(vol.full_name, 36);
    page.drawText(vol.full_name, { x: (width - nameWidth) / 2, y: height - 320, size: 36, font, color: rgb(0.1, 0.1, 0.1) });
    
    page.drawText(`Reg No: ${vol.registration_number} | ${vol.city}, ${vol.state}`, { x: width / 2 - 120, y: height - 320, size: 12, font: fontNormal });

    page.drawText(`In recognition of their outstanding contribution and dedication to the`, { x: width / 2 - 200, y: height - 400, size: 14, font: fontNormal });
    
    const serviceName = cert.service_id.replace(/-/g, ' ').toUpperCase() + " SERVICE";
    const svcWidth = font.widthOfTextAtSize(serviceName, 18);
    page.drawText(serviceName, { x: (width - svcWidth) / 2, y: height - 400, size: 18, font, color: rgb(0.1, 0.3, 0.6) });

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
