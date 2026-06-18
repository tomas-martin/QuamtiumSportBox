import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import classesRouter from './routes/classes.js';
import bookingsRouter from './routes/bookings.js';
import adminRouter from './routes/admin.js';
import profilesRouter from './routes/profiles.js';
import { authMiddleware } from './middleware/auth.js';
import { requireAdmin } from './middleware/requireAdmin.js';

const app = express();

// ── Security & middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://quamtium.vercel.app',
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'quamtium-api' }));

// ── Public routes ──────────────────────────────────────────────────────────
app.use('/api/classes', classesRouter);

// ── Authenticated routes ───────────────────────────────────────────────────
app.use('/api/bookings', authMiddleware, bookingsRouter);
app.use('/api/profiles', authMiddleware, profilesRouter);

// ── Admin routes ───────────────────────────────────────────────────────────
app.use('/api/admin', authMiddleware, requireAdmin, adminRouter);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

export default app;
