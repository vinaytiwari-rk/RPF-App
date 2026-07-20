// ============================================================================
// auth-utils.ts - JWT & Password Hashing Utilities
// ============================================================================
// Provides secure utilities for:
// - Password hashing with bcrypt
// - JWT token generation and verification
// - Session management
// ============================================================================

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_min_32_characters";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "24h";
const SESSION_TIMEOUT_MS = parseInt(process.env.SESSION_TIMEOUT_MS || "86400000"); // 24 hours

// Validate JWT_SECRET in production
if (process.env.NODE_ENV === "production" && JWT_SECRET.length < 32) {
  throw new Error(
    "❌ CRITICAL: JWT_SECRET must be at least 32 characters in production. Set it in .env"
  );
}

// ============================================================================
// TYPES
// ============================================================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: "citizen" | "volunteer" | "donor" | "admin" | "super_admin" | "guest";
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// PASSWORD HASHING
// ============================================================================

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (err) {
    throw new Error(`Password hashing failed: ${err}`);
  }
}

/**
 * Compare plain text password with bcrypt hash
 * @param password - Plain text password
 * @param hash - Bcrypt hash from database
 * @returns true if password matches, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error("Password comparison error:", err);
    return false;
  }
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" };
  }

  return { isValid: true };
}

// ============================================================================
// JWT TOKEN GENERATION
// ============================================================================

/**
 * Generate a JWT token
 * @param payload - Token payload
 * @returns JWT token string
 */
export function generateToken(payload: JWTPayload): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
      algorithm: "HS256",
    });
    return token;
  } catch (err) {
    throw new Error(`Token generation failed: ${err}`);
  }
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JWTPayload;
    return decoded;
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
}

/**
 * Decode token without verification (use with caution!)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload | null;
    return decoded;
  } catch (err) {
    console.error("Token decode error:", err);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * Format: "Bearer <token>"
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Calculate token expiration time
 * @returns Expiration timestamp (Date object)
 */
export function getTokenExpirationTime(): Date {
  // Parse JWT_EXPIRE format: "24h", "7d", "30m", etc.
  const expireStr = JWT_EXPIRE;
  const match = expireStr.match(/^(\d+)([hdmsy])$/);

  if (!match) {
    // Fallback to SESSION_TIMEOUT_MS
    return new Date(Date.now() + SESSION_TIMEOUT_MS);
  }

  const [, value, unit] = match;
  const num = parseInt(value);
  const now = Date.now();

  let expiresIn = 0;
  switch (unit) {
    case "s":
      expiresIn = num * 1000;
      break;
    case "m":
      expiresIn = num * 60 * 1000;
      break;
    case "h":
      expiresIn = num * 60 * 60 * 1000;
      break;
    case "d":
      expiresIn = num * 24 * 60 * 60 * 1000;
      break;
    case "y":
      expiresIn = num * 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      expiresIn = SESSION_TIMEOUT_MS;
  }

  return new Date(now + expiresIn);
}

/**
 * Check if a token is expired
 * @param expiresAt - Expiration timestamp from database
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validate email format
 * @param email - Email address
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// PHONE VALIDATION
// ============================================================================

/**
 * Validate Indian phone number format
 * @param phone - Phone number
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  // Indian phone numbers: 10 digits, starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
  getTokenExpirationTime,
  isTokenExpired,
  isValidEmail,
  isValidPhone,
};
