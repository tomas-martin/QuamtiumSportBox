import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      const p = await api.profile.me();
      setProfile(p);
      return p;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    // Safety timeout — si en 5s no resuelve, liberar el spinner
    const timeout = setTimeout(() => setLoading(false), 5000);

    // Sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile();
      clearTimeout(timeout);
      setLoading(false);
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

  const signOut = () => supabase.auth.signOut();

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signInWithGoogle, signOut, loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
