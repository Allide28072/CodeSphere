import { demoData } from '../data/demo';
import { isSupabaseConfigured, requireSupabase, supabase } from './supabase';
import * as local from './localStore';

export async function loadPublicSite({ localMode = false } = {}) {
  if (localMode || local.isLocalMode()) {
    return local.localLoadPublicSite();
  }

  if (!isSupabaseConfigured) {
    return { ...demoData, isDemo: true, localMode: false, error: null };
  }

  try {
    const [profileResult, skillsResult, categoriesResult, projectsResult] = await Promise.all([
      supabase.from('site_profile').select('*').eq('id', 1).maybeSingle(),
      supabase.from('skills').select('*').order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false }),
    ]);

    const firstError =
      profileResult.error || skillsResult.error || categoriesResult.error || projectsResult.error;

    if (firstError) throw firstError;

    return {
      profile: profileResult.data || demoData.profile,
      skills: skillsResult.data?.length ? skillsResult.data : demoData.skills,
      categories: categoriesResult.data?.length ? categoriesResult.data : demoData.categories,
      projects: projectsResult.data || [],
      isDemo: false,
      localMode: false,
      error: null,
    };
  } catch (error) {
    return {
      ...demoData,
      isDemo: true,
      localMode: false,
      error,
    };
  }
}

export async function fetchProjectMedia(project) {
  if (!project) return [];
  if (project.isDemo || !isSupabaseConfigured) return project.media || [];

  const { data, error } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function submitContactMessage(payload) {
  if (local.isLocalMode()) {
    local.localSubmitContactMessage(payload);
    return true;
  }

  if (!isSupabaseConfigured) {
    throw new Error(
      'The contact form is not connected yet. Configure Supabase to start receiving messages.'
    );
  }

  const client = requireSupabase();
  const { error } = await client.from('contact_messages').insert({
    name: payload.name.trim(),
    email: payload.email.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
  });

  if (error) throw error;
  return true;
}
