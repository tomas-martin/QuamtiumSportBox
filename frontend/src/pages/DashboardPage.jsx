import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Clock, UserRound } from 'lucide-react';
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

  const loadDashboard = async () => {
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
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'Atleta';

  return (
    <div className="px-4 py-6 space-y-7 animate-slide-up">
      {/* Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/30 border border-neutral-900/50 p-6 flex flex-col justify-end min-h-[120px] shadow-inner shadow-black/20">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl" />
        <p className="text-neutral-500 text-xs font-bold tracking-widest uppercase">Hola,</p>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 -mt-1 tracking-wide">
          {firstName.toUpperCase()}
        </h1>
      </div>

      {/* Próximas reservas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold tracking-wider text-neutral-300">TUS PRÓXIMOS TURNOS</h2>
          {myBookings.length > 0 && (
            <Link to="/my-bookings" className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
              Ver todos <ChevronRight size={14} />
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-neutral-900/40 border border-neutral-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : myBookings.length === 0 ? (
          <div className="card py-6 text-center text-neutral-500 text-sm flex flex-col items-center justify-center gap-2">
            <Clock size={20} className="text-neutral-600" />
            <p>No tenés ningún turno reservado aún.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myBookings.map(b => (
              <UpcomingBookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      {/* Clases disponibles */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold tracking-wider text-neutral-300">CLASES DISPONIBLES</h2>
          <Link to="/schedule" className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
            Ver agenda <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-neutral-900/40 border border-neutral-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : upcomingClasses.length === 0 ? (
          <div className="card text-center py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center">
              <CalendarDays className="text-neutral-600" size={22} />
            </div>
            <p className="text-neutral-500 text-sm">No hay clases programadas por el momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingClasses.map(cls => (
              <ClassCard key={cls.id} cls={cls} onBooked={loadDashboard} />
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
    <div className="card flex items-center gap-3.5 border-l-4 border-red-600 hover:bg-neutral-900/60 hover:border-red-500 transition-all duration-300">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-650/10 text-red-500 border border-red-500/10">
        <Clock size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm tracking-wide uppercase truncate">{cls.title}</p>
        <p className="text-neutral-400 text-xs capitalize mt-0.5 font-medium flex items-center gap-2">
          <span>{dayLabel} · {format(date, 'HH:mm')} hs</span>
          {cls.instructors?.name && (
            <span className="flex items-center gap-1 text-[11px] text-neutral-500">
              <UserRound size={10} className="text-red-500" />
              <span>{cls.instructors.name}</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
