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
      
      // Si no estamos editando, autoseleccionar la primera actividad
      if (!editingClass && types.length > 0) {
        setForm(f => ({ ...f, activity_type_id: types[0].id }));
      }
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
    if (!form.starts_at || !form.ends_at) {
      toast.error('Completá los campos de inicio y fin');
      return;
    }

    setLoading(true);
    try {
      const selectedInstructor = instructors.find(i => i.id === form.instructor_id);
      const computedTitle = form.title.trim() || (selectedInstructor ? `Clase con ${selectedInstructor.name}` : 'Entrenamiento');
      const resolvedActivityId = form.activity_type_id || (activityTypes.length > 0 ? activityTypes[0].id : null);

      if (!resolvedActivityId) {
        throw new Error('No hay tipos de actividad cargados en el sistema.');
      }

      const payload = {
        title: computedTitle,
        activity_type_id: resolvedActivityId,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        max_capacity: Number(form.max_capacity),
        instructor_id: form.instructor_id || null,
        description: form.description || '',
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
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-neutral-950/90 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl border border-neutral-800/80 p-6 pb-8 sm:pb-6 max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-wider text-white">
            {editingClass ? 'EDITAR TURNO' : 'NUEVO TURNO'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800/60 text-neutral-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Título opcional */}
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-1.5 block">Título (Opcional)</label>
            <input className="input" placeholder="Ej: Especial de Sábado (vacío para usar nombre prof.)" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          {/* Instructor */}
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-1.5 block">Profesor / Instructor</label>
            <select className="input" value={form.instructor_id} onChange={e => set('instructor_id', e.target.value)}>
              <option value="">Sin asignar / Ninguno</option>
              {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-1.5 block">Inicio *</label>
              <input className="input" type="datetime-local" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-1.5 block">Fin *</label>
              <input className="input" type="datetime-local" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} />
            </div>
          </div>

          {/* Cupos */}
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-1.5 block">Cupos máximos</label>
            <input className="input" type="number" min="1" max="100" value={form.max_capacity} onChange={e => set('max_capacity', e.target.value)} />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-1.5 block">Descripción (Opcional)</label>
            <textarea className="input resize-none" rows={3} placeholder="Detalles o requisitos..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Guardando...' : editingClass ? 'Guardar cambios' : 'Crear clase'}
          </button>
        </div>
      </div>
    </div>
  );
}
