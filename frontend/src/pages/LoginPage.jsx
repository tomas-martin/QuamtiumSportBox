import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  return (
    <div
      className="min-h-dvh bg-[#080808] flex flex-col lg:flex-row"
      style={{
        /* En mobile, el contenido total respeta el notch y la home indicator */
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* ── Left panel (decorativo, solo desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-[#0f0505] to-neutral-950" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-orange-600/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTYgNnY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />

        {/* Content */}
        <div className="relative z-10 p-12 max-w-md text-center animate-scale-in">
          {/* Large logo */}
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-950/50">
            <span className="text-white font-black text-5xl leading-none" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Q</span>
          </div>
          <h1 className="text-7xl text-white mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.08em' }}>
            QUAMTIUM
          </h1>
          <p className="text-neutral-500 text-sm font-medium tracking-widest uppercase mb-12">Sportbox</p>

          {/* Feature list */}
          <div className="space-y-4 text-left">
            {[
              { icon: '⚡', text: 'Reservá tus clases en segundos' },
              { icon: '📅', text: 'Agenda semanal siempre actualizada' },
              { icon: '🥊', text: 'Historial completo de tus turnos' },
            ].map(({ icon, text }, i) => (
              <div
                key={text}
                className={`flex items-center gap-3 text-neutral-400 text-sm animate-slide-up stagger-${i + 1}`}
              >
                <span className="text-xl">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (login form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:py-12 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-sm relative z-10 animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-950/40">
              <span className="text-white font-black text-3xl leading-none" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Q</span>
            </div>
            <h1 className="text-5xl text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.08em' }}>QUAMTIUM</h1>
            <p className="text-neutral-500 text-xs tracking-widest uppercase mt-1">Sportbox</p>
          </div>

          {/* Card */}
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/60 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/40">
            <div className="mb-7">
              <h2 className="text-2xl font-black text-white mb-2">Bienvenido</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Iniciá sesión para reservar tus clases y gestionar tus turnos.
              </p>
            </div>

            <button
              id="btn-google-signin"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-900 font-bold py-3.5 px-5 rounded-2xl transition-all duration-150 disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-sm"
              style={{ minHeight: '52px' }}
            >
              {/* Google icon */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Cargando...' : 'Continuar con Google'}
            </button>

            <p className="text-center text-neutral-600 text-xs mt-6 leading-relaxed">
              Al continuar aceptás los términos de uso del servicio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
