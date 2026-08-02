import dotenv from 'dotenv';

dotenv.config();

// Safe debugging — prints only whether variables exist, not their values.
console.log('[ENV CHECK]', {
  NODE_ENV: process.env.NODE_ENV,
  PORT_EXISTS: Boolean(process.env.PORT),
  MONGODB_URI_EXISTS: Boolean(process.env.MONGODB_URI),
  JWT_SECRET_EXISTS: Boolean(process.env.JWT_SECRET),
  ADMIN_TOKEN_EXISTS: Boolean(process.env.ADMIN_TOKEN),
});

const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_TOKEN) {
  throw new Error('Missing required env var: ADMIN_TOKEN');
}

if (!process.env.ADMIN_TOKEN && process.env.NODE_ENV !== 'production') {
  console.warn(
    '[server] WARNING: ADMIN_TOKEN is not set. Admin endpoints are reachable with no auth (dev-only).'
  );
}

// IMPORTANT: db.js and index.js import this.
export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim()),
  adminToken: process.env.ADMIN_TOKEN || '',
  trustProxy: process.env.TRUST_PROXY === '1',
};