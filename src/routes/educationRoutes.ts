import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken } from '../db/middleware.js';
import crypto from 'crypto';

const router = express.Router();

// Mock Initial Data for Demonstration
const MOCK_COURSES = [
  { id: "c1", title: "Introduction to Digital Literacy", category: "Technology", instructor: "Govt. IT Initiative", youtube_id: "7_eM0_tF6xM", duration: "1.5 Hours", views: 1205 },
  { id: "c2", title: "Financial Independence for Women", category: "Finance", instructor: "State Bank Literacy Program", youtube_id: "L1_N3R6a1fU", duration: "2 Hours", views: 3400 },
  { id: "c3", title: "Agriculture Best Practices 2026", category: "Agriculture", instructor: "Kisan Suvidha", youtube_id: "5B-G2mUfHkI", duration: "45 Mins", views: 980 }
];

const MOCK_QUESTIONS = [
  { id: 1, text: "What is the capital of Madhya Pradesh?", options: ["Indore", "Bhopal", "Gwalior", "Jabalpur"], answer: 1 },
  { id: 2, text: "Which gas is primarily responsible for the greenhouse effect?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], answer: 1 },
  { id: 3, text: "Who was the first woman Prime Minister of India?", options: ["Indira Gandhi", "Sarojini Naidu", "Pratibha Patil", "Sushma Swaraj"], answer: 0 }
];

const MOCK_BOOKS = [
  { id: "b1", title: "The Discovery of India", author: "Jawaharlal Nehru", category: "History", content: "The Discovery of India was written by India's first Prime Minister Jawaharlal Nehru during his imprisonment in 1942–1945... (This is a short sample text for demonstration of the digital reader). It gives a broad view of Indian history, philosophy and culture." },
  { id: "b2", title: "Godan (The Gift of a Cow)", author: "Munshi Premchand", category: "Literature", content: "Godan is a famous Hindi novel by Munshi Premchand, first published in 1936. The story revolves around the socio-economic deprivation as well as the exploitation of the village poor... (This is a short sample text for demonstration)." }
];

// --- COURSES (UNACADEMY CLONE) ---
router.get("/api/edu/courses", async (req: any, res: any) => {
  try {
    const result = await pool.query("SELECT * FROM courses ORDER BY views DESC");
    let courses = result.rows;
    if (courses.length === 0) {
      courses = MOCK_COURSES; // Use mock if DB is empty
    }
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- MOCK TESTS (TESTBOOK CLONE) ---
router.get("/api/edu/tests/questions", async (req: any, res: any) => {
  res.json({ success: true, data: MOCK_QUESTIONS });
});

router.post("/api/edu/tests/submit", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { category, score, total } = req.body;
    
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO mock_test_scores (id, user_id, test_category, score, total) VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, category, score, total]
    );

    res.json({ success: true, message: "Score saved successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch user scores
router.get("/api/edu/tests/scores", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM mock_test_scores WHERE user_id = $1 ORDER BY date_taken DESC", [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- DIGITAL LIBRARY (WATTPAD/MOON+ CLONE) ---
router.get("/api/edu/library", async (req: any, res: any) => {
  try {
    const result = await pool.query("SELECT * FROM library_books ORDER BY views DESC");
    let books = result.rows;
    if (books.length === 0) {
      books = MOCK_BOOKS;
    }
    res.json({ success: true, data: books });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
