import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Track explicit sign-out so we don't clear the session due to network failures
  // (e.g. when WiFi switches to Mevo+ and Supabase can't reach the internet)
  const signingOut = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT') {
        // Only clear session when the user explicitly signed out, not on network failures
        if (signingOut.current) {
          setSession(null);
          signingOut.current = false;
        }
      } else if (newSession != null) {
        setSession(newSession);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'launchapp://confirm' },
    });
    return error?.message ?? null;
  }

  async function signOut(): Promise<void> {
    signingOut.current = true;
    await supabase.auth.signOut({ scope: 'local' });
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
