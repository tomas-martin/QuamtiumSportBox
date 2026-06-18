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
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-neutral-900/70 bg-neutral-950/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-950/40">
              <span className="text-white font-black text-sm leading-none">Q</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-black tracking-widest text-[13px] text-white block leading-none">QUAMTIUM</span>
              <span className="text-[9px] text-neutral-500 tracking-widest uppercase leading-none">Sportbox</span>
            </div>
          </div>

          {/* Desktop Nav — centro */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/50 border border-neutral-800/40 rounded-2xl p-1">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-red-600/15 border border-red-500/20'
                      : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side — Admin badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!loading && isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/30'
                      : 'text-red-400 hover:text-white hover:bg-red-600 bg-red-600/10 border border-red-500/20 hover:shadow-md hover:shadow-red-950/30'
                  }`
                }
              >
                <ShieldCheck size={13} />
                <span className="hidden sm:inline">Panel Admin</span>
                <span className="sm:hidden">Admin</span>
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-y-auto scroll-area pb-28 md:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="mx-3 mb-3 bg-neutral-950/80 backdrop-blur-2xl border border-neutral-800/60 rounded-2xl shadow-2xl shadow-black/60">
          <div className="flex items-center justify-around px-2 py-1.5">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                    isActive
                      ? 'text-red-500'
                      : 'text-neutral-600 hover:text-neutral-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-red-500/10' : ''}`}>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
