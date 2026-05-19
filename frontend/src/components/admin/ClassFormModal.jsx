import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

const DEFAULT_FORM = {
  title: '',
  activity_type_id: '',
  instructor_id: '',
  starts_at: '',
  ends_at: '',
  max_capacity: 15,
  description: '',
};

export default function ClassFormModal({ editingClass, onClose, onSaved }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activityTypes, setActivityTypes] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formatear datetime para input
  const toInput = (iso) => iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : '';

  useEffect(() => {
    Promise.all([api.classes.activityTypes(), api.admin.instructors()]).then(([types, insts]) => {
      setActivityTypes(types);
      setInstructors(insts);
    });

    if (editingClass) {
      setForm({
        title: editingClass.title || '',
        activity_type_id: editingClass.activity_type_id || '',
        instructor_id: editingClass.instructor_id || '',
        starts_at: toInput(editingClass.starts_at),
        ends_at: toInput(editingClass.ends_at),
        max_capacity: editingClass.max_capacity || 15,
        description: editingClass.description || '',
      });
    }
  }, [editingClass]);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.title || !form.activity_type_id || !form.starts_at || !form.ends_at) {
      toast.error('Completá todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        max_capacity: Number(form.max_capacity),
        instructor_id: form.instructor_id || null,
      };

      if (editingClass) {
        await api.admin.updateClass(editingClass.id, payload);
        toast.success('Clase actualizada');
      } else {
        await api.admin.createClass(payload);
        toast.success('Clase creada');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-2xl border border-neutral-800 p-5 pb-8 sm:pb-5 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl text-white">{editingClass ? 'EDITAR CLASE' : 'NUEVA CLASE'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 text-neutral-400">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Título *</label>
            <input className="input" placeholder="Ej: Boxing Nivel 1" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          {/* Actividad */}
          <div>
            <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Tipo de actividad *</label>
            <select className="input" value={form.activity_type_id} onChange={e => set('activity_type_id', e.target.value)}>
              <option value="">Seleccionar...</option>
              {activityTypes.map(at => <option key={at.id} value={at.id}>{at.name}</option>)}
            </select>
          </div>

          {/* Instructor */}
          <div>
            <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Instructor</label>
            <select className="input" value={form.instructor_id} onChange={e => set('instructor_id', e.target.value)}>
              <option value="">Sin asignar</option>
              {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Inicio *</label>
              <input className="input" type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Fin *</label>
              <input className="input" type="datetime-local" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} />
            </div>
          </div>

          {/* Cupos */}
          <div>
            <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Cupos máximos</label>
            <input className="input" type="number" min="1" max="100" value={form.max_capacity} onChange={e => set('max_capacity', e.target.value)} />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs text-neutral-400 font-medium mb-1.5 block">Descripción (opcional)</label>
            <textarea className="input resize-none" rows={3} placeholder="Detalles de la clase..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? 'Guardando...' : editingClass ? 'Guardar cambios' : 'Crear clase'}
          </button>
        </div>
      </div>
    </div>
  );
}
