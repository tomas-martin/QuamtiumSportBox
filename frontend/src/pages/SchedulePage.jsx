import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format, isToday } from 'date-fns';
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
        api.classes.list({ from: weekStart.toISOString(), to: weekEnd.toISOString() }),
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

  const weekLabel = `${format(weekStart, "d MMM", { locale: es })} – ${format(weekEnd, "d MMM yyyy", { locale: es })}`;
  const isCurrentWeek = format(weekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return (
    <div className="animate-slide-up">

      {/* ── Week navigator ── */}
      {/* top = altura del header (56px) + safe-area-inset-top del notch */}
      <div
        className="sticky z-20 bg-[#080808]/90 backdrop-blur-md border-b border-neutral-900/60 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 flex items-center justify-between gap-3"
        style={{ top: 'calc(56px + env(safe-area-inset-top, 0px))' }}
      >
        <button
          id="btn-prev-week"
          onClick={() => setWeekStart(w => subWeeks(w, 1))}
          className="btn-ghost !px-3 !py-2"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="text-center">
          <span className="text-sm font-bold text-neutral-200 tracking-wider capitalize block">
            {weekLabel}
          </span>
          {isCurrentWeek && (
            <span className="text-[10px] text-red-500 font-semibold uppercase tracking-widest">
              Semana actual
            </span>
          )}
        </div>

        <button
          id="btn-next-week"
          onClick={() => setWeekStart(w => addWeeks(w, 1))}
          className="btn-ghost !px-3 !py-2"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Classes ── */}
      <div className="pb-6 space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-neutral-900/40 border border-neutral-800/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="card text-center py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center">
              <CalendarDays className="text-neutral-500" size={22} />
            </div>
            <div>
              <p className="text-neutral-300 font-semibold">No hay clases esta semana</p>
              <p className="text-neutral-600 text-xs mt-1">Probá navegando a la semana siguiente.</p>
            </div>
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, dayClasses]) => {
              const dayDate = new Date(day + 'T12:00:00');
              const todayMark = isToday(dayDate);
              return (
                <div key={day} className="space-y-3">
                  {/* Day header */}
                  <div className="flex items-center gap-3 px-1">
                    <h3 className={`text-xs font-bold tracking-widest uppercase ${todayMark ? 'text-red-500' : 'text-neutral-500'}`}>
                      {format(dayDate, "EEEE d 'de' MMMM", { locale: es })}
                    </h3>
                    {todayMark && (
                      <span className="badge bg-red-500/10 text-red-400 border-red-500/20 text-[10px] px-2">
                        Hoy
                      </span>
                    )}
                    <div className="flex-1 h-px bg-neutral-800/60" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
              );
            })
        )}
      </div>
    </div>
  );
}
