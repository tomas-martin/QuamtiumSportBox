import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, BookMarked, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/schedule', icon: CalendarDays, label: 'Clases' },
  { to: '/my-bookings', icon: BookMarked, label: 'Mis turnos' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

export default function AppLayout() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col safe-top">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">Q</span>
          </div>
          <span className="font-bold tracking-wide text-sm text-white">QUAMTIUM</span>
        </div>
        {isAdmin && (
          <NavLink to="/admin" className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors">
            <ShieldCheck size={14} />
            Admin
          </NavLink>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scroll-area pb-24">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 safe-bottom z-30">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-150 min-w-[60px] ${
                  isActive
                    ? 'text-red-500'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
