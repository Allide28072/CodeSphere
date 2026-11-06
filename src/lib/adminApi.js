import {
  ALLOWED_MEDIA_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from './constants';
import { STORAGE_BUCKET, requireSupabase } from './supabase';
import { mediaTypeFromMime, slugify } from './format';
import * as local from './localStore';

export async function checkIsAdmin() {
  const client = requireSupabase();
  const { data, error } = await client.rpc('is_admin');
  if (error) throw error;
  return Boolean(data);
}

export async function signInAdmin(email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    await client.auth.signOut();
    throw new Error('This account does not have administrator access.');
  }

  return data.session;
}

export async function signOutAdmin() {
  const client = requireSupabase();
  await client.auth.signOut();
}

export async function fetchDashboardStats() {
  if (local.isLocalMode()) return local.localFetchDashboardStats();
  const client = requireSupabase();
  const [total, published, featured, unread] = await Promise.all([
    client.from('projects').select('*', { count: 'exact', head: true }),
    client.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
    client.from('projects').select('*', { count: 'exact', head: true }).eq('featured', true),
    client
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false),
  ]);

  const error = total.error || published.error || featured.error || unread.error;
  if (error) throw error;

  return {
    total: total.count || 0,
    published: published.count || 0,
    featured: featured.count || 0,
    unread: unread.count || 0,
  };
}

export async function fetchRecentProjects(limit = 5) {
  if (local.isLocalMode()) return local.localFetchRecentProjects(limit);
  const client = requireSupabase();
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchAllProjects() {
  if (local.isLocalMode()) return local.localFetchAllProjects();
  const client = requireSupabase();
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProject(id) {
  if (local.isLocalMode()) return local.localFetchProject(id);
  const client = requireSupabase();
  const { data, error } = await client.from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProjectMediaForAdmin(projectId) {
  if (local.isLocalMode()) return local.localFetchProjectMediaForAdmin(projectId);
  const client = requireSupabase();
  const { data, error } = await client
    .from('project_media')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

function projectPayload(values) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim() || slugify(values.title),
    summary: values.summary.trim(),
    description: values.description?.trim() || '',
    category: values.category,
    technologies: values.technologies || [],
    features: values.features || [],
    status: values.status,
    published: Boolean(values.published),
    featured: Boolean(values.featured),
    thumbnail_url: values.thumbnail_url?.trim() || null,
    live_url: values.live_url?.trim() || null,
    github_url: values.github_url?.trim() || null,
  };
}

export async function createProject(values) {
  if (local.isLocalMode()) return local.localCreateProject(values);
  const client = requireSupabase();
  const { data, error } = await client
    .from('projects')
    .insert(projectPayload(values))
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, values) {
  if (local.isLocalMode()) return local.localUpdateProject(id, values);
  const client = requireSupabase();
  const { data, error } = await client
    .from('projects')
    .update(projectPayload(values))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function setProjectFlag(id, field, value) {
  if (!['published', 'featured'].includes(field)) {
    throw new Error('Unsupported project field.');
  }
  if (local.isLocalMode()) {
    local.localSetProjectFlag(id, field, value);
    return;
  }
  const client = requireSupabase();
  const { error } = await client
    .from('projects')
    .update({ [field]: value })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProjectRecord(project) {
  if (local.isLocalMode()) {
    local.localDeleteProjectRecord(project);
    return;
  }
  const client = requireSupabase();
  const media = await fetchProjectMediaForAdmin(project.id);
  const paths = media.map((item) => item.storage_path).filter(Boolean);

  if (paths.length) {
    await client.storage.from(STORAGE_BUCKET).remove(paths);
  }

  const { error } = await client.from('projects').delete().eq('id', project.id);
  if (error) throw error;
}

export function validateMediaFile(file) {
  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    return 'Unsupported file type. Use JPG, PNG, WebP, MP4, or WebM.';
  }
  const isVideo = file.type.startsWith('video/');
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return `${isVideo ? 'Videos' : 'Images'} must be under ${Math.round(
      limit / (1024 * 1024)
    )} MB.`;
  }
  return null;
}

export async function uploadMediaFile(file, projectId, onProgress) {
  if (local.isLocalMode()) return local.localUploadMediaFile(file, projectId, onProgress);
  const client = requireSupabase();
  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session) throw new Error('Your session expired. Sign in again.');

  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const baseName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'media';
  const path = `${projectId}/${Date.now()}-${baseName}.${extension}`;
  const baseUrl = import.meta.env.VITE_SUPABASE_URL.replace(/\/+$/, '');

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${baseUrl}/storage/v1/object/${STORAGE_BUCKET}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-upsert', 'false');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        let message = 'Upload failed.';
        try {
          const parsed = JSON.parse(xhr.responseText);
          message = parsed.message || parsed.error || message;
        } catch {
          if (xhr.responseText) message = xhr.responseText;
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    xhr.send(file);
  });

  const {
    data: { publicUrl },
  } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  return {
    path,
    url: publicUrl,
    media_type: mediaTypeFromMime(file.type),
  };
}

export async function createMediaRecord({ projectId, url, path, mediaType, altText, sortOrder }) {
  if (local.isLocalMode()) {
    return local.localCreateMediaRecord({ projectId, url, path, mediaType, altText, sortOrder });
  }
  const client = requireSupabase();
  const { data, error } = await client
    .from('project_media')
    .insert({
      project_id: projectId,
      url,
      storage_path: path,
      media_type: mediaType,
      alt_text: altText?.trim() || null,
      sort_order: sortOrder || 0,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateMediaAlt(id, altText) {
  if (local.isLocalMode()) {
    local.localUpdateMediaAlt(id, altText);
    return;
  }
  const client = requireSupabase();
  const { error } = await client
    .from('project_media')
    .update({ alt_text: altText?.trim() || null })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteMediaRecord(media) {
  if (local.isLocalMode()) {
    local.localDeleteMediaRecord(media);
    return;
  }
  const client = requireSupabase();
  if (media.storage_path) {
    await client.storage.from(STORAGE_BUCKET).remove([media.storage_path]);
  }
  const { error } = await client.from('project_media').delete().eq('id', media.id);
  if (error) throw error;
}

export async function fetchProfile() {
  if (local.isLocalMode()) return local.localFetchProfile();
  const client = requireSupabase();
  const { data, error } = await client.from('site_profile').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data;
}

const PROFILE_FIELDS = [
  'full_name',
  'professional_title',
  'headline',
  'intro',
  'biography',
  'approach',
  'goals',
  'email',
  'location',
  'github_url',
  'linkedin_url',
  'instagram_url',
  'avatar_url',
  'resume_url',
  'availability',
];

export async function saveProfile(values) {
  if (local.isLocalMode()) return local.localSaveProfile(values);
  const client = requireSupabase();
  const payload = { id: 1 };

  PROFILE_FIELDS.forEach((field) => {
    if (values[field] === undefined) return;
    payload[field] = typeof values[field] === 'string' ? values[field].trim() : values[field];
  });

  const { data, error } = await client
    .from('site_profile')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function fetchSkills() {
  if (local.isLocalMode()) return local.localFetchSkills();
  const client = requireSupabase();
  const { data, error } = await client
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createSkill({ category, name }) {
  if (local.isLocalMode()) return local.localCreateSkill({ category, name });
  const client = requireSupabase();
  const { data: existing } = await client
    .from('skills')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await client
    .from('skills')
    .insert({
      category: category.trim(),
      name: name.trim(),
      sort_order: (existing?.sort_order || 0) + 1,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSkill(id) {
  if (local.isLocalMode()) {
    local.localDeleteSkill(id);
    return;
  }
  const client = requireSupabase();
  const { error } = await client.from('skills').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchCategories() {
  if (local.isLocalMode()) return local.localFetchCategories();
  const client = requireSupabase();
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createCategory({ name, slug }) {
  if (local.isLocalMode()) return local.localCreateCategory({ name, slug });
  const client = requireSupabase();
  const { data: existing } = await client
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await client
    .from('categories')
    .insert({
      name: name.trim(),
      slug: (slug || slugify(name)).trim(),
      sort_order: (existing?.sort_order || 0) + 1,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, { name, slug }) {
  if (local.isLocalMode()) return local.localUpdateCategory(id, { name, slug });
  const client = requireSupabase();
  const { data, error } = await client
    .from('categories')
    .update({ name: name.trim(), slug: (slug || slugify(name)).trim() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  if (local.isLocalMode()) {
    local.localDeleteCategory(id);
    return;
  }
  const client = requireSupabase();
  const { error } = await client.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchMessages() {
  if (local.isLocalMode()) return local.localFetchMessages();
  const client = requireSupabase();
  const { data, error } = await client
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function setMessageRead(id, isRead) {
  if (local.isLocalMode()) {
    local.localSetMessageRead(id, isRead);
    return;
  }
  const client = requireSupabase();
  const { error } = await client
    .from('contact_messages')
    .update({ is_read: isRead })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteMessage(id) {
  if (local.isLocalMode()) {
    local.localDeleteMessage(id);
    return;
  }
  const client = requireSupabase();
  const { error } = await client.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}
