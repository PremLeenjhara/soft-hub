/**
 * SoftHub - Application Configuration & Category Definitions
 */
const CONFIG = {
  appName: 'SoftHub',
  appTagline: 'All Your Digital Tools in One Place',
  version: '2.0.0',
  dbName: 'SoftHubDB',
  dbVersion: 1,
  defaultTheme: 'dark',
  defaultAdmin: {
    id: 'admin_root',
    name: 'SoftHub Administrator',
    email: 'admin@softhub.io',
    password: 'admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-01-01'
  },
  categories: [
    {
      id: 'all',
      name: 'All Categories',
      slug: 'all',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Explore all digital software and platforms.'
    },
    {
      id: 'ai-tools',
      name: 'AI Tools',
      slug: 'ai-tools',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>',
      gradient: 'from-emerald-400 to-teal-600',
      description: 'Next-gen LLMs, coding assistants, and machine intelligence.'
    },
    {
      id: 'video-streaming',
      name: 'Video & Streaming',
      slug: 'video-streaming',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
      gradient: 'from-rose-500 to-red-600',
      description: 'Video sharing, movies, television, and live broadcasts.'
    },
    {
      id: 'social-media',
      name: 'Social Media',
      slug: 'social-media',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      gradient: 'from-pink-500 to-purple-600',
      description: 'Connect with communities, friends, trends, and creators.'
    },
    {
      id: 'graphic-design',
      name: 'Graphic Design',
      slug: 'graphic-design',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>',
      gradient: 'from-amber-400 to-orange-600',
      description: 'Vector illustration, UI/UX design, visual mood boards, and media.'
    },
    {
      id: 'productivity',
      name: 'Productivity',
      slug: 'productivity',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      gradient: 'from-cyan-400 to-blue-600',
      description: 'Notepads, collaborative docs, wikis, and task managers.'
    },
    {
      id: 'music-audio',
      name: 'Music & Audio',
      slug: 'music-audio',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      gradient: 'from-green-400 to-emerald-600',
      description: 'Music streaming, podcasts, audiobooks, and sonic discovery.'
    },
    {
      id: 'communication',
      name: 'Communication',
      slug: 'communication',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      gradient: 'from-teal-400 to-cyan-600',
      description: 'Instant messaging, voice calls, encrypted chats, and channels.'
    },
    {
      id: 'business-tools',
      name: 'Business Tools',
      slug: 'business-tools',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      gradient: 'from-blue-600 to-violet-700',
      description: 'Professional networking, project management, and enterprise ops.'
    },
    {
      id: 'developer-tools',
      name: 'Developer Tools',
      slug: 'developer-tools',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      gradient: 'from-violet-500 to-purple-800',
      description: 'Source code repositories, cloud hosting, CI/CD, and web consoles.'
    },
    {
      id: 'cloud-storage',
      name: 'Cloud Storage',
      slug: 'cloud-storage',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
      gradient: 'from-sky-400 to-indigo-500',
      description: 'Cloud backups, file sync, shared drives, and document archives.'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      slug: 'entertainment',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      gradient: 'from-fuchsia-500 to-rose-600',
      description: 'Gaming hubs, interactive media, interactive streams, and pop culture.'
    },
    {
      id: 'education',
      name: 'Education',
      slug: 'education',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
      gradient: 'from-yellow-400 to-amber-600',
      description: 'Online degree courses, certifications, language learning, and tutorials.'
    }
  ]
};

window.CONFIG = CONFIG;
