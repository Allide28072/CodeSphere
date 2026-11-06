export const demoProfile = {
  id: 1,
  full_name: "Allide’ Ru.Ju.Gi.Ra",
  professional_title: 'Web & Software Developer',
  headline: 'I build websites and software with care, clarity, and a developer’s curiosity.',
  intro:
    'I’m a software development student and developer focused on building useful things for the web. I work across the front end, back end, and mobile — learning in public and paying attention to the details that make software feel considered.',
  biography:
    'I’m Allide’ Ru.Ju.Gi.Ra, a software development student and developer. My interest in technology started with a simple question: how do the websites and applications I use every day actually work? That question turned into a habit of building, breaking, and rebuilding things until they made sense.\n\nToday I work across web and application development — from responsive interfaces with React and Tailwind CSS to APIs with Node.js and Laravel, databases with PostgreSQL and MySQL, and mobile apps with Flutter. I’m still early in my career, and I treat that as an advantage: I ask questions, test assumptions, and keep improving the way I work.\n\nI care about software that is understandable, accessible, and honest about what it does. Most of my learning happens through projects, documentation, and the occasional stubborn bug that refuses to be fixed until I understand it properly.',
  approach:
    'I start by understanding the problem before choosing the tools. I break work into small, testable pieces, keep the codebase readable, and check the experience on real devices and slow connections. When something does not work, I isolate it, learn from it, and document what changed.\n\nI would rather build a smaller feature properly than ship a large one I cannot explain.',
  goals:
    'My goal is to keep growing into a well-rounded developer — stronger foundations in software design, testing, and deployment, and more experience shipping real products with real users. I’m open to junior opportunities, internships, and collaborative projects where I can contribute and learn.',
  email: '',
  location: '',
  github_url: '',
  linkedin_url: '',
  instagram_url: '',
  avatar_url: '',
  resume_url: '',
  availability: 'Open to opportunities and collaborative projects',
};

const skillGroups = {
  'Programming Languages': ['HTML', 'CSS', 'JavaScript', 'PHP', 'Python', 'SQL', 'Dart'],
  Frontend: ['React', 'Vue.js', 'Vite', 'Tailwind CSS', 'Responsive web design'],
  Backend: ['Node.js', 'Express.js', 'Laravel', 'PHP', 'REST APIs'],
  Databases: ['MySQL', 'PostgreSQL', 'Supabase'],
  'Mobile & Desktop': ['Flutter', 'Dart', 'Android Studio'],
  'Development Tools': ['VS Code', 'Git', 'GitHub', 'XAMPP', 'npm', 'Figma', 'Android Studio'],
  'Additional Skills': [
    'UI/UX design',
    'Prototyping',
    'Database design',
    'Debugging',
    'Testing',
    'Deployment',
    'Hosting',
    'Version control',
  ],
};

export const demoSkills = Object.entries(skillGroups).flatMap(([category, names], groupIndex) =>
  names.map((name, index) => ({
    id: `demo-skill-${groupIndex}-${index}`,
    category,
    name,
    sort_order: groupIndex * 100 + index,
  }))
);

export const demoCategories = [
  { id: 'demo-cat-1', name: 'Web Applications', slug: 'web-applications', sort_order: 1 },
  { id: 'demo-cat-2', name: 'Mobile Applications', slug: 'mobile-applications', sort_order: 2 },
  { id: 'demo-cat-3', name: 'Desktop Applications', slug: 'desktop-applications', sort_order: 3 },
  { id: 'demo-cat-4', name: 'UI/UX Design', slug: 'ui-ux-design', sort_order: 4 },
  { id: 'demo-cat-5', name: 'Other', slug: 'other', sort_order: 5 },
];

export const demoProjects = [
  {
    id: 'demo-project-1',
    slug: 'ledger',
    title: 'Ledger',
    summary:
      'A calm personal finance dashboard for tracking spending, budgets, and monthly trends without the noise.',
    description:
      'Ledger is a sample project entry used to preview this portfolio. It explores how a small finance dashboard can stay readable while surfacing the numbers that matter.\n\nThe interface focuses on a single monthly view, clear categorisation, and a spending chart that does not require a tutorial. The project is structured as a React front end with a small API layer and a relational database schema.\n\nReplace this entry with your own project in the admin dashboard, or delete it once you are ready to publish your real work.',
    category: 'Web Applications',
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    features: [
      'Monthly spending overview with category breakdown',
      'Budget targets and simple progress indicators',
      'Responsive layout designed for desktop and mobile',
      'REST API with validation and error handling',
    ],
    status: 'completed',
    published: true,
    featured: true,
    thumbnail_url: '/demo/cover-ledger.svg',
    live_url: '',
    github_url: '',
    created_at: '2025-11-18T10:00:00.000Z',
    updated_at: '2025-11-18T10:00:00.000Z',
    isDemo: true,
    media: [
      {
        id: 'demo-media-1',
        project_id: 'demo-project-1',
        media_type: 'image',
        url: '/demo/cover-ledger.svg',
        alt_text: 'Ledger dashboard cover',
        sort_order: 1,
      },
    ],
  },
  {
    id: 'demo-project-2',
    slug: 'fieldnote',
    title: 'Fieldnote',
    summary:
      'An offline-first notes app for capturing observations in the field, built with Flutter and Supabase.',
    description:
      'Fieldnote is a sample project entry used to preview this portfolio. It imagines a small mobile app for researchers, students, or anyone who needs to capture notes without a reliable connection.\n\nThe app keeps a local copy of every note and syncs when a connection returns. The focus is on fast entry, clear organisation, and a sync state the user can actually understand.\n\nReplace this entry with your own project in the admin dashboard.',
    category: 'Mobile Applications',
    technologies: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL'],
    features: [
      'Create and organise notes with tags',
      'Offline-first local storage and background sync',
      'Simple sync status and conflict feedback',
      'Clean, touch-friendly mobile interface',
    ],
    status: 'in-progress',
    published: true,
    featured: true,
    thumbnail_url: '/demo/cover-fieldnote.svg',
    live_url: '',
    github_url: '',
    created_at: '2025-10-04T10:00:00.000Z',
    updated_at: '2025-10-04T10:00:00.000Z',
    isDemo: true,
    media: [
      {
        id: 'demo-media-2',
        project_id: 'demo-project-2',
        media_type: 'image',
        url: '/demo/cover-fieldnote.svg',
        alt_text: 'Fieldnote mobile app cover',
        sort_order: 1,
      },
    ],
  },
  {
    id: 'demo-project-3',
    slug: 'studio-index',
    title: 'Studio Index',
    summary:
      'A flexible case-study layout system for a small design studio, from wireframes to a responsive build.',
    description:
      'Studio Index is a sample project entry used to preview this portfolio. It is a UI/UX and front-end exercise: a modular case-study layout that stays consistent across wildly different project types.\n\nThe design process started with content inventories and low-fidelity wireframes, then moved into a small type and spacing system before any component code was written. The result is a set of composable sections that can be rearranged without breaking the reading experience.\n\nReplace this entry with your own project in the admin dashboard.',
    category: 'UI/UX Design',
    technologies: ['Figma', 'React', 'Tailwind CSS', 'Vite'],
    features: [
      'Reusable case-study section system',
      'Type, spacing, and colour tokens',
      'Responsive editorial layouts',
      'Accessible focus and navigation states',
    ],
    status: 'completed',
    published: true,
    featured: false,
    thumbnail_url: '/demo/cover-index.svg',
    live_url: '',
    github_url: '',
    created_at: '2025-08-21T10:00:00.000Z',
    updated_at: '2025-08-21T10:00:00.000Z',
    isDemo: true,
    media: [
      {
        id: 'demo-media-3',
        project_id: 'demo-project-3',
        media_type: 'image',
        url: '/demo/cover-index.svg',
        alt_text: 'Studio Index cover',
        sort_order: 1,
      },
    ],
  },
];

export const demoData = {
  profile: demoProfile,
  skills: demoSkills,
  categories: demoCategories,
  projects: demoProjects,
};
