import { useState, useEffect } from 'react';
import { Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsersPage() {
  const { profile: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.admin.users();
      setUsers(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleRole(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`¿Cambiar a ${user.full_name} a rol "${newRole}"?`)) return;
    try {
      await api.admin.setUserRole(user.id, newRole);
      toast.success('Rol actualizado');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="px-4 py-5 animate-slide-up">
      <h1 className="text-4xl text-white mb-5">USUARIOS</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-neutral-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="card flex items-center gap-3">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt={u.full_name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-neutral-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-neutral-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white truncate">{u.full_name || 'Sin nombre'}</p>
                  {u.role === 'admin' && <Shield size={12} className="text-red-400 flex-shrink-0" />}
                </div>
                <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {u.bookings?.length || 0} reservas · Desde {format(new Date(u.created_at), "MMM yyyy", { locale: es })}
                </p>
              </div>

              {u.id !== me?.id && (
                <button
                  onClick={() => toggleRole(u)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    u.role === 'admin'
                      ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {u.role === 'admin' ? 'Admin' : 'User'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
