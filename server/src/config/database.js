import mongoose from 'mongoose';
import { config } from './index.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Live connection failed (${err.message}). Activating safe memory datastore mode.`);
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Error: ${err.message}`);
});
