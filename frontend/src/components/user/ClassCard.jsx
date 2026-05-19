import { useState } from 'react';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function ClassCard({ cls, onBooked, bookedClassIds = [] }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const isBooked = bookedClassIds.includes(cls.id);
  const isFull = cls.available_spots <= 0;
  const isPast = new Date(cls.starts_at) < new Date();

  const date = new Date(cls.starts_at);
  const dayLabel = isToday(date) ? 'Hoy' : isTomorrow(date) ? 'Mañana' : format(date, "EEE d/M", { locale: es });

  async function handleBook() {
    if (!user) return;
    setLoading(true);
    try {
      await api.bookings.create(cls.id);
      toast.success('¡Turno reservado!');
      onBooked?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: cls.activity_color || '#ef4444' }}
          />
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight truncate">{cls.title}</p>
            {cls.instructor_name && (
              <p className="text-neutral-500 text-xs mt-0.5">Prof. {cls.instructor_name}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        {cls.is_cancelled ? (
          <span className="badge bg-neutral-800 text-neutral-400 flex-shrink-0">Cancelada</span>
        ) : isBooked ? (
          <span className="badge bg-green-500/15 text-green-400 flex-shrink-0">Reservada</span>
        ) : isFull ? (
          <span className="badge bg-red-500/15 text-red-400 flex-shrink-0">Sin cupos</span>
        ) : null}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          <span className="capitalize">{dayLabel} · {format(date, 'HH:mm')}hs</span>
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {isFull ? (
            <span className="text-red-400">Completo</span>
          ) : (
            <span>{cls.available_spots} cupos</span>
          )}
        </span>
      </div>

      {/* Action */}
      {!isPast && !cls.is_cancelled && !isBooked && (
        <button
          onClick={handleBook}
          disabled={isFull || loading}
          className="btn-primary w-full text-sm py-2"
        >
          {loading ? 'Reservando...' : isFull ? 'Sin cupos' : 'Reservar turno'}
        </button>
      )}
    </div>
  );
}
