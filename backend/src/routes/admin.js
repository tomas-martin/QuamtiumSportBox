import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// ── Clases ─────────────────────────────────────────────────────────────────

// POST /api/admin/classes — crear clase
router.post('/classes', async (req, res, next) => {
  try {
    const { activity_type_id, instructor_id, title, description, starts_at, ends_at, max_capacity } = req.body;

    if (!activity_type_id || !title || !starts_at || !ends_at) {
      return res.status(400).json({ error: 'Faltan campos requeridos: activity_type_id, title, starts_at, ends_at' });
    }

    const { data, error } = await supabaseAdmin
      .from('class_schedules')
      .insert({ activity_type_id, instructor_id, title, description, starts_at, ends_at, max_capacity, created_by: req.user.id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/classes/:id — editar clase
router.patch('/classes/:id', async (req, res, next) => {
  try {
    const allowed = ['activity_type_id', 'instructor_id', 'title', 'description', 'starts_at', 'ends_at', 'max_capacity'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const { data, error } = await supabaseAdmin
      .from('class_schedules')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/classes/:id/cancel — cancelar clase
router.post('/classes/:id/cancel', async (req, res, next) => {
  try {
    const { cancel_reason } = req.body;

    const { data, error } = await supabaseAdmin
      .from('class_schedules')
      .update({ is_cancelled: true, cancel_reason })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Clase cancelada', class: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/classes/:id — eliminar clase
router.delete('/classes/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('class_schedules')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Clase eliminada' });
  } catch (err) {
    next(err);
  }
});

// ── Tipos de actividades ───────────────────────────────────────────────────

router.post('/activity-types', async (req, res, next) => {
  try {
    const { name, description, color, icon, duration_minutes } = req.body;
    const { data, error } = await supabaseAdmin
      .from('activity_types')
      .insert({ name, description, color, icon, duration_minutes })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/activity-types/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_types')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ── Instructores ───────────────────────────────────────────────────────────

router.get('/instructors', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('instructors').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/instructors', async (req, res, next) => {
  try {
    const { name, bio, avatar_url } = req.body;
    const { data, error } = await supabaseAdmin
      .from('instructors')
      .insert({ name, bio, avatar_url })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// ── Usuarios ───────────────────────────────────────────────────────────────

// GET /api/admin/users — listado de usuarios con sus reservas
router.get('/users', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, bookings(id, status)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/role — cambiar rol de usuario
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats — métricas generales
router.get('/stats', async (_req, res, next) => {
  try {
    const [usersRes, classesRes, bookingsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('class_schedules').select('id', { count: 'exact', head: true }).eq('is_cancelled', false).gte('starts_at', new Date().toISOString()),
      supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    ]);

    res.json({
      total_users: usersRes.count ?? 0,
      upcoming_classes: classesRes.count ?? 0,
      active_bookings: bookingsRes.count ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/bookings/:id/status — marcar asistencia
router.patch('/bookings/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'attended'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
