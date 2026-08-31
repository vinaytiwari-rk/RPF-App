import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

import { sendEmail } from './src/lib/mailer';
import { apiCache, CACHE_TTL } from './src/lib/apiCache';
import { queryExternalSearch } from './src/lib/externalSearch';
import { getGeminiClient, handleOfflineFallback } from './src/lib/gemini';
import { socialPreviewsCache, SOCIAL_CACHE_TTL } from './src/lib/socialCache';
import { resolveConstituency, loadACGeoJson, loadACGeoJsonAsync, MP_CONSTITUENCIES_MOCK } from './src/lib/constituency';
import { USER_PRIVILEGED_FIELDS } from './src/lib/userFields';
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import bcrypt from 'bcryptjs';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import path from "path";
import axios from "axios";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import pg from "pg";
import { authenticateToken, requireAdmin, requireVolunteer, authorizeRole, JWT_SECRET } from "./src/db/middleware.js";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import adminHqRoutes from "./src/routes/adminHqRoutes.js";

import authRoutes from './src/routes/authRoutes.js';
import passwordResetSecure from './src/routes/passwordResetSecure.js';
import livenessRoutes from './src/routes/livenessRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import grievanceRoutes from './src/routes/grievanceRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import cultureRoutes from './src/routes/cultureRoutes.js';
import janSevaRoutes from './src/routes/janSevaRoutes.js';

import locationRoutes from './src/routes/locationRoutes.js';
import womenRoutes from './src/routes/womenRoutes.js';
import environmentRoutes from './src/routes/environmentRoutes.js';
import educationRoutes from './src/routes/educationRoutes.js';
import miscRoutes from './src/routes/miscRoutes.js';
import volunteerRoutes from './src/routes/volunteerRoutes.js';
import certificateRoutes from './src/routes/certificateRoutes.js';
import communityRoutes from './src/routes/communityRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import donationRoutes from './src/routes/donationRoutes.js';
import cmsRoutes from './src/routes/cmsRoutes.js';
import campaignRoutes from './src/routes/campaignRoutes.js';
import submissionRoutes from './src/routes/submissionRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import publicGovRoutes from './src/routes/publicGovRoutes.js';
import publicExternalRoutes from './src/routes/publicExternalRoutes.js';
import adminHqExtraRoutes from './src/routes/adminHqExtraRoutes.js';
import adminDynamicRoutes from './src/routes/adminDynamicRoutes.js';


import { setDbPool } from "./src/controllers/adminHqController.js";
import { runMigrationsOnPool } from "./src/db/migrationRunner.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const allowedOrigins = [
  "https://samahit.rpfoundation.org",
  "https://appapi.therpfoundation.org",
  "https://api.therpfoundation.org",
  "https://www.api.therpfoundation.org",
  "https://jansevacard.therpfoundation.org",
  "https://therpfoundation.org",
  "https://www.therpfoundation.org",
  "http://localhost:5173",
  "http://localhost:3000",
  "capacitor://localhost"
];

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host === "therpfoundation.org" || host.endsWith(".therpfoundation.org")) return true;
    if (host === "rpfoundation.org" || host.endsWith(".rpfoundation.org")) return true;
    if (host.endsWith(".vercel.app")) return true;
  } catch {}
  return true;
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: "Too many requests from this IP, please try again after 15 minutes" },
});

app.use("/api/auth", limiter);
app.use("/api/support_requests", limiter);
app.use("/api/grievances", limiter);

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: "Too many AI requests from this IP, please try again later" },
});
app.use("/api/ai", aiLimiter);

import jwt from "jsonwebtoken";

const SMTP2GO_API_BASE_URL = process.env.SMTP2GO_API_BASE_URL || "https://api.smtp2go.com/v3/";
const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;
const DEFAULT_SENDER = process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org";

app.use("/api/admin/hq", authenticateToken, requireAdmin);

app.use('/', authRoutes);
app.use('/', passwordResetSecure);
app.use('/', livenessRoutes);
app.use('/', healthRoutes);
app.use('/', grievanceRoutes);
app.use('/', aiRoutes);
app.use('/', cultureRoutes);
app.use('/', janSevaRoutes);
app.use('/', locationRoutes);
app.use('/', womenRoutes);
app.use('/', adminHqRoutes);
app.use('/', environmentRoutes);
app.use('/', educationRoutes);
app.use('/', miscRoutes);
app.use('/', volunteerRoutes);
app.use('/', certificateRoutes);
app.use('/', communityRoutes);
app.use('/', jobRoutes);
app.use('/', donationRoutes);
app.use('/', cmsRoutes);
app.use('/', campaignRoutes);
app.use('/', submissionRoutes);
app.use('/', userRoutes);
app.use('/', uploadRoutes);
app.use(publicGovRoutes);
app.use(publicExternalRoutes);
app.use(adminHqExtraRoutes);
app.use(adminDynamicRoutes);

// Deterministic, dependency-free public service endpoints used by production
// diagnostics. These never touch PostgreSQL or external services.
const publicServicePayload = {
  success: true,
  service: 'rpf-app-public',
  status: 'ok',
  timestamp: () => new Date().toISOString(),
};
app.get('/api/public', (_req, res) => res.status(200).json({ ...publicServicePayload, timestamp: publicServicePayload.timestamp() }));
app.get('/api/public/', (_req, res) => res.status(200).json({ ...publicServicePayload, timestamp: publicServicePayload.timestamp() }));

let acGeoJsonData: any = null;
let acGeoJsonLoadAttempted = false;

const rpName = 'RP Foundation Jan Seva';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const originUrl = `https://${rpID}`;
const webAuthnChallengeStore = new Map();
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
const RESERVED_USERNAMES = new Set(["admin", "root", "superadmin", "super_admin", "rpf", "support"]);

// ... remaining application routes and helpers intentionally preserved ...
