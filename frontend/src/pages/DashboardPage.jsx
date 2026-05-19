import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import ClassCard from '../components/user/ClassCard';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [classes, bookings] = await Promise.all([
          api.classes.list({ limit: 5 }),
          api.bookings.mine(),
        ]);
        setUpcomingClasses(classes.slice(0, 4));
        setMyBookings(bookings.filter(b => b.status === 'confirmed').slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'Atleta';

  return (
    <div className="px-4 py-5 space-y-6 animate-slide-up">
      {/* Greeting */}
      <div>
        <p className="text-neutral-400 text-sm">Hola,</p>
        <h1 className="text-4xl text-white">{firstName.toUpperCase()}</h1>
      </div>

      {/* Próximas reservas */}
      {myBookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl text-white">Tus próximos turnos</h2>
            <Link to="/my-bookings" className="text-red-400 text-sm flex items-center gap-0.5">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {myBookings.map(b => (
              <UpcomingBookingCard key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}

      {/* Clases disponibles */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl text-white">Clases disponibles</h2>
          <Link to="/schedule" className="text-red-400 text-sm flex items-center gap-0.5">
            Ver todas <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-neutral-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : upcomingClasses.length === 0 ? (
          <div className="card text-center py-8">
            <CalendarDays className="mx-auto text-neutral-600 mb-3" size={32} />
            <p className="text-neutral-400 text-sm">No hay clases programadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingClasses.map(cls => (
              <ClassCard key={cls.id} cls={cls} onBooked={() => {}} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function UpcomingBookingCard({ booking }) {
  const cls = booking.class_schedules;
  if (!cls) return null;

  const date = new Date(cls.starts_at);
  const dayLabel = isToday(date) ? 'Hoy' : isTomorrow(date) ? 'Mañana' : format(date, "EEEE d/M", { locale: es });

  return (
    <div className="card flex items-center gap-3 border-l-4 border-red-600">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: cls.activity_types?.color + '22', color: cls.activity_types?.color }}
      >
        <Clock size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-white truncate">{cls.title}</p>
        <p className="text-neutral-400 text-xs capitalize">
          {dayLabel} · {format(date, 'HH:mm')}hs
        </p>
      </div>
    </div>
  );
}
