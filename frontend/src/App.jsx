import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminClassesPage from './pages/admin/AdminClassesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAttendeesPage from './pages/admin/AdminAttendeesPage';

// Layout
import AppLayout from './components/shared/AppLayout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullscreenSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <FullscreenSpinner />;
  return isAdmin ? children : <Navigate to="/" replace />;
}

function FullscreenSpinner() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="my-bookings" element={<MyBookingsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Admin */}
        <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="admin/classes" element={<AdminRoute><AdminClassesPage /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="admin/classes/:id/attendees" element={<AdminRoute><AdminAttendeesPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          containerStyle={{
            /* Empuja el toast por debajo del notch / dynamic island */
            top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          }}
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fafafa',
              border: '1px solid #2a2a2a',
              borderRadius: '14px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: { iconTheme: { primary: '#ef4444', secondary: '#fafafa' } },
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
