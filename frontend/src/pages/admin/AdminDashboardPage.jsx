import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarDays, BookMarked, ChevronRight, PlusCircle } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Usuarios', value: stats?.total_users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Clases próximas', value: stats?.upcoming_classes, icon: CalendarDays, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Reservas activas', value: stats?.active_bookings, icon: BookMarked, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="px-4 py-5 animate-slide-up space-y-6">
      <div>
        <p className="text-neutral-400 text-sm">Panel de</p>
        <h1 className="text-4xl text-white">ADMINISTRACIÓN</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card text-center p-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} className={color} />
            </div>
            <p className={`text-2xl font-bold ${loading ? 'text-neutral-700' : 'text-white'}`}>
              {loading ? '—' : value ?? 0}
            </p>
            <p className="text-neutral-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-xl text-white">Acciones rápidas</h2>

        <Link to="/admin/classes" className="card flex items-center gap-3 hover:border-neutral-700 transition-colors">
          <div className="w-10 h-10 bg-red-600/15 rounded-xl flex items-center justify-center">
            <CalendarDays size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Gestionar clases</p>
            <p className="text-neutral-500 text-xs">Crear, editar y cancelar clases</p>
          </div>
          <ChevronRight size={16} className="text-neutral-600" />
        </Link>

        <Link to="/admin/users" className="card flex items-center gap-3 hover:border-neutral-700 transition-colors">
          <div className="w-10 h-10 bg-blue-600/15 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Usuarios</p>
            <p className="text-neutral-500 text-xs">Ver miembros y gestionar roles</p>
          </div>
          <ChevronRight size={16} className="text-neutral-600" />
        </Link>
      </div>
    </div>
  );
}
