// Simple bearer-token gate for the /api/admin/* surface.
// Real product would gate on a JWT containing an admin/instructor role
// (see authService.js) - this token is the demo's stand-in so a
// misconfigured proxy or a leaked URL doesn't let anyone overwrite the
// video catalogue.
import { env } from '../config/env.js';
import { fail } from '../utils/response.js';

// Constant-time compare to avoid leaking token length.
import crypto from 'node:crypto';

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function requireAdmin(req, res, next) {
  if (!env.adminToken) {
    // Fail closed: in any env where ADMIN_TOKEN was somehow lost, never
    // accept admin requests. This prevents a redeploy with a missing
    // secret from silently allowing admin access.
    return fail(res, 503, 'ADMIN_DISABLED', 'Admin endpoints are disabled (ADMIN_TOKEN not configured)');
  }

  const header = (req.get('x-admin-key') || '').trim();
  if (!header || !safeEqual(header, env.adminToken)) {
    return fail(res, 401, 'UNAUTHORIZED', 'Missing or invalid X-Admin-Key');
  }

  next();
}

// Rate limiters. Tuned for the demo:
//   - admin: 30 req/min per IP, generous but stops scripted scraping
//   - auth: 10 req/15min per IP, anti-brute-force for login/register
import rateLimit from 'express-rate-limit';

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Slow down.' } },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts. Try again later.' } },
});
