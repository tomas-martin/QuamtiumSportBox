import { supabaseAdmin } from '../lib/supabase.js';

export async function requireAdmin(req, res, next) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de admin' });
  }

  next();
}
