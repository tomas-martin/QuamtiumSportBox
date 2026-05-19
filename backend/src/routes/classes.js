import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/classes
// Devuelve clases con cupos disponibles. Opcionalmente filtra por semana.
router.get('/', async (req, res, next) => {
  try {
    const { from, to, activity_type_id } = req.query;

    let query = supabaseAdmin
      .from('classes_with_stats')
      .select('*')
      .order('starts_at', { ascending: true });

    if (from) query = query.gte('starts_at', from);
    if (to) query = query.lte('starts_at', to);
    if (activity_type_id) query = query.eq('activity_type_id', activity_type_id);

    // Por defecto solo clases futuras (desde hoy)
    if (!from) query = query.gte('starts_at', new Date().toISOString());

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/classes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('classes_with_stats')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Clase no encontrada' });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/classes/activity-types — tipos de actividades activas
router.get('/meta/activity-types', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/classes/:id/attendees — solo para admins (auth requerida)
router.get('/:id/attendees', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('id, status, created_at, profiles(id, full_name, email, phone, avatar_url)')
      .eq('class_schedule_id', req.params.id)
      .eq('status', 'confirmed')
      .order('created_at');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
