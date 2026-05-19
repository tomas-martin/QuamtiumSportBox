import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { api } from '../lib/api';
import ClassCard from '../components/user/ClassCard';

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [classes, setClasses] = useState([]);
  const [myBookingIds, setMyBookingIds] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [filterActivity, setFilterActivity] = useState('all');
  const [loading, setLoading] = useState(true);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, bookings, types] = await Promise.all([
        api.classes.list({
          from: weekStart.toISOString(),
          to: weekEnd.toISOString(),
        }),
        api.bookings.mine(),
        activityTypes.length ? Promise.resolve(activityTypes) : api.classes.activityTypes(),
      ]);

      setClasses(cls);
      setMyBookingIds(bookings.filter(b => b.status === 'confirmed').map(b => b.class_schedule_id));
      if (!activityTypes.length) setActivityTypes(types);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  // Agrupar clases por día
  const grouped = classes
    .filter(c => filterActivity === 'all' || c.activity_type_id === filterActivity)
    .reduce((acc, c) => {
      const day = format(new Date(c.starts_at), 'yyyy-MM-dd');
      if (!acc[day]) acc[day] = [];
      acc[day].push(c);
      return acc;
    }, {});

  const weekLabel = `${format(weekStart, "d MMM", { locale: es })} — ${format(weekEnd, "d MMM yyyy", { locale: es })}`;

  return (
    <div className="animate-slide-up">
      {/* Week navigator */}
      <div className="sticky top-[57px] z-20 bg-neutral-950 border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="btn-ghost p-2">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-neutral-300 capitalize">{weekLabel}</span>
          <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="btn-ghost p-2">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Activity filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilterActivity('all')}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              filterActivity === 'all' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            Todas
          </button>
          {activityTypes.map(at => (
            <button
              key={at.id}
              onClick={() => setFilterActivity(at.id)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                filterActivity === at.id ? 'text-white' : 'bg-neutral-800 text-neutral-400'
              }`}
              style={filterActivity === at.id ? { background: at.color } : {}}
            >
              {at.name}
            </button>
          ))}
        </div>
      </div>

      {/* Classes */}
      <div className="px-4 py-4 space-y-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-neutral-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="card text-center py-12">
            <Filter className="mx-auto text-neutral-600 mb-3" size={32} />
            <p className="text-neutral-400 text-sm">No hay clases esta semana</p>
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, dayClasses]) => (
              <div key={day}>
                <h3 className="text-base text-neutral-300 mb-3 capitalize">
                  {format(new Date(day + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                </h3>
                <div className="space-y-3">
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
