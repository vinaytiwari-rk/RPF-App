import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

router.post("/api/ai/chat", async (req, res) => {
  const { message, history = [], language = "hi" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Try GEMINI_API_KEY first, fallback to GOOGLE_SEARCH_API_KEY
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;

  if (!apiKey || apiKey === "MOCK_KEY") {
    return handleOfflineFallback(message, language, res);
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are "RP Foundation AI Mitr" (आरपी फाउंडेशन एआई मित्र), a friendly and general-purpose AI assistant.
You can answer any general questions, solve math problems, write text, explain concepts, or translate languages just like Gemini, ChatGPT, or Grok, while maintaining your identity as RP AI Mitr.
When asked about RP Foundation, guide them about its initiatives (Jan Seva Card, blood donation, volunteer opportunities, government schemes).
Always match the user's language preference (Hindi, English, or Hinglish) and keep responses clear, concise, and helpful.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `System instruction: ${systemPrompt}` }] },
        ...history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    });

    const replyText = response.text || "Sorry, I am unable to process that right now.";
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Gemini Chat Error, falling back:", error);
    // Graceful fallback if Gemini API call fails due to invalid key restrictions
    return handleOfflineFallback(message, language, res);
  }
});

router.post("/api/ai/categorize", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const safeCatDefault = {
    category: "Uncategorized",
    urgency: "Pending Review",
    summary: title ? title.substring(0, 50) + "..." : "Complaint under review"
  };

  if (!apiKey) {
    console.warn("AI Categorization skipped: No GEMINI_API_KEY provided.");
    return res.json(safeCatDefault);
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an auto-triage AI for RP Foundation's Grievance Redressal system. Your task is to categorize citizens' complaints.
Analyze the following title and description of a complaint, and return a JSON object with:
1. "category": strictly one of ["Water Supply", "Roads & Transit", "Sanitation & Waste", "Education & Schools", "Healthcare Facilities", "Street Lights & Power", "Others"]
2. "urgency": strictly one of ["Low", "Medium", "High", "Critical"]
3. "summary": a single compact summary line (in Hindi if complaint is in Hindi, otherwise English).

Complaint Title: "${title}"
Complaint Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            urgency: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["category", "urgency", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("AI Categorization Error:", error);
    res.json(safeCatDefault);
  }
});

router.post("/api/ai/scheme-match", async (req, res) => {
  const { age, gender, annualIncome, occupation, state, category } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  const safeSchemeDefault = { schemes: [] };

  if (!apiKey) {
    console.warn("AI Scheme Match skipped: No GEMINI_API_KEY provided.");
    return res.json(safeSchemeDefault);
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Formulate custom recommended Indian Government Schemes or RP Foundation scholarships for a citizen with the following details:
- Age: ${age}
- Gender: ${gender}
- Annual Income: ₹${annualIncome}
- Occupation: ${occupation}
- State: ${state}
- Social Category/Work: ${category}

Respond with a JSON array of up to 3 highly tailored schemes. Each scheme should contain:
1. "name" (Scheme/Scholarship name in Bilingual format e.g. "Ayushman Bharat / आयुष्मान भारत")
2. "eligibility" (Why they are eligible)
3. "benefits" (Key benefits)
4. "steps" (Simple steps to apply)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              eligibility: { type: Type.STRING },
              benefits: { type: Type.STRING },
              steps: { type: Type.STRING }
            },
            required: ["name", "eligibility", "benefits", "steps"]
          }
        }
      }
    });

    const schemes = JSON.parse(response.text || "[]");
    res.json({ schemes });
  } catch (error: any) {
    console.error("Scheme Matcher Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze schemes" });
  }
});

export default router;
