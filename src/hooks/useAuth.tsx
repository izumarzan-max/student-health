import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function authErrorText(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'Электрондық пошта немесе құпиясөз қате.';
  if (normalized.includes('already registered') || normalized.includes('already exists')) return 'Бұл электрондық поштаға тіркелгі ашылған.';
  if (normalized.includes('weak password') || normalized.includes('password should be')) return 'Құпиясөз кемінде 6 таңбадан тұруы керек.';
  if (normalized.includes('email not confirmed')) return 'Жүйеге кіру үшін электрондық поштаңызды растаңыз.';
  if (normalized.includes('rate limit')) return 'Сұрау шегі асырылды. Біраздан соң қайталап көріңіз.';
  return 'Жүйеге кіру мүмкін болмады. Мәліметтеріңізді тексеріп, қайталап көріңіз.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('loadProfile error', error);
      return;
    }
    if (!data) {
      // create profile on first login
      const { data: userData } = await supabase.auth.getUser();
      const fullName = userData.user?.user_metadata?.full_name || userData.user?.email?.split('@')[0] || '';
      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name: fullName, language: 'kk' })
        .select()
        .maybeSingle();
      if (createErr) {
        console.error('createProfile error', createErr);
        return;
      }
      setProfile(created as Profile);
      return;
    }
    setProfile(data as Profile);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        (async () => {
          await loadProfile(newSession.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: authErrorText(error.message) };
    if (data.user) {
      const { error: pErr } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, full_name: fullName, language: 'kk' });
      if (pErr) console.error('profile upsert', pErr);
    }
    return { error: null };
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: authErrorText(error.message) };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
