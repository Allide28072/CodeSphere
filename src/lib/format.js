export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function initials(value) {
  const clean = String(value || '').replace(/[’']/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  if (!words.length) return 'AR';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function formatDate(value, options = {}) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatMonthYear(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
}

export function statusLabel(status) {
  if (status === 'completed') return 'Completed';
  if (status === 'planned') return 'Planned';
  return 'In progress';
}

export function categoryLabel(categories, slugOrName) {
  if (!slugOrName) return 'Uncategorised';
  const bySlug = categories?.find((item) => item.slug === slugOrName);
  if (bySlug) return bySlug.name;
  const byName = categories?.find((item) => item.name === slugOrName);
  if (byName) return byName.name;
  return slugOrName;
}

export function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function truncate(value, length = 160) {
  const text = String(value || '').trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export function splitParagraphs(value) {
  return String(value || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function toLines(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function fromLines(items) {
  return Array.isArray(items) ? items.join('\n') : '';
}

export function mediaTypeFromMime(mime) {
  if (String(mime).startsWith('video/')) return 'video';
  return 'image';
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function safeExternalUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}
