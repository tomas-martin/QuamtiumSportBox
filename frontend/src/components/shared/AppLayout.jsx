import { Outlet, NavLink } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, BookMarked, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/schedule', icon: CalendarDays, label: 'Clases' },
  { to: '/my-bookings', icon: BookMarked, label: 'Mis turnos' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

export default function AppLayout() {
  const { isAdmin, loading } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col safe-top">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-900/80 bg-neutral-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-md shadow-red-950/40">
            <span className="text-white font-black text-sm">Q</span>
          </div>
          <div>
            <span className="font-bold tracking-widest text-sm text-white block">QUAMTIUM</span>
            <span className="text-[9px] text-neutral-500 tracking-widest uppercase block -mt-0.5">Sportbox</span>
          </div>
        </div>
        {!loading && isAdmin && (
          <NavLink
            to="/admin"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-white hover:bg-red-600 bg-red-600/10 border border-red-500/20 px-3 py-1.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-600/15"
          >
            <ShieldCheck size={13} />
            Panel Admin
          </NavLink>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scroll-area pb-28">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-5 left-4 right-4 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/60 rounded-2xl safe-bottom z-30 max-w-md mx-auto shadow-2xl shadow-black/50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-300 min-w-[60px] ${
                  isActive
                    ? 'text-red-500 bg-red-500/5'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className="transition-transform duration-300 active:scale-90" />
                  <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
