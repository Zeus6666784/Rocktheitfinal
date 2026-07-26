// Mongoose connect. Cap pool to 10 to stay inside Atlas free-tier connection budget.
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });
  return mongoose.connection;
}
