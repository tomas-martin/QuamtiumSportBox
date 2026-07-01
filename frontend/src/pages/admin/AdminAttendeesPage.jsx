import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

export default function AdminAttendeesPage() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [classData, attendeesData] = await Promise.all([
        api.classes.get(id),
        api.classes.attendees(id),
      ]);
      setCls(classData);
      setAttendees(attendeesData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function markAttendance(bookingId, status) {
    try {
      await api.admin.markAttendance(bookingId, status);
      toast.success(status === 'attended' ? '✓ Asistencia marcada' : 'Marcado como ausente');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="py-5 animate-slide-up">
      <Link to="/admin/classes" className="flex items-center gap-2 text-neutral-400 hover:text-white mb-5 transition-colors text-sm">
        <ArrowLeft size={16} /> Volver a clases
      </Link>

      {cls && (
        <div className="mb-5">
          <h1 className="text-3xl text-white">{cls.title.toUpperCase()}</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {attendees.length} / {cls.max_capacity} inscriptos
          </p>
        </div>
      )}

      {/* Progress bar */}
      {cls && (
        <div className="h-2 bg-neutral-800 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-red-600 rounded-full transition-all"
            style={{ width: `${(attendees.length / cls.max_capacity) * 100}%` }}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 skeleton" />)}
        </div>
      ) : attendees.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-neutral-400 text-sm">No hay inscriptos aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attendees.map((a) => {
            const p = a.profiles;
            return (
              <div key={a.id} className="card flex items-center gap-3">
                {p?.avatar_url ? (
                  <img src={p.avatar_url} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt={p.full_name} />
                ) : (
                  <div className="w-9 h-9 bg-neutral-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-neutral-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p?.full_name || 'Sin nombre'}</p>
                  <p className="text-xs text-neutral-500 truncate">{p?.phone || p?.email}</p>
                </div>

                {/* Asistencia */}
                {a.status === 'attended' ? (
                  <span className="badge bg-green-500/15 text-green-400">Asistió</span>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => markAttendance(a.id, 'attended')}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => markAttendance(a.id, 'cancelled')}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-800 text-neutral-500 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
