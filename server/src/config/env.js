import dotenv from 'dotenv';

dotenv.config();

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