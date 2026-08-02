import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  console.log('[DB] Starting MongoDB connection...');

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log('[DB] MongoDB connected successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('[DB] MongoDB connection FAILED');
    console.error(err);
    throw err;
  }
}