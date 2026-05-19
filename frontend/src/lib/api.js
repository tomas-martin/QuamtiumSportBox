import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request(path, options = {}) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

// ── Classes ────────────────────────────────────────────────────────────────
export const api = {
  classes: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/api/classes${qs ? `?${qs}` : ''}`);
    },
    get: (id) => request(`/api/classes/${id}`),
    activityTypes: () => request('/api/classes/meta/activity-types'),
    attendees: (id) => request(`/api/classes/${id}/attendees`),
  },

  bookings: {
    mine: () => request('/api/bookings/my'),
    create: (class_schedule_id) => request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ class_schedule_id }),
    }),
    cancel: (id) => request(`/api/bookings/${id}`, { method: 'DELETE' }),
  },

  profile: {
    me: () => request('/api/profiles/me'),
    update: (updates) => request('/api/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  },

  admin: {
    stats: () => request('/api/admin/stats'),
    users: () => request('/api/admin/users'),
    setUserRole: (id, role) => request(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

    createClass: (payload) => request('/api/admin/classes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    updateClass: (id, payload) => request(`/api/admin/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
    cancelClass: (id, cancel_reason) => request(`/api/admin/classes/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancel_reason }),
    }),
    deleteClass: (id) => request(`/api/admin/classes/${id}`, { method: 'DELETE' }),

    instructors: () => request('/api/admin/instructors'),
    createInstructor: (payload) => request('/api/admin/instructors', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

    createActivityType: (payload) => request('/api/admin/activity-types', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

    markAttendance: (bookingId, status) => request(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  },
};
