import { ALLOWED_MEDIA_TYPES, MAX_IMAGE_BYTES } from './constants';
import { demoData } from '../data/demo';
import { mediaTypeFromMime, slugify } from './format';

const CONTENT_KEY = 'allide:local-content:v1';
const ADMIN_KEY = 'allide:local-admin:v1';
const LOCAL_MEDIA_LIMIT = 1.5 * 1024 * 1024;

export const LOCAL_ADMIN_PASSWORD = '28072';

let localMode = false;

export function setLocalMode(value) {
  localMode = Boolean(value);
}

export function isLocalMode() {
  return localMode;
}

function storageAvailable() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function now() {
  return new Date().toISOString();
}

function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedContent() {
  const projects = demoData.projects.map((project) => {
    const rest = { ...project };
    delete rest.media;
    return {
      ...rest,
      id: rest.id || uid(),
      created_at: rest.created_at || now(),
      updated_at: rest.updated_at || now(),
    };
  });

  const projectMedia = demoData.projects.flatMap((project) =>
    (project.media || []).map((item) => ({
      ...item,
      id: item.id || uid(),
      project_id: project.id,
      created_at: item.created_at || now(),
    }))
  );

  return {
    profile: { ...demoData.profile },
    skills: demoData.skills.map((skill) => ({ ...skill })),
    categories: demoData.categories.map((category) => ({ ...category })),
    projects,
    project_media: projectMedia,
    contact_messages: [],
  };
}

export function readLocalContent() {
  if (!storageAvailable()) return seedContent();

  const raw = window.localStorage.getItem(CONTENT_KEY);
  if (!raw) {
    const seeded = seedContent();
    writeLocalContent(seeded);
    return seeded;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const seeded = seedContent();
    writeLocalContent(seeded);
    return seeded;
  }
}

export function writeLocalContent(state) {
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(CONTENT_KEY, JSON.stringify(state));
  } catch {
    throw new Error(
      'Local storage is full. Remove some media or configure Supabase for larger uploads.'
    );
  }
}

function mutate(mutator) {
  const state = readLocalContent();
  const result = mutator(state);
  writeLocalContent(state);
  return result;
}

function readOnly(reader) {
  return reader(readLocalContent());
}

export function localAdminSession() {
  if (!storageAvailable()) return null;
  const email = window.localStorage.getItem(ADMIN_KEY);
  return email ? { user: { email }, access_token: 'local-preview' } : null;
}

export function signInLocalAdmin(email, password) {
  if (password !== LOCAL_ADMIN_PASSWORD) {
    throw new Error('Invalid login credentials');
  }

  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) throw new Error('Enter an email address to continue.');

  if (storageAvailable()) window.localStorage.setItem(ADMIN_KEY, normalized);
  return { user: { email: normalized }, access_token: 'local-preview' };
}

export function signOutLocalAdmin() {
  if (storageAvailable()) window.localStorage.removeItem(ADMIN_KEY);
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

function bySortOrder(a, b) {
  return (a.sort_order || 0) - (b.sort_order || 0);
}

function byNewest(a, b) {
  return new Date(b.created_at || 0) - new Date(a.created_at || 0);
}

export function localLoadPublicSite() {
  return readOnly((state) => ({
    profile: copy(state.profile),
    skills: copy(state.skills).sort(bySortOrder),
    categories: copy(state.categories).sort(bySortOrder),
    projects: state.projects
      .filter((project) => project.published)
      .sort(byNewest)
      .map((project) => ({
        ...copy(project),
        isDemo: true,
        media: state.project_media
          .filter((item) => item.project_id === project.id)
          .sort(bySortOrder)
          .map(copy),
      })),
    isDemo: true,
    localMode: true,
    error: null,
  }));
}

export function localFetchDashboardStats() {
  return readOnly((state) => ({
    total: state.projects.length,
    published: state.projects.filter((project) => project.published).length,
    featured: state.projects.filter((project) => project.featured).length,
    unread: state.contact_messages.filter((message) => !message.is_read).length,
  }));
}

export function localFetchRecentProjects(limit = 5) {
  return readOnly((state) => copy(state.projects).sort(byNewest).slice(0, limit));
}

export function localFetchAllProjects() {
  return readOnly((state) => copy(state.projects).sort(byNewest));
}

export function localFetchProject(id) {
  return readOnly((state) => copy(state.projects.find((project) => project.id === id) || null));
}

export function localFetchProjectMediaForAdmin(projectId) {
  return readOnly((state) =>
    state.project_media
      .filter((item) => item.project_id === projectId)
      .sort(bySortOrder)
      .map(copy)
  );
}

export function localCreateProject(values) {
  return mutate((state) => {
    const project = {
      id: uid(),
      ...projectPayload(values),
      created_at: now(),
      updated_at: now(),
    };
    state.projects.unshift(project);
    return copy(project);
  });
}

export function localUpdateProject(id, values) {
  return mutate((state) => {
    const index = state.projects.findIndex((project) => project.id === id);
    if (index === -1) throw new Error('Project not found.');

    const project = {
      ...state.projects[index],
      ...projectPayload(values),
      updated_at: now(),
    };
    state.projects[index] = project;
    return copy(project);
  });
}

export function localSetProjectFlag(id, field, value) {
  mutate((state) => {
    const project = state.projects.find((item) => item.id === id);
    if (!project) throw new Error('Project not found.');
    project[field] = value;
    project.updated_at = now();
  });
}

export function localDeleteProjectRecord(project) {
  mutate((state) => {
    state.projects = state.projects.filter((item) => item.id !== project.id);
    state.project_media = state.project_media.filter((item) => item.project_id !== project.id);
  });
}

export async function localUploadMediaFile(file, projectId, onProgress) {
  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Use JPG, PNG, WebP, MP4, or WebM.');
  }

  if (file.type.startsWith('video/')) {
    throw new Error('Video uploads need Supabase. Add a video URL or use an image in local mode.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Images must be under ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.`);
  }

  if (file.size > LOCAL_MEDIA_LIMIT) {
    throw new Error(
      'Local preview supports images up to 1.5 MB. Configure Supabase for larger uploads.'
    );
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });

  onProgress?.(100);

  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const baseName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'media';

  return {
    path: `local/${projectId}/${Date.now()}-${baseName}.${extension}`,
    url: dataUrl,
    media_type: mediaTypeFromMime(file.type),
  };
}

export function localCreateMediaRecord({ projectId, url, path, mediaType, altText, sortOrder }) {
  return mutate((state) => {
    const record = {
      id: uid(),
      project_id: projectId,
      url,
      storage_path: path,
      media_type: mediaType,
      alt_text: altText?.trim() || null,
      sort_order: sortOrder || 0,
      created_at: now(),
    };
    state.project_media.push(record);
    return copy(record);
  });
}

export function localUpdateMediaAlt(id, altText) {
  mutate((state) => {
    const record = state.project_media.find((item) => item.id === id);
    if (!record) throw new Error('Media item not found.');
    record.alt_text = altText?.trim() || null;
  });
}

export function localDeleteMediaRecord(media) {
  mutate((state) => {
    state.project_media = state.project_media.filter((item) => item.id !== media.id);
  });
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

export function localFetchProfile() {
  return readOnly((state) => copy(state.profile));
}

export function localSaveProfile(values) {
  return mutate((state) => {
    const payload = { id: 1 };
    PROFILE_FIELDS.forEach((field) => {
      if (values[field] === undefined) return;
      payload[field] = typeof values[field] === 'string' ? values[field].trim() : values[field];
    });

    state.profile = { ...state.profile, ...payload, updated_at: now() };
    return copy(state.profile);
  });
}

export function localFetchSkills() {
  return readOnly((state) => copy(state.skills).sort(bySortOrder));
}

export function localCreateSkill({ category, name }) {
  return mutate((state) => {
    const skill = {
      id: uid(),
      category: category.trim(),
      name: name.trim(),
      sort_order: Math.max(0, ...state.skills.map((item) => item.sort_order || 0)) + 1,
      created_at: now(),
    };
    state.skills.push(skill);
    return copy(skill);
  });
}

export function localDeleteSkill(id) {
  mutate((state) => {
    state.skills = state.skills.filter((skill) => skill.id !== id);
  });
}

export function localFetchCategories() {
  return readOnly((state) => copy(state.categories).sort(bySortOrder));
}

export function localCreateCategory({ name, slug }) {
  return mutate((state) => {
    const category = {
      id: uid(),
      name: name.trim(),
      slug: (slug || slugify(name)).trim(),
      sort_order: Math.max(0, ...state.categories.map((item) => item.sort_order || 0)) + 1,
      created_at: now(),
    };
    state.categories.push(category);
    return copy(category);
  });
}

export function localUpdateCategory(id, { name, slug }) {
  return mutate((state) => {
    const category = state.categories.find((item) => item.id === id);
    if (!category) throw new Error('Category not found.');
    category.name = name.trim();
    category.slug = (slug || slugify(name)).trim();
    return copy(category);
  });
}

export function localDeleteCategory(id) {
  mutate((state) => {
    state.categories = state.categories.filter((category) => category.id !== id);
  });
}

export function localFetchMessages() {
  return readOnly((state) => copy(state.contact_messages).sort(byNewest));
}

export function localSetMessageRead(id, isRead) {
  mutate((state) => {
    const message = state.contact_messages.find((item) => item.id === id);
    if (!message) throw new Error('Message not found.');
    message.is_read = isRead;
  });
}

export function localDeleteMessage(id) {
  mutate((state) => {
    state.contact_messages = state.contact_messages.filter((message) => message.id !== id);
  });
}

export function localSubmitContactMessage(payload) {
  return mutate((state) => {
    const message = {
      id: uid(),
      name: payload.name.trim(),
      email: payload.email.trim(),
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      is_read: false,
      created_at: now(),
    };
    state.contact_messages.unshift(message);
    return copy(message);
  });
}
