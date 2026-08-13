import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../db/dbPool.js';
import { sendEmail } from '../lib/mailer';

const router = express.Router();

const RESET_TTL_MINUTES = 15;
const RESET_TTL_SQL = `${RESET_TTL_MINUTES} minutes`;

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function genericResetResponse(res: express.Response) {
  return res.json({
    success: true,
    message: 'If the account exists and has a registered email address, a password reset link has been sent.'
  });
}

/**
 * Secure password-reset request flow.
 * Raw reset tokens are never persisted; only SHA-256 hashes are stored.
 */
router.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const identifier = typeof req.body?.identifier === 'string' ? req.body.identifier.trim() : '';
    if (!identifier) return genericResetResponse(res);

    const result = await pool.query(
      `SELECT id, email
         FROM volunteers
        WHERE mobile = $1
           OR LOWER(email) = LOWER($1)
           OR LOWER(username) = LOWER($1)
           OR LOWER(registration_number) = LOWER($1)
        LIMIT 1`,
      [identifier]
    );

    // Do not reveal whether the account exists.
    if (result.rows.length === 0 || !result.rows[0].email) return genericResetResponse(res);

    const user = result.rows[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
    const requestIp = req.ip || null;
    const userAgent = req.get('user-agent') || null;

    // Invalidate previous active reset tokens for this account before issuing a new one.
    await pool.query(
      `UPDATE password_reset_tokens
          SET used_at = NOW()
        WHERE user_id = $1
          AND used_at IS NULL`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO password_reset_tokens
        (user_id, token_hash, expires_at, request_ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, tokenHash, expiresAt.toISOString(), requestIp, userAgent]
    );

    const publicAppUrl = process.env.PUBLIC_APP_URL?.trim();
    if (!publicAppUrl) {
      throw new Error('PUBLIC_APP_URL must be configured for password reset emails.');
    }

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click here to reset your password: ${publicAppUrl}/reset-password?token=${encodeURIComponent(rawToken)}`,
    });

    return genericResetResponse(res);
  } catch (err: any) {
    console.error('Password reset request failed:', err);
    // Keep the response generic so account existence is not disclosed.
    return genericResetResponse(res);
  }
});

/**
 * Secure password-reset completion flow.
 * The submitted raw token is hashed in memory and compared with token_hash.
 */
router.post('/api/auth/set-password', async (req, res) => {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    const password = req.body?.password;

    if (!token || typeof password !== 'string') {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const tokenHash = hashResetToken(token);

    const tokenRes = await pool.query(
      `SELECT id, user_id
         FROM password_reset_tokens
        WHERE token_hash = $1
          AND used_at IS NULL
          AND expires_at > NOW()
        LIMIT 1`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const resetToken = tokenRes.rows[0];
    const passwordHash = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE volunteers
            SET password_hash = $1
          WHERE id = $2
        RETURNING id`,
        [passwordHash, resetToken.user_id]
      );

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }

      // Consume this token and invalidate all other reset tokens for the account.
      const consumed = await client.query(
        `UPDATE password_reset_tokens
            SET used_at = NOW()
          WHERE user_id = $1
            AND used_at IS NULL
            AND (id = $2 OR expires_at <= NOW() OR token_hash = $3)
          RETURNING id`,
        [resetToken.user_id, resetToken.id, tokenHash]
      );

      if (consumed.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Password reset invalidates existing authenticated sessions for the account.
      await client.query('DELETE FROM sessions WHERE user_id = $1', [resetToken.user_id]);

      await client.query('COMMIT');
    } catch (transactionError) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Password reset completion failed:', err);
    return res.status(500).json({ error: 'Unable to reset password right now. Please try again.' });
  }
});

export default router;
