import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';
import ClassCard from '../components/user/ClassCard';

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [classes, setClasses] = useState([]);
  const [myBookingIds, setMyBookingIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, bookings] = await Promise.all([
        api.classes.list({
          from: weekStart.toISOString(),
          to: weekEnd.toISOString(),
        }),
        api.bookings.mine(),
      ]);

      setClasses(cls);
      setMyBookingIds(bookings.filter(b => b.status === 'confirmed').map(b => b.class_schedule_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  // Agrupar clases por día
  const grouped = classes.reduce((acc, c) => {
    const day = format(new Date(c.starts_at), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(c);
    return acc;
  }, {});

  const weekLabel = `${format(weekStart, "d MMM", { locale: es })} — ${format(weekEnd, "d MMM yyyy", { locale: es })}`;

  return (
    <div className="animate-slide-up">
      {/* Week navigator */}
      <div className="sticky top-[69px] z-20 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-3.5 flex items-center justify-between">
        <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="btn-ghost p-2 rounded-xl">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold text-neutral-200 tracking-wider capitalize">{weekLabel}</span>
        <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="btn-ghost p-2 rounded-xl">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Classes */}
      <div className="py-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-neutral-900/40 border border-neutral-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="card text-center py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center">
              <CalendarDays className="text-neutral-500" size={24} />
            </div>
            <div>
              <p className="text-neutral-300 font-semibold">No hay clases esta semana</p>
              <p className="text-neutral-500 text-xs mt-1">Probá navegando a la semana siguiente.</p>
            </div>
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, dayClasses]) => (
              <div key={day} className="space-y-3">
                <h3 className="text-sm font-bold tracking-widest text-red-500 uppercase px-1">
                  {format(new Date(day + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayClasses.map(cls => (
                    <ClassCard
                      key={cls.id}
                      cls={cls}
                      bookedClassIds={myBookingIds}
                      onBooked={load}
                    />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
