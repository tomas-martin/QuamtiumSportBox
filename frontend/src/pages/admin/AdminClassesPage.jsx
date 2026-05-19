import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Pencil, Trash2, XCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import ClassFormModal from '../../components/admin/ClassFormModal';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.classes.list();
      setClasses(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta clase? Se perderán todas las reservas.')) return;
    try {
      await api.admin.deleteClass(id);
      toast.success('Clase eliminada');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleCancel(id) {
    const reason = prompt('Motivo de cancelación (opcional):');
    if (reason === null) return; // Canceló el prompt
    try {
      await api.admin.cancelClass(id, reason);
      toast.success('Clase cancelada');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function openCreate() { setEditingClass(null); setShowModal(true); }
  function openEdit(cls) { setEditingClass(cls); setShowModal(true); }

  return (
    <div className="px-4 py-5 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-4xl text-white">CLASES</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 text-sm py-2">
          <Plus size={16} /> Nueva
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-neutral-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : classes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-neutral-400 text-sm">No hay clases programadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(cls => (
            <AdminClassCard
              key={cls.id}
              cls={cls}
              onEdit={() => openEdit(cls)}
              onDelete={() => handleDelete(cls.id)}
              onCancel={() => handleCancel(cls.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ClassFormModal
          editingClass={editingClass}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

function AdminClassCard({ cls, onEdit, onDelete, onCancel }) {
  const date = new Date(cls.starts_at);

  return (
    <div className={`card space-y-3 ${cls.is_cancelled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cls.activity_color }} />
            <p className="font-semibold text-white text-sm truncate">{cls.title}</p>
          </div>
          <p className="text-xs text-neutral-400 capitalize">
            {format(date, "EEEE d/MM · HH:mm'hs'", { locale: es })}
          </p>
        </div>
        {cls.is_cancelled && (
          <span className="badge bg-neutral-700 text-neutral-400 flex-shrink-0">Cancelada</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Link to={`/admin/classes/${cls.id}/attendees`} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
          <Users size={13} />
          <span>{cls.booked_count}/{cls.max_capacity} inscriptos</span>
          <ChevronRight size={12} />
        </Link>

        {!cls.is_cancelled && (
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-yellow-900/30 text-neutral-400 hover:text-yellow-400 transition-colors">
              <XCircle size={13} />
            </button>
            <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-red-900/30 text-neutral-400 hover:text-red-400 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
