import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import { config, validateEnv } from './config/index.js';
import { connectDB, isDbConnected } from './config/database.js';
import { seedMemoryStore } from './config/memoryStore.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import cinemaRoutes from './routes/cinemas.js';
import showRoutes from './routes/shows.js';
import holdRoutes from './routes/holds.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import ticketRoutes from './routes/tickets.js';
import promotionRoutes from './routes/promotions.js';
import adminRoutes from './routes/admin.js';

validateEnv();

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});

app.locals.io = io;

// ── Security Middleware ─────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost dev origins or null (curl/tests)
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      callback(null, origin === config.clientUrl);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(config.cookieSecret));

if (config.nodeEnv !== 'test') {
  app.use(morgan(config.isProd ? 'combined' : 'dev'));
}

// ── Health Check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    database: isDbConnected() ? 'connected (MongoDB)' : 'memory_fallback_active',
  });
});

// ── API Routes ───────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/holds', holdRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/admin', adminRoutes);

// ── Socket.IO Real-Time Seat Updates ────────────────
io.on('connection', (socket) => {
  socket.on('join-show', (showId) => {
    socket.join(`show:${showId}`);
  });

  socket.on('leave-show', (showId) => {
    socket.leave(`show:${showId}`);
  });

  socket.on('seat-state-changed', ({ showId, seatLabels, state }) => {
    socket.to(`show:${showId}`).emit('seat-update', { seatLabels, state });
  });
});

// ── Error Handling ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Startup ─────────────────────────────────────────
const start = async () => {
  await connectDB();
  await seedMemoryStore(config);

  if (process.env.VERCEL !== '1') {
    server.listen(config.port, () => {
      console.log(`[Server] IMovies API running on http://localhost:${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
      console.log(`[Server] Storage Mode: ${isDbConnected() ? 'MongoDB Server' : 'Resilient In-Memory Datastore'}`);
    });
  }
};

start();

export default app;
export { app, server, io };
