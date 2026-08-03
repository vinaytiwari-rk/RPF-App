import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/community_posts", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM community_posts ORDER BY "createdAt" DESC');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/community_posts", async (req, res) => {
  try {
    const { authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO community_posts (id, "authorName", "authorPhone", "authorRole", "textEn", "textHi", segment, location, "imageUrl", likes, "likedByMe", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/api/community_posts/:id", async (req, res) => {
  try {
    const { likes, likedByMe } = req.body;
    await pool.query('UPDATE community_posts SET likes = $1, "likedByMe" = $2 WHERE id = $3', [likes, likedByMe, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/blogs", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs WHERE approved = true ORDER BY "publishedAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/blogs/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY "createdAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/blogs", authenticateToken, async (req: any, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, error: "Title and Content are required" });
    const id = crypto.randomUUID();
    
    // Author name & ID from request token user
    const authorName = req.user.displayName || req.user.name || "Anonymous Volunteer";
    const authorId = req.user.id;

    await pool.query(
      `INSERT INTO blogs (id, title, content, "authorName", "authorId", approved, "createdAt") VALUES ($1, $2, $3, $4, $5, false, NOW())`,
      [id, title, content, authorName, authorId]
    );
    res.json({ success: true, message: "Blog post submitted for admin approval" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/api/blogs/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE blogs SET approved = true, "publishedAt" = NOW() WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: "Blog approved successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/blogs/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM blogs WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: "Blog deleted/rejected successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/social", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt" FROM social_posts ORDER BY "createdAt" DESC'
    );
    res.json({ posts: result.rows });
  } catch (error: any) {
    console.error("Error fetching social posts:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/social", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO social_posts 
       (id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, false, $8, $9, $10)`,
      [
        id,
        author,
        role,
        avatar || "",
        textEn,
        textHi,
        image || "",
        platform || "instagram",
        link || "",
        new Date().toISOString()
      ]
    );
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error creating social post:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/social/like", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await pool.query('SELECT liked, likes FROM social_posts WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const post = result.rows[0];
      const liked = !post.liked;
      const likes = liked ? post.likes + 1 : Math.max(0, post.likes - 1);
      await pool.query('UPDATE social_posts SET liked = $1, likes = $2 WHERE id = $3', [liked, likes, id]);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error: any) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/social/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM social_posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/social/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    await pool.query(
      `UPDATE social_posts SET 
       author = $1, role = $2, avatar = $3, "textEn" = $4, "textHi" = $5, 
       image = $6, platform = $7, link = $8 
       WHERE id = $9`,
      [author, role, avatar, textEn, textHi, image, platform, link, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
