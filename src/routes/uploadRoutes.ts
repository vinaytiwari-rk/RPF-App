import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.post("/api/upload/founder", authenticateToken, requireAdmin, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Founder image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/upload/broadcast", authenticateToken, requireAdmin, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Broadcast image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/upload/image", authenticateToken, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Generic image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/profile/upload-dp", authenticateToken, upload.single("file"), handleUploadErrors, async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    const userId = req.user.id;
    
    await pool.query(`UPDATE users SET avatar = $1 WHERE id = $2`, [fileUrl, userId]);
    await pool.query(`UPDATE volunteers SET avatar = $1 WHERE id = $2`, [fileUrl, userId]);
    
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload DP failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/profile/upload-cover", authenticateToken, upload.single("file"), handleUploadErrors, async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    const userId = req.user.id;
    
    await pool.query(`UPDATE users SET cover = $1 WHERE id = $2`, [fileUrl, userId]);
    await pool.query(`UPDATE volunteers SET cover = $1 WHERE id = $2`, [fileUrl, userId]);
    
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Upload cover failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/profile/remove-dp", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    await pool.query(`UPDATE users SET avatar = NULL WHERE id = $1`, [userId]);
    await pool.query(`UPDATE volunteers SET avatar = NULL WHERE id = $1`, [userId]);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Remove DP failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/profile/remove-cover", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    await pool.query(`UPDATE users SET cover = NULL WHERE id = $1`, [userId]);
    await pool.query(`UPDATE volunteers SET cover = NULL WHERE id = $1`, [userId]);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Remove cover failed:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
