import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { checkIsAdmin, signInAdmin, signOutAdmin } from '../lib/adminApi';
import { hasSupabaseSchema, isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  localAdminSession,
  setLocalMode as setStoreLocalMode,
  signInLocalAdmin,
  signOutLocalAdmin,
} from '../lib/localStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [localMode, setLocalModeState] = useState(!isSupabaseConfigured);
  const [checkError, setCheckError] = useState(null);

  const resolveAdmin = useCallback(async () => {
    if (!supabase) return false;
    try {
      const admin = await checkIsAdmin();
      setCheckError(null);
      return admin;
    } catch (error) {
      setCheckError(error);
      return false;
    }
  }, []);

  const activateLocalMode = useCallback(() => {
    setStoreLocalMode(true);
    setLocalModeState(true);
    const stored = localAdminSession();
    setSession(stored);
    setIsAdmin(Boolean(stored));
    setCheckError(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialise() {
      if (!supabase) {
        if (active) {
          activateLocalMode();
          setReady(true);
        }
        return;
      }

      const schemaReady = await hasSupabaseSchema();
      if (!active) return;

      if (!schemaReady) {
        activateLocalMode();
        setReady(true);
        return;
      }

      setStoreLocalMode(false);
      setLocalModeState(false);

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!active) return;
      setSession(currentSession);

      if (currentSession) {
        const admin = await resolveAdmin();
        if (active) setIsAdmin(admin);
      }

      if (active) setReady(true);
    }

    initialise();

    return () => {
      active = false;
    };
  }, [activateLocalMode, resolveAdmin]);

  useEffect(() => {
    if (!supabase || localMode || !ready) return undefined;

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);

      if (!nextSession) {
        setIsAdmin(false);
        return;
      }

      const admin = await resolveAdmin();
      if (active) setIsAdmin(admin);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [localMode, ready, resolveAdmin]);

  const signIn = useCallback(
    async (email, password) => {
      if (localMode) {
        const nextSession = signInLocalAdmin(email, password);
        setSession(nextSession);
        setIsAdmin(true);
        return nextSession;
      }

      const nextSession = await signInAdmin(email, password);
      setSession(nextSession);
      setIsAdmin(true);
      return nextSession;
    },
    [localMode]
  );

  const signOut = useCallback(async () => {
    if (localMode) {
      signOutLocalAdmin();
      setSession(null);
      setIsAdmin(false);
      return;
    }

    await signOutAdmin();
    setSession(null);
    setIsAdmin(false);
  }, [localMode]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      isAdmin,
      loading: !ready,
      localMode,
      checkError,
      configured: isSupabaseConfigured,
      signIn,
      signOut,
    }),
    [session, isAdmin, ready, localMode, checkError, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
