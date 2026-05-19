import { useState, useEffect } from 'react';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookMarked, Clock, X } from 'lucide-react';
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
    try {
      await api.bookings.cancel(id);
      toast.success('Reserva cancelada');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="px-4 py-5 animate-slide-up">
      <h1 className="text-4xl text-white mb-5">MIS TURNOS</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-neutral-900 rounded-xl p-1">
        {[['upcoming', 'Próximos'], ['past', 'Historial']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === key ? 'bg-red-600 text-white' : 'text-neutral-400'
            }`}
          >
            {label} {key === 'upcoming' && upcoming.length > 0 && `(${upcoming.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-neutral-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : shown.length === 0 ? (
        <div className="card text-center py-12">
          <BookMarked className="mx-auto text-neutral-600 mb-3" size={32} />
          <p className="text-neutral-400 text-sm">
            {tab === 'upcoming' ? 'No tenés turnos próximos' : 'No hay historial aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
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
  const color = cls.activity_types?.color || '#ef4444';

  const statusConfig = {
    confirmed: { label: 'Confirmado', classes: 'bg-green-500/15 text-green-400' },
    cancelled: { label: 'Cancelado', classes: 'bg-neutral-700 text-neutral-400' },
    attended: { label: 'Asistido', classes: 'bg-blue-500/15 text-blue-400' },
  };

  const { label, classes: statusCls } = statusConfig[booking.status] || statusConfig.confirmed;

  async function doCancel() {
    setCancelling(true);
    await onCancel(booking.id);
    setCancelling(false);
  }

  return (
    <div className="card flex gap-3 items-start">
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-white text-sm leading-tight">{cls.title}</p>
          <span className={`badge flex-shrink-0 ${statusCls}`}>{label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Clock size={11} />
          <span className="capitalize">{format(date, "EEEE d/MM · HH:mm'hs'", { locale: es })}</span>
        </div>
        {cls.instructors?.name && (
          <p className="text-xs text-neutral-500">Prof. {cls.instructors.name}</p>
        )}
      </div>
      {showCancel && (
        <button
          onClick={doCancel}
          disabled={cancelling}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-red-900/30 hover:text-red-400 text-neutral-500 transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
