import { useState, useEffect } from 'react';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookMarked, Clock, X, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming'); // upcoming | past

  async function load() {
    setLoading(true);
    try {
      const data = await api.bookings.mine();
      setBookings(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const now = new Date();
  const upcoming = bookings.filter(b =>
    b.status === 'confirmed' && isAfter(new Date(b.class_schedules?.starts_at), now)
  );
  const past = bookings.filter(b =>
    b.status !== 'confirmed' || !isAfter(new Date(b.class_schedules?.starts_at), now)
  );

  const shown = tab === 'upcoming' ? upcoming : past;

  async function handleCancel(id) {
    if (!confirm('¿Seguro que querés cancelar tu turno?')) return;
    try {
      await api.bookings.cancel(id);
      toast.success('Reserva cancelada');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="px-4 py-5 animate-slide-up space-y-6">
      <h1 className="text-4xl text-white">MIS TURNOS</h1>

      {/* Tabs */}
      <div className="flex gap-2 bg-neutral-900/60 backdrop-blur-md border border-neutral-900 rounded-xl p-1 max-w-md">
        {[['upcoming', 'Próximos'], ['past', 'Historial']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
              tab === key
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-950/20'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {label} {key === 'upcoming' && upcoming.length > 0 && `(${upcoming.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-neutral-900/40 border border-neutral-800/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : shown.length === 0 ? (
        <div className="card text-center py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center">
            <BookMarked className="text-neutral-600" size={22} />
          </div>
          <p className="text-neutral-500 text-sm">
            {tab === 'upcoming' ? 'No tenés turnos próximos programados.' : 'No hay historial de turnos aún.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {shown.map(b => (
            <BookingCard key={b.id} booking={b} onCancel={handleCancel} showCancel={tab === 'upcoming'} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, onCancel, showCancel }) {
  const [cancelling, setCancelling] = useState(false);
  const cls = booking.class_schedules;
  if (!cls) return null;

  const date = new Date(cls.starts_at);

  const statusConfig = {
    confirmed: { label: 'Confirmado', classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled: { label: 'Cancelado', classes: 'bg-neutral-800/80 text-neutral-400 border-neutral-700/50' },
    attended: { label: 'Asistido', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  };

  const { label, classes: statusCls } = statusConfig[booking.status] || statusConfig.confirmed;

  async function doCancel() {
    setCancelling(true);
    await onCancel(booking.id);
    setCancelling(false);
  }

  return (
    <div className="card flex gap-4 items-start hover:border-neutral-700/80 hover:bg-neutral-900/60 transition-all duration-300">
      <div className="w-1 self-stretch rounded-full bg-red-600 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold text-white text-base leading-tight tracking-wide uppercase truncate">{cls.title}</p>
          <span className={`badge flex-shrink-0 ${statusCls}`}>{label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={12} className="text-neutral-500" />
            <span className="capitalize">{format(date, "EEEE d/MM · HH:mm'hs'", { locale: es })}</span>
          </span>
          {cls.instructors?.name && (
            <span className="flex items-center gap-1 font-medium text-neutral-500">
              <UserRound size={12} className="text-red-500" />
              <span>Prof. {cls.instructors.name}</span>
            </span>
          )}
        </div>
      </div>
      {showCancel && (
        <button
          onClick={doCancel}
          disabled={cancelling}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-850 hover:border-red-500/30 hover:bg-red-950/20 hover:text-red-400 text-neutral-500 transition-all duration-300"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
