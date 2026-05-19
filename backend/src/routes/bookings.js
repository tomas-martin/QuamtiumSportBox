import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// GET /api/bookings/my — reservas del usuario autenticado
router.get('/my', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id, status, created_at,
        class_schedules (
          id, title, starts_at, ends_at,
          activity_types (name, color, icon),
          instructors (name, avatar_url)
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings — reservar una clase
router.post('/', async (req, res, next) => {
  try {
    const { class_schedule_id } = req.body;
    if (!class_schedule_id) {
      return res.status(400).json({ error: 'class_schedule_id es requerido' });
    }

    // Verificar que la clase existe, no está cancelada y tiene cupos
    const { data: cls, error: clsErr } = await supabaseAdmin
      .from('classes_with_stats')
      .select('id, starts_at, is_cancelled, available_spots, title')
      .eq('id', class_schedule_id)
      .single();

    if (clsErr || !cls) return res.status(404).json({ error: 'Clase no encontrada' });
    if (cls.is_cancelled) return res.status(409).json({ error: 'Esta clase fue cancelada' });
    if (new Date(cls.starts_at) < new Date()) {
      return res.status(409).json({ error: 'No podés reservar una clase que ya comenzó' });
    }
    if (cls.available_spots <= 0) {
      return res.status(409).json({ error: 'No hay cupos disponibles en esta clase' });
    }

    // Insertar reserva
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({ user_id: req.user.id, class_schedule_id })
      .select()
      .single();

    if (error) {
      // Unique constraint => ya tiene reserva
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ya tenés una reserva para esta clase' });
      }
      throw error;
    }

    res.status(201).json({ message: `Reserva confirmada para "${cls.title}"`, booking: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookings/:id — cancelar reserva propia
router.delete('/:id', async (req, res, next) => {
  try {
    // Verificar que la reserva pertenece al usuario
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('bookings')
      .select('id, user_id, class_schedule_id, class_schedules(starts_at)')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !booking) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (booking.user_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

    // No cancelar si la clase arranca en menos de 1 hora
    const startsAt = new Date(booking.class_schedules.starts_at);
    const now = new Date();
    const diffMs = startsAt - now;
    if (diffMs < 60 * 60 * 1000) {
      return res.status(409).json({ error: 'No podés cancelar con menos de 1 hora de anticipación' });
    }

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Reserva cancelada correctamente' });
  } catch (err) {
    next(err);
  }
});

export default router;
