import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/index.js';

async function updateAdmin() {
  await mongoose.connect(config.mongoUri);
  const hash = await bcrypt.hash('Admin@12345!', 12);
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@imovies.dev' },
    { $set: { passwordHash: hash, status: 'active', role: 'admin' } }
  );
  console.log('Admin passwordHash set successfully');
  await mongoose.disconnect();
}

updateAdmin().catch(console.error);
