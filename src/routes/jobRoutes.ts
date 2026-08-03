import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt" FROM jobs ORDER BY "postedAt" DESC'
    );
    res.json({ jobs: result.rows });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/jobs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, locEn, locHi, salary, typeEn, typeHi, company } = req.body;
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO jobs 
       (id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`,
      [
        id,
        titleEn,
        titleHi,
        company,
        locEn,
        locHi,
        salary,
        typeEn,
        typeHi,
        new Date().toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/jobs/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/jobs/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi } = req.body;
    await pool.query(
      `UPDATE jobs SET 
       "titleEn" = $1, "titleHi" = $2, company = $3, "locEn" = $4, "locHi" = $5, 
       salary = $6, "typeEn" = $7, "typeHi" = $8 
       WHERE id = $9`,
      [titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/job_applications", async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, phone, resume } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO job_applications (id, "jobId", "jobTitle", "fullName", phone, resume, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, jobId, jobTitle, fullName, phone, resume || "", new Date().toISOString()]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving job application:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
