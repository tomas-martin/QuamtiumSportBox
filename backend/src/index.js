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
import { supabaseAdmin } from './lib/supabase.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security & middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

async function seedDatabase() {
  try {
    // 1. Verificar/sembrar profesores
    const { data: instructors, error } = await supabaseAdmin
      .from('instructors')
      .select('id, name');
    
    if (error) {
      console.warn('⚠️ No se pudieron consultar los profesores (¿Base de datos desconectada?):', error.message);
      return;
    }

    if (!instructors || instructors.length === 0) {
      console.log('🌱 Base de datos sin profesores. Sembrando Lucas y Martín...');
      const { error: insertError } = await supabaseAdmin
        .from('instructors')
        .insert([
          { name: 'Lucas', bio: 'Entrenador principal y especialista en Boxeo/Funcional' },
          { name: 'Martín', bio: 'Preparador físico y especialista en Fuerza' }
        ]);
      if (insertError) throw insertError;
      console.log('✅ Profesores sembrados con éxito.');
    }

    // 2. Verificar/sembrar actividad por defecto
    const { data: activities, error: actError } = await supabaseAdmin
      .from('activity_types')
      .select('id');
    
    if (actError) {
      console.warn('⚠️ No se pudieron consultar las actividades:', actError.message);
    } else if (!activities || activities.length === 0) {
      console.log('🌱 Base de datos sin actividades. Sembrando actividad por defecto...');
      const { error: insertActError } = await supabaseAdmin
        .from('activity_types')
        .insert([
          { name: 'Entrenamiento', color: '#ef4444', icon: 'dumbbell', duration_minutes: 60 }
        ]);
      if (insertActError) throw insertActError;
      console.log('✅ Actividad por defecto sembrada.');
    }
  } catch (err) {
    console.error('❌ Error al sembrar base de datos:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`🥊 Quamtium API corriendo en puerto ${PORT}`);
  seedDatabase();
});
