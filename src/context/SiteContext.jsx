import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { demoData } from '../data/demo';
import { loadPublicSite } from '../lib/publicApi';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const { loading: authLoading, localMode } = useAuth();
  const [state, setState] = useState({
    profile: demoData.profile,
    skills: demoData.skills,
    categories: demoData.categories,
    projects: demoData.projects,
    isDemo: !isSupabaseConfigured,
    localMode: !isSupabaseConfigured,
    error: null,
    loading: true,
  });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));
    const result = await loadPublicSite({ localMode });
    setState({
      profile: result.profile,
      skills: result.skills,
      categories: result.categories,
      projects: result.projects,
      isDemo: result.isDemo,
      localMode: Boolean(result.localMode),
      error: result.error,
      loading: false,
    });
  }, [localMode]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  const value = useMemo(
    () => ({
      ...state,
      preview: state.isDemo,
      refresh: load,
      featuredProjects: state.projects.filter((project) => project.featured),
      getProjectBySlug: (slug) => state.projects.find((project) => project.slug === slug),
    }),
    [state, load]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used inside SiteProvider');
  return context;
}
