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
  adminName: process.env.ADMIN_NAME || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  trustProxy: process.env.TRUST_PROXY === '1',
};
