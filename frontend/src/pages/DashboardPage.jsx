import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Clock, UserRound, Dumbbell } from 'lucide-react';
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
        api.classes.list({ limit: 6 }),
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

  useEffect(() => { loadDashboard(); }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'Atleta';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="py-5 sm:py-6 space-y-6 sm:space-y-8">

      {/* ── Hero greeting ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/60 to-neutral-900/20 border border-neutral-800/40 p-5 sm:p-8 min-h-[130px] sm:min-h-[160px] flex flex-col justify-end animate-slide-up">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-6 opacity-[0.04] pointer-events-none">
          <Dumbbell size={110} strokeWidth={1} />
        </div>
        <p className="text-neutral-500 text-[11px] font-bold tracking-widest uppercase mb-1">{greeting},</p>
        <h1 className="text-4xl xs:text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 tracking-wide leading-none break-words">
          {firstName.toUpperCase()}
        </h1>
        {profile?.role === 'admin' && (
          <span className="mt-3 self-start badge bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
            ⚡ Admin
          </span>
        )}
      </div>

      {/* ── Two column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-start">

        {/* Próximas reservas */}
        <section className="space-y-3 animate-slide-up stagger-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold tracking-widest uppercase text-neutral-500">Tus próximos turnos</h2>
            {myBookings.length > 0 && (
              <Link to="/my-bookings" className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                Ver todos <ChevronRight size={12} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2].map(i => (
                <div key={i} className="h-16 skeleton" />
              ))}
            </div>
          ) : myBookings.length === 0 ? (
            <div className="card py-8 text-center flex flex-col items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                <Clock size={18} className="text-neutral-600" />
              </div>
              <p className="text-neutral-500 text-sm">No tenés ningún turno reservado aún.</p>
              <Link to="/schedule" className="text-xs text-red-500 hover:text-red-400 font-semibold transition-colors">
                Ver clases disponibles →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myBookings.map((b, i) => (
                <div key={b.id} className={`animate-slide-up stagger-${i + 2}`}>
                  <UpcomingBookingCard booking={b} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Clases disponibles */}
        <section className="space-y-3 animate-slide-up stagger-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold tracking-widest uppercase text-neutral-500">Clases disponibles</h2>
            <Link to="/schedule" className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
              Ver agenda <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 skeleton" />
              ))}
            </div>
          ) : upcomingClasses.length === 0 ? (
            <div className="card text-center py-12 flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
                <CalendarDays className="text-neutral-600" size={20} />
              </div>
              <p className="text-neutral-500 text-sm">No hay clases programadas por el momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((cls, i) => (
                <div key={cls.id} className={`animate-slide-up stagger-${i + 1}`}>
                  <ClassCard cls={cls} onBooked={loadDashboard} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function UpcomingBookingCard({ booking }) {
  const cls = booking.class_schedules;
  if (!cls) return null;

  const date = new Date(cls.starts_at);
  const dayLabel = isToday(date) ? 'Hoy' : isTomorrow(date) ? 'Mañana' : format(date, "EEEE d/M", { locale: es });

  return (
    <div className="card flex items-center gap-3.5 border-l-2 border-red-600/70 hover:bg-neutral-900/60 hover:border-red-500 transition-all duration-200 group">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/8 text-red-500 border border-red-500/10 group-hover:bg-red-500/15 transition-colors">
        <Clock size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm tracking-wide uppercase truncate">{cls.title}</p>
        <p className="text-neutral-500 text-xs capitalize mt-0.5 font-medium flex items-center gap-2">
          <span className="capitalize">{dayLabel} · {format(date, 'HH:mm')} hs</span>
          {cls.instructors?.name && (
            <span className="flex items-center gap-1 text-neutral-600">
              <UserRound size={10} className="text-red-500/70" />
              {cls.instructors.name}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
