import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

import { sendEmail } from './src/lib/mailer';
import { apiCache, CACHE_TTL } from './src/lib/apiCache';
import { queryExternalSearch } from './src/lib/externalSearch';
import { getGeminiClient, handleOfflineFallback } from './src/lib/gemini';
import { socialPreviewsCache, SOCIAL_CACHE_TTL } from './src/lib/socialCache';
import { resolveConstituency, loadACGeoJson, loadACGeoJsonAsync } from './src/lib/constituency';
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
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from "./src/db/middleware.js";
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

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: "Too many requests from this IP, please try again after 15 minutes" },
});

app.use("/api/auth", limiter);