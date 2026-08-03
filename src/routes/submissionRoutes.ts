import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/submissions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp 
       FROM service_submissions_v2 
       ORDER BY timestamp DESC`
    );
    res.json({ submissions: result.rows });
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/submissions", async (req, res) => {
  try {
    let body = req.body;
    if (Array.isArray(body)) {
      body = body[0];
    }
    const { userId, citizenName, citizenPhone, serviceName, submissionData, status, latitude, longitude, timestamp } = body;
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO service_submissions_v2 
       (id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id`,
      [
        id,
        userId || "guest",
        serviceName,
        serviceName,
        citizenName || "Citizen",
        citizenPhone || "",
        typeof submissionData === 'object' ? JSON.stringify(submissionData) : (submissionData || '{}'),
        status || "pending",
        latitude || null,
        longitude || null,
        new Date().toISOString(),
        timestamp || new Date().toISOString()
      ]
    );
    // If it's a Women Safety SOS report, dispatch alert emails to saved emergency contacts
    if (serviceName === "Women Support") {
      try {
        const parsedData = JSON.parse(typeof submissionData === 'object' ? JSON.stringify(submissionData) : (submissionData || '{}'));
        if (parsedData.sosTriggered && Array.isArray(parsedData.designatedContacts)) {
          const emails = parsedData.designatedContacts.filter((c: string) => c.includes("@"));
          if (emails.length > 0) {
            const mapsUrl = parsedData.userLocation || "Location unavailable";
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 12px; max-width: 500px; margin: auto;">
                <h2 style="color: #dc2626; margin-top: 0;">
                  🚨 WOMEN EMERGENCY SOS ALERT
                </h2>
                <p style="font-size: 14px; color: #374151;">
                  An emergency SOS distress signal was triggered by <strong>${citizenName || "Citizen"}</strong> (Phone: ${citizenPhone || "N/A"}).
                </p>
                <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 15px; margin: 15px 0;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #991b1b;">Current Location:</p>
                  <a href="${mapsUrl}" target="_blank" style="background-color: #dc2626; color: white; padding: 10px 15px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    View Location on Google Maps
                  </a>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #7f1d1d;">${mapsUrl}</p>
                </div>
                <p style="font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                  Sent automatically by RPF Women Safety System. Time: ${new Date().toLocaleString()}
                </p>
              </div>
            `;

            await sendEmail({
              from: '"RPF Women Safety" <no-reply@appapi.therpfoundation.org>',
              to: emails,
              subject: `🚨 EMERGENCY: SOS Alert from ${citizenName || "Citizen"}`,
              html: emailHtml,
            });
            console.log("SOS email alert dispatched successfully to:", emails.join(", "));
          }
        }
      } catch (mailErr) {
        console.error("Failed to send SOS emails:", mailErr);
      }
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (err: any) {
    console.error("Error creating submission:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/submissions/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE service_submissions_v2 SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/submissions/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM service_submissions_v2 WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
