import express from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin } from '../db/middleware.js';
import crypto from 'crypto';
import multer from 'multer';

import path from 'path';
import fs_node from 'fs';

// Uploaded files are stored on local disk, so an authenticated client could
// otherwise exhaust storage by repeatedly uploading 5MB files.
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many file uploads. Please try again later.' },
});

// Setup multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const handleUploadErrors = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

const saveFileLocally = async (file: Express.Multer.File): Promise<string> => {
  const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
  const filename = crypto.randomUUID() + ext;
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs_node.existsSync(uploadDir)) {
    fs_node.mkdirSync(uploadDir, { recursive: true });
  }
  const filepath = path.join(uploadDir, filename);
  fs_node.writeFileSync(filepath, file.buffer);
  return '/uploads/' + filename;
};

const router = express.Router();

router.post("/api/upload/founder", authenticateToken, requireAdmin, uploadLimiter, upload.single("file"), handleUploadErrors, async (req, res) => {
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

router.post("/api/upload/broadcast", authenticateToken, requireAdmin, uploadLimiter, upload.single("file"), handleUploadErrors, async (req, res) => {
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

router.post("/api/upload/image", authenticateToken, uploadLimiter, upload.single("file"), handleUploadErrors, async (req, res) => {
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

router.post("/api/profile/upload-dp", authenticateToken, uploadLimiter, upload.single("file"), handleUploadErrors, async (req: any, res) => {
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

router.post("/api/profile/upload-cover", authenticateToken, uploadLimiter, upload.single("file"), handleUploadErrors, async (req: any, res) => {
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
