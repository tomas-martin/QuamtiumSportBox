import { useState } from 'react';
import { Clock, Users, UserRound } from 'lucide-react';
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
    <div className={`card hover:border-neutral-700/80 hover:bg-neutral-900/60 transition-all duration-300 ${cls.is_cancelled ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-base leading-tight tracking-wide uppercase truncate">
            {cls.title}
          </p>
          {cls.instructor_name && (
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs mt-1.5 font-medium">
              <UserRound size={12} className="text-red-500" />
              <span>Prof. {cls.instructor_name}</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {cls.is_cancelled ? (
            <span className="badge bg-neutral-800/80 text-neutral-400 border-neutral-700/50">Cancelada</span>
          ) : isBooked ? (
            <span className="badge bg-green-500/10 text-green-400 border-green-500/20">Reservado</span>
          ) : isFull ? (
            <span className="badge bg-red-500/10 text-red-400 border-red-500/20">Completo</span>
          ) : null}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-800/50 my-3" />

      {/* Meta & Action */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={13} className="text-neutral-500" />
            <span className="capitalize">{dayLabel} · {format(date, 'HH:mm')} hs</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Users size={13} className="text-neutral-500" />
            {isFull && !isBooked ? (
              <span className="text-red-400 font-bold">Sin cupos</span>
            ) : (
              <span>{cls.available_spots} de {cls.max_capacity} cupos</span>
            )}
          </span>
        </div>

        {/* Action Button */}
        {!isPast && !cls.is_cancelled && !isBooked && (
          <button
            onClick={handleBook}
            disabled={isFull || loading}
            className="btn-primary text-xs py-2 px-4 flex-shrink-0"
          >
            {loading ? 'Reservando...' : 'Reservar'}
          </button>
        )}
      </div>
    </div>
  );
}
