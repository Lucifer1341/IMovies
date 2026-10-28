import dotenv from 'dotenv';
dotenv.config();

const required = ['JWT_SECRET', 'MONGODB_URI'];

export function validateEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(`[Config] Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_imovies',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminSeedEmail: process.env.ADMIN_SEED_EMAIL || 'admin@imovies.dev',
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD || 'Admin@12345!',
  holdDurationMinutes: parseInt(process.env.HOLD_DURATION_MINUTES || '5', 10),
  isProd: process.env.NODE_ENV === 'production',
};
