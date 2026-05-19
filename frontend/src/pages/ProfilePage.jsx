import { useState } from 'react';
import { LogOut, User, Phone, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function ProfilePage() {
  const { profile, isAdmin, signOut, loadProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="px-4 py-5 animate-slide-up space-y-5">
      <h1 className="text-4xl text-white">PERFIL</h1>

      {/* Avatar & name */}
      <div className="card flex items-center gap-4">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center">
            <User size={28} className="text-red-400" />
          </div>
        )}
        <div>
          <p className="font-bold text-white text-lg leading-tight">{profile?.full_name || 'Usuario'}</p>
          {isAdmin && (
            <span className="badge bg-red-500/15 text-red-400 mt-1">
              <Shield size={10} /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="card space-y-4">
        <h2 className="text-lg text-white">Información</h2>

        <div className="flex items-center gap-3">
          <Mail size={16} className="text-neutral-500 flex-shrink-0" />
          <p className="text-sm text-neutral-300">{profile?.email}</p>
        </div>

        <div className="flex items-start gap-3">
          <Phone size={16} className="text-neutral-500 flex-shrink-0 mt-0.5" />
          {editing ? (
            <div className="flex-1 space-y-2">
              <input
                className="input text-sm"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
                type="tel"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-1.5 flex-1">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost text-sm py-1.5 flex-1">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <p className="text-sm text-neutral-300">{profile?.phone || 'Sin teléfono'}</p>
              <button onClick={() => setEditing(true)} className="text-xs text-red-400 hover:text-red-300">
                Editar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 btn-ghost text-red-400 hover:text-red-300 py-3"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  );
}
