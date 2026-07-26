// Parse + validate env vars. Keep small — fail fast on boot if anything required is missing.
import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    // ponytail: crash at boot over a missing secret; this is the trust boundary.
    throw new Error(`Missing required env var: ${key}`);
  }
}

// ADMIN_TOKEN is required outside development. In dev we tolerate the
// miss so the demo still boots, but we always warn loudly. In production
// the admin endpoints are wired but will reject every request without it.
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_TOKEN) {
  throw new Error('Missing required env var: ADMIN_TOKEN');
}
if (!process.env.ADMIN_TOKEN && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn('[server] WARNING: ADMIN_TOKEN is not set. Admin endpoints are reachable with no auth (dev-only).');
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim()),
  adminToken: process.env.ADMIN_TOKEN || '',
  trustProxy: process.env.TRUST_PROXY === '1',
};
