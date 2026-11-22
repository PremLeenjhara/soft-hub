/**
 * SoftHub - Automated Website & Software Ingestion Engine
 * Enables automatic discovery, metadata extraction, categorizing, and ingestion of future web tools.
 */

class AutoImporter {
  constructor() {
    // Intelligent keyword mapping for automatic category inference
    this.categoryKeywords = {
      'AI Tools': ['ai', 'gpt', 'llm', 'bot', 'intelligence', 'neural', 'model', 'claude', 'copilot', 'deep', 'machine', 'prompt', 'generate'],
      'Video & Streaming': ['video', 'stream', 'movie', 'tv', 'watch', 'cast', 'broadcast', 'cinema', 'clip', 'tube', 'screen', 'play'],
      'Graphic Design': ['design', 'graphic', 'ui', 'ux', 'vector', 'art', 'draw', 'sketch', 'font', 'logo', 'icon', 'color', 'palette', 'canvas', '3d', 'render'],
      'Productivity': ['productivity', 'note', 'task', 'doc', 'sheet', 'calendar', 'wiki', 'todo', 'organize', 'project', 'plan', 'focus', 'agenda'],
      'Social Media': ['social', 'network', 'community', 'feed', 'post', 'friends', 'follow', 'share', 'connect', 'forum', 'profile'],
      'Music & Audio': ['music', 'audio', 'sound', 'song', 'listen', 'podcast', 'track', 'radio', 'beat', 'voice', 'synthesizer'],
      'Communication': ['chat', 'message', 'call', 'talk', 'meet', 'conference', 'huddle', 'discuss', 'email', 'inbox', 'text'],
      'Developer Tools': ['dev', 'developer', 'code', 'git', 'repo', 'api', 'deploy', 'terminal', 'host', 'sdk', 'debug', 'database', 'stack', 'cloud'],
      'Cloud Storage': ['cloud', 'storage', 'drive', 'backup', 'box', 'sync', 'file', 'share', 'vault'],
      'Business Tools': ['business', 'finance', 'accounting', 'crm', 'sales', 'invoice', 'marketing', 'analytics', 'stripe', 'money', 'hr', 'hire'],
      'Education': ['learn', 'study', 'course', 'academy', 'degree', 'teach', 'school', 'skill', 'tutorial', 'quiz', 'class'],
      'Entertainment': ['game', 'play', 'fun', 'arcade', 'quiz', 'comic', 'anime', 'esport', 'steam']
    };

    // Pre-curated pool of emerging future tools for automatic discovery feed
    this.futureDiscoveryPool = [
      {
        name: 'Perplexity AI',
        url: 'https://www.perplexity.ai',
        category: 'AI Tools',
        description: 'AI-powered conversational answer engine with direct citations and real-time web search.',
        features: ['Real-Time Web Citations', 'Pro Search Deep Reasoning', 'Collections and File Analysis', 'Copilot Interactive Research', 'API Access'],
        tags: ['ai', 'search', 'citations', 'research', 'assistant'],
        color: '#20B2AA'
      },
      {
        name: 'Cursor',
        url: 'https://www.cursor.com',
        category: 'Developer Tools',
        description: 'The AI-first code editor built for lightning-fast pair programming and codebase querying.',
        features: ['Full Codebase Context AI', 'Inline Multi-line Edits', 'Terminal Command Generator', 'VS Code Extension Compatible', 'Privacy Mode'],
        tags: ['ai', 'coding', 'editor', 'developer', 'ide'],
        color: '#000000'
      },
      {
        name: 'Linear',
        url: 'https://linear.app',
        category: 'Productivity',
        description: 'The purpose-built modern tool for high-performance software teams and issue tracking.',
        features: ['Real-time Fast Synchronization', 'Keyboard-First Navigation', 'Cycles and Roadmaps', 'Git Branch Integrations', 'Insights & Velocity Metrics'],
        tags: ['project-management', 'issues', 'sprints', 'engineering', 'teams'],
        color: '#5E6AD2'
      },
      {
        name: 'ElevenLabs',
        url: 'https://elevenlabs.io',
        category: 'AI Tools',
        description: 'Industry-leading generative voice AI and speech synthesis platform in hundreds of languages.',
        features: ['Hyper-Realistic Voice Cloning', 'Text-to-Speech in 29+ Languages', 'Dubbing & Audio Translation', 'Sound Effects Generator', 'Voice Isolator'],
        tags: ['ai', 'voice', 'audio', 'tts', 'speech'],
        color: '#000000'
      },
      {
        name: 'Supabase',
        url: 'https://supabase.com',
        category: 'Developer Tools',
        description: 'Open source Firebase alternative: Postgres database, Auth, Instant APIs, Realtime, and Storage.',
        features: ['Full Postgres SQL Database', 'Row Level Security & Auth', 'Realtime Subscriptions', 'Auto-Generated REST & GraphQL APIs', 'Edge Functions'],
        tags: ['database', 'postgres', 'backend', 'auth', 'developer'],
        color: '#3ECF8E'
      },
      {
        name: 'Midjourney',
        url: 'https://www.midjourney.com',
        category: 'Graphic Design',
        description: 'Independent research lab exploring new mediums of thought and artistic generative visual AI.',
        features: ['Photorealistic Image Generation', 'Style Reference & Tuning', 'Web Editor & Canvas Inpainting', 'High Dynamic Range & Upcaling', 'Community Showcase'],
        tags: ['ai', 'art', 'image-generation', 'creative', 'design'],
        color: '#1E293B'
      },
      {
        name: 'Raycast',
        url: 'https://www.raycast.com',
        category: 'Productivity',
        description: 'Blazingly fast, extensible launcher for controlling your tools, clipboard, and AI shortcuts.',
        features: ['Instant Keyboard Launcher', 'Custom Raycast AI Models', 'Clipboard History & Snippets', 'Thousands of Community Extensions', 'Window Management'],
        tags: ['launcher', 'shortcuts', 'productivity', 'mac', 'workflow'],
        color: '#FF6363'
      },
      {
        name: 'Duolingo',
        url: 'https://www.duolingo.com',
        category: 'Education',
        description: 'The world’s most popular language-learning platform with gamified bite-sized lessons.',
        features: ['40+ Language Courses', 'Bite-Sized Gamified Lessons', 'Streaks & Leaderboard Competition', 'Duolingo Max AI Roleplay', 'Pronunciation Analysis'],
        tags: ['languages', 'learning', 'education', 'gamified', 'vocab'],
        color: '#58CC02'
      }
    ];
  }

  /**
   * Normalizes URL or domain string
   */
  cleanUrl(input) {
    if (!input) return '';
    let url = input.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }

  /**
   * Extracts clean domain and hostname
   */
  extractDomain(urlStr) {
    try {
      const parsed = new URL(this.cleanUrl(urlStr));
      return parsed.hostname.replace(/^www\./, '');
    } catch (e) {
      return urlStr.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  }

  /**
   * Derives human-friendly name from domain
   */
  deriveNameFromDomain(domain) {
    const parts = domain.split('.');
    const main = parts[0] || 'Tool';
    // Capitalize words nicely
    return main.charAt(0).toUpperCase() + main.slice(1);
  }

  /**
   * Infers category from domain, name, and description text
   */
  inferCategory(text) {
    const lower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          return category;
        }
      }
    }
    return 'Productivity'; // default fallback
  }

  /**
   * Gets an authentic high-resolution icon representation
   */
  getIconUrl(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  /**
   * Extracts metadata for any given website URL or domain
   */
  async extractWebsiteMetadata(inputUrl) {
    const cleanUrl = this.cleanUrl(inputUrl);
    const domain = this.extractDomain(cleanUrl);
    const derivedName = this.deriveNameFromDomain(domain);
    const iconUrl = this.getIconUrl(domain);

    // Default metadata scaffold
    let meta = {
      name: derivedName,
      url: cleanUrl,
      domain: domain,
      iconUrl: iconUrl,
      category: this.inferCategory(domain + ' ' + derivedName),
      description: `${derivedName} is a modern digital platform and online web application accessible at ${domain}.`,
      longDescription: `Explore ${derivedName} on SoftHub. Discover its features, connect to the official portal, and add it to your personal tools dashboard.`,
      features: [
        'Direct Cloud Access via Official Portal',
        'Cross-Platform Web Experience',
        'Secure Authentication and Data Handling',
        'High-Speed Performance & Modern Interface'
      ],
      tags: [derivedName.toLowerCase(), 'web-app', 'tools', 'online']
    };

    // If a local Python helper server is active on localhost:8000, attempt rich OpenGraph extraction
    try {
      const proxyResp = await fetch(`/api/scrape?url=${encodeURIComponent(cleanUrl)}`, {
        signal: AbortSignal.timeout(2000)
      });
      if (proxyResp.ok) {
        const scraped = await proxyResp.json();
        if (scraped.title) meta.name = scraped.title;
        if (scraped.description) meta.description = scraped.description;
        if (scraped.category) meta.category = scraped.category;
      }
    } catch (e) {
      // Local helper server not running or timed out; use robust client-side heuristic metadata
    }

    return meta;
  }

  /**
   * Ingests a new website directly into the SoftHub database
   */
  async ingestWebsite(inputUrl, userOverrides = {}) {
    const meta = await this.extractWebsiteMetadata(inputUrl);
    const existingTools = await window.db.getAllTools();

    // Check for duplicate domain
    const duplicate = existingTools.find(t => {
      const d1 = this.extractDomain(t.url);
      const d2 = meta.domain;
      return d1 === d2 || t.name.toLowerCase() === meta.name.toLowerCase();
    });

    if (duplicate) {
      throw new Error(`The website "${meta.name}" (${meta.domain}) is already listed on SoftHub!`);
    }

    // Merge any user or admin overrides
    const newTool = {
      id: meta.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36),
      name: userOverrides.name || meta.name,
      slug: (userOverrides.name || meta.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: userOverrides.category || meta.category,
      description: userOverrides.description || meta.description,
      longDescription: userOverrides.longDescription || meta.longDescription,
      url: meta.url,
      color: userOverrides.color || '#3B82F6',
      icon: `<img src="${meta.iconUrl}" alt="${meta.name} logo" class="w-full h-full object-contain rounded-lg p-1" onerror="this.src='https://api.dicebear.com/7.x/identicon/svg?seed=${meta.name}'"/>`,
      features: userOverrides.features || meta.features,
      tags: userOverrides.tags || meta.tags,
      isPopular: false,
      isFeatured: false,
      rating: 4.8,
      views: 1,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await window.db.addTool(newTool);
    window.db.recordEvent('tool_auto_imported', { toolId: newTool.id, name: newTool.name, url: newTool.url });

    return newTool;
  }

  /**
   * Scans future discovery pool and auto-adds any unlisted tools
   */
  async autoDiscoverNextTrendingTools(count = 2) {
    const existingTools = await window.db.getAllTools();
    const existingNames = new Set(existingTools.map(t => t.name.toLowerCase()));

    const candidates = this.futureDiscoveryPool.filter(tool => !existingNames.has(tool.name.toLowerCase()));

    if (candidates.length === 0) {
      return { addedCount: 0, tools: [], message: 'All trending future tools have already been discovered and added!' };
    }

    const toAdd = candidates.slice(0, count);
    const added = [];

    for (const item of toAdd) {
      const domain = this.extractDomain(item.url);
      const toolRecord = {
        id: item.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36),
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: item.category,
        description: item.description,
        longDescription: `${item.name} is a high-growth platform discovered automatically by SoftHub's discovery engine.`,
        url: item.url,
        color: item.color,
        icon: `<img src="${this.getIconUrl(domain)}" alt="${item.name} logo" class="w-full h-full object-contain rounded-lg p-1" onerror="this.src='https://api.dicebear.com/7.x/identicon/svg?seed=${item.name}'"/>`,
        features: item.features,
        tags: item.tags,
        isPopular: true,
        isFeatured: false,
        rating: 4.9,
        views: Math.floor(Math.random() * 500) + 100,
        createdAt: new Date().toISOString().split('T')[0]
      };

      await window.db.addTool(toolRecord);
      added.push(toolRecord);
    }

    return {
      addedCount: added.length,
      tools: added,
      message: `Successfully discovered and automatically added ${added.length} new software tool(s): ${added.map(t => t.name).join(', ')}!`
    };
  }
}

window.autoImporter = new AutoImporter();
