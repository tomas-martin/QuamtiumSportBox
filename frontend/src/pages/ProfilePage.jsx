import { useState } from 'react';
import { LogOut, User, Phone, Mail, Shield, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function ProfilePage() {
  const { profile, isAdmin, signOut, loadProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.profile.update({ phone });
      await loadProfile();
      toast.success('Perfil actualizado');
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="py-5 sm:py-6 animate-slide-up space-y-5 max-w-lg pb-safe-6">

      {/* ── Header ── */}
      <h1 className="text-4xl sm:text-5xl text-white leading-none">PERFIL</h1>

      {/* ── Avatar & name ── */}
      <div className="card flex items-center gap-5 py-5">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-neutral-700/50 flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-red-600/30 to-red-800/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-red-500/15">
            <span className="text-red-400 text-2xl font-black" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {initials}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-xl leading-tight truncate">
            {profile?.full_name || 'Usuario'}
          </p>
          {isAdmin && (
            <span className="badge bg-red-500/10 text-red-400 border-red-500/20 mt-1.5">
              <Shield size={10} /> Admin
            </span>
          )}
          {!isAdmin && (
            <span className="badge bg-neutral-800/60 text-neutral-500 border-neutral-700/40 mt-1.5">
              <User size={10} /> Miembro
            </span>
          )}
        </div>
      </div>

      {/* ── Info card ── */}
      <div className="card space-y-4">
        <h2 className="text-base font-black text-neutral-300 tracking-wide uppercase text-sm">Información</h2>

        <div className="divider" />

        {/* Email */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-800/60 flex items-center justify-center flex-shrink-0">
            <Mail size={14} className="text-neutral-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider mb-0.5">Email</p>
            <p className="text-sm text-neutral-300 truncate">{profile?.email || '—'}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Phone size={14} className="text-neutral-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider mb-0.5">Teléfono</p>
            {editing ? (
              <div className="space-y-2">
                <input
                  id="input-phone"
                  className="input text-sm"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej: +54 11 1234-5678"
                  type="tel"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    id="btn-save-phone"
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary text-xs py-2 flex-1 flex items-center justify-center gap-1.5"
                  >
                    <Check size={13} />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setPhone(profile?.phone || ''); }}
                    className="btn-ghost text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <X size={13} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-300">{profile?.phone || 'Sin teléfono'}</p>
                <button
                  id="btn-edit-phone"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors font-semibold"
                >
                  <Edit2 size={11} /> Editar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sign out ── */}
      <button
        id="btn-sign-out"
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full flex items-center justify-center gap-2 btn-danger py-3 disabled:opacity-50"
      >
        <LogOut size={16} />
        {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>
    </div>
  );
}
