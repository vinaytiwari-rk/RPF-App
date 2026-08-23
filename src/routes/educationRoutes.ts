import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken } from '../db/middleware.js';

const router = express.Router();

// Education content must come from the database. No demo courses are seeded or returned.
router.get('/api/edu/courses', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY views DESC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// A test/question bank has not been connected to a verified content source yet.
// Do not expose fabricated questions as real educational material.
router.get('/api/edu/tests/questions', async (_req, res) => {
  res.status(503).json({ success: false, error: 'Verified test question bank is not available.' });
});

// Test scores are accepted only when a verified question bank exists; the old
// mock_test_scores flow has been retired rather than presenting demo tests as real.
router.post('/api/edu/tests/submit', authenticateToken, async (_req, res) => {
  res.status(410).json({ success: false, error: 'Demo test submission has been retired. A verified test system is required.' });
});

router.get('/api/edu/tests/scores', authenticateToken, async (_req, res) => {
  res.json({ success: true, data: [] });
});

// Digital library content must come from the database. No sample books are returned.
router.get('/api/edu/library', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM library_books ORDER BY views DESC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
