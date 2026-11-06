export const PROJECT_STATUSES = [
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'planned', label: 'Planned' },
];

export const DEFAULT_CATEGORIES = [
  { name: 'Web Applications', slug: 'web-applications' },
  { name: 'Mobile Applications', slug: 'mobile-applications' },
  { name: 'Desktop Applications', slug: 'desktop-applications' },
  { name: 'UI/UX Design', slug: 'ui-ux-design' },
  { name: 'Other', slug: 'other' },
];

export const NAV_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Skills', to: '/skills' },
  { label: 'Projects', to: '/projects' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
];

export const ADMIN_NAV = [
  { label: 'Overview', to: '/admin', end: true, icon: 'LayoutDashboard' },
  { label: 'Projects', to: '/admin/projects', icon: 'FolderKanban' },
  { label: 'Homepage', to: '/admin/homepage', icon: 'Home' },
  { label: 'Profile & About', to: '/admin/profile', icon: 'UserRound' },
  { label: 'Skills', to: '/admin/skills', icon: 'Sparkles' },
  { label: 'Categories', to: '/admin/categories', icon: 'Tags' },
  { label: 'Messages', to: '/admin/messages', icon: 'Mail' },
];

export const SOCIAL_KEYS = [
  { key: 'github_url', label: 'GitHub', icon: 'Github' },
  { key: 'linkedin_url', label: 'LinkedIn', icon: 'Linkedin' },
  { key: 'instagram_url', label: 'Instagram', icon: 'Instagram' },
];

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
