import { useState, useEffect } from 'react';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookMarked, Clock, X, UserRound, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

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
    <div className="py-6 animate-slide-up space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-4xl sm:text-5xl text-white leading-none">MIS TURNOS</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {upcoming.length > 0 ? `${upcoming.length} turno${upcoming.length > 1 ? 's' : ''} próximo${upcoming.length > 1 ? 's' : ''}` : 'Sin turnos próximos'}
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-1 max-w-xs">
        {[['upcoming', 'Próximos', upcoming.length], ['past', 'Historial', past.length]].map(([key, label, count]) => (
          <button
            key={key}
            id={`tab-${key}`}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              tab === key
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-950/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-black ${
                tab === key ? 'bg-white/20' : 'bg-neutral-800'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-neutral-900/40 border border-neutral-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="card text-center py-16 flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center">
            {tab === 'upcoming'
              ? <CalendarCheck className="text-neutral-600" size={22} />
              : <BookMarked className="text-neutral-600" size={22} />
            }
          </div>
          <div>
            <p className="text-neutral-300 font-semibold text-sm">
              {tab === 'upcoming' ? 'No tenés turnos próximos' : 'Sin historial aún'}
            </p>
            <p className="text-neutral-600 text-xs mt-1">
              {tab === 'upcoming' ? 'Reservá una clase desde la agenda.' : 'Tus turnos pasados aparecerán aquí.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    confirmed: { label: 'Confirmado', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled:  { label: 'Cancelado',  cls: 'bg-neutral-800/80 text-neutral-400 border-neutral-700/50' },
    attended:   { label: 'Asistido',   cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  };
  const { label, cls: statusCls } = statusConfig[booking.status] || statusConfig.confirmed;

  async function doCancel() {
    setCancelling(true);
    await onCancel(booking.id);
    setCancelling(false);
  }

  return (
    <div className="card flex gap-4 items-center hover:border-neutral-700/60 hover:bg-neutral-900/60 transition-all duration-200">
      {/* Color accent */}
      <div className="w-1 self-stretch rounded-full bg-red-600/60 flex-shrink-0" />

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-white text-sm leading-tight tracking-wide uppercase truncate">{cls.title}</p>
          <span className={`badge flex-shrink-0 ${statusCls}`}>{label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={11} />
            <span className="capitalize">{format(date, "EEEE d/MM · HH:mm'hs'", { locale: es })}</span>
          </span>
          {cls.instructors?.name && (
            <span className="flex items-center gap-1 font-medium">
              <UserRound size={11} className="text-red-500/70" />
              <span>Prof. {cls.instructors.name}</span>
            </span>
          )}
        </div>
      </div>

      {showCancel && (
        <button
          id={`btn-cancel-${booking.id}`}
          onClick={doCancel}
          disabled={cancelling}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/40 hover:bg-red-950/20 hover:text-red-400 text-neutral-600 transition-all duration-200 disabled:opacity-40"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
