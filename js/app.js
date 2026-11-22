/**
 * SoftHub - Main Application Controller
 * Handles SPA routing, UI rendering, live search, filters, details modal, favorites, and theme engine.
 */

class AppController {
  constructor() {
    this.currentView = 'home';
    this.currentCategory = 'all';
    this.currentSort = 'popular';
    this.searchQuery = '';
    this.allTools = [];
    this.activeFilter = 'all'; // 'all', 'popular', 'recent', 'favorites'
    this.currentTheme = localStorage.getItem('softhub_theme') || window.CONFIG?.defaultTheme || 'dark';
    this.init();
  }

  async init() {
    this.applyTheme(this.currentTheme);
    await window.db.readyPromise;
    await this.refreshData();

    // Setup navigation listeners
    window.addEventListener('hashchange', () => this.handleHashRoute());
    this.handleHashRoute();

    // Setup Auth state listener
    window.auth.onAuthStateChanged(user => this.handleAuthState(user));

    // Setup Category buttons in hero/explore
    this.renderCategoryChips();

    // Populate category dropdown in tool form
    this.populateCategorySelect();

    // Setup auto-discovery banner click
    const quickDiscoverBtn = document.getElementById('hero-quick-discover');
    if (quickDiscoverBtn) {
      quickDiscoverBtn.addEventListener('click', () => {
        this.navigateTo('explore');
      });
    }

    console.log('[SoftHub] App initialized successfully with', this.allTools.length, 'tools.');
  }

  async refreshData() {
    this.allTools = await window.db.getAllTools();
    this.renderCurrentView();
  }

  // --- THEME MANAGEMENT ---

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('softhub_theme', theme);
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Update toggle icons
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' 
        ? `<svg class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  // --- ROUTING & NAVIGATION ---

  handleHashRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const [view, param] = hash.split('/');

    if (['home', 'explore', 'categories', 'dashboard', 'admin', 'about', 'contact'].includes(view)) {
      this.currentView = view;
    } else if (view === 'tool' && param) {
      this.openToolModal(param);
      return;
    } else {
      this.currentView = 'home';
    }

    this.updateActiveNavLinks();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateTo(view, param = null) {
    if (param) {
      window.location.hash = `#${view}/${param}`;
    } else {
      window.location.hash = `#${view}`;
    }
  }

  updateActiveNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
      const target = link.getAttribute('data-view');
      if (target === this.currentView) {
        link.classList.add('nav-active');
      } else {
        link.classList.remove('nav-active');
      }
    });

    // Toggle views visibility
    const views = ['home', 'explore', 'categories', 'dashboard', 'admin', 'about', 'contact'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === this.currentView) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });
  }

  renderCurrentView() {
    if (this.currentView === 'home') {
      this.renderHomeView();
    } else if (this.currentView === 'explore') {
      this.renderExploreView();
    } else if (this.currentView === 'categories') {
      this.renderCategoriesView();
    } else if (this.currentView === 'dashboard') {
      this.renderDashboardView();
    } else if (this.currentView === 'admin') {
      window.admin.render();
    }
  }

  // --- AUTH UI STATE ---

  handleAuthState(user) {
    const authContainer = document.getElementById('header-auth-section');
    if (!authContainer) return;

    if (user) {
      authContainer.innerHTML = `
        <div class="flex items-center gap-3">
          ${user.role === 'admin' ? `
            <button onclick="window.app.navigateTo('admin')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Admin
            </button>
          ` : ''}

          <button onclick="window.app.navigateTo('dashboard')" class="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition" title="Go to Dashboard">
            <img src="${user.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + user.email}" class="w-6 h-6 rounded-full object-cover" alt="${user.name}"/>
            <span class="text-xs font-medium text-white max-w-[100px] truncate">${user.name}</span>
          </button>

          <button onclick="window.auth.logout()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition" title="Sign Out">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <div class="flex items-center gap-2">
          <button onclick="window.app.openAuthModal('login')" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition">
            Sign In
          </button>
          <button onclick="window.app.openAuthModal('register')" class="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-medium">
            Get Started
          </button>
        </div>
      `;
    }

    if (this.currentView === 'dashboard') {
      this.renderDashboardView();
    }
  }

  // --- HOME VIEW RENDERING ---

  async renderHomeView() {
    const popularGrid = document.getElementById('home-popular-tools-grid');
    const allToolsGrid = document.getElementById('home-all-tools-grid');
    if (!popularGrid && !allToolsGrid) return;

    const user = window.auth.getCurrentUser();
    const favs = user ? await window.db.getFavorites(user.id) : [];

    if (popularGrid) {
      const popularTools = this.allTools
        .filter(t => t.isPopular || t.isFeatured);
      popularGrid.innerHTML = popularTools.map(tool => this.createToolCardHtml(tool, favs.includes(tool.id))).join('');
    }

    if (allToolsGrid) {
      allToolsGrid.innerHTML = this.allTools.map(tool => this.createToolCardHtml(tool, favs.includes(tool.id))).join('');
    }
  }

  // --- EXPLORE VIEW RENDERING ---

  async renderExploreView() {
    const exploreGrid = document.getElementById('explore-tools-grid');
    const resultsCountEl = document.getElementById('explore-results-count');
    if (!exploreGrid) return;

    let filtered = [...this.allTools];

    // Filter by Category
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(t => t.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    // Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Secondary Filter Chips
    const user = window.auth.getCurrentUser();
    const favs = user ? await window.db.getFavorites(user.id) : [];

    if (this.activeFilter === 'popular') {
      filtered = filtered.filter(t => t.isPopular || (t.views || 0) > 10000);
    } else if (this.activeFilter === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (this.activeFilter === 'favorites') {
      filtered = filtered.filter(t => favs.includes(t.id));
    }

    // Sorting
    if (this.currentSort === 'alpha-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.currentSort === 'alpha-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (this.currentSort === 'views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (this.currentSort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (this.currentSort === 'popular') {
      filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || (b.views || 0) - (a.views || 0));
    }

    if (resultsCountEl) {
      resultsCountEl.innerText = `${filtered.length} tool${filtered.length === 1 ? '' : 's'} available`;
    }

    if (filtered.length === 0) {
      exploreGrid.innerHTML = `
        <div class="col-span-full py-16 text-center glass-card rounded-2xl border border-slate-800/80 p-8">
          <div class="text-4xl mb-3">🔍</div>
          <h3 class="text-lg font-bold text-white mb-1">No Software Found</h3>
          <p class="text-slate-400 text-sm max-w-md mx-auto mb-6">
            We couldn't find any digital tools matching "${this.searchQuery || this.currentCategory}".
          </p>
          <div class="flex items-center justify-center gap-3">
            <button onclick="window.app.resetFilters()" class="btn-primary text-xs px-4 py-2 rounded-xl">
              Reset Filters
            </button>
            <button onclick="window.app.openAutoImportModal()" class="glass-btn text-xs px-4 py-2 rounded-xl text-cyan-400 border-cyan-500/30">
              ⚡ Auto-Add This Website
            </button>
          </div>
        </div>
      `;
      return;
    }

    exploreGrid.innerHTML = filtered.map(tool => this.createToolCardHtml(tool, favs.includes(tool.id))).join('');
  }

  // --- CATEGORIES VIEW RENDERING ---

  renderCategoriesView() {
    const container = document.getElementById('categories-grid-container');
    if (!container) return;

    const categories = window.CONFIG.categories.filter(c => c.id !== 'all');
    container.innerHTML = categories.map(cat => {
      const count = this.allTools.filter(t => t.category.toLowerCase() === cat.name.toLowerCase()).length;
      return `
        <div onclick="window.app.filterByCategory('${cat.name}')" class="category-card group glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition transform hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center p-2.5 shadow-lg mb-4 group-hover:scale-110 transition duration-300">
            ${cat.icon}
          </div>
          <h3 class="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition">${cat.name}</h3>
          <p class="text-xs text-slate-400 mb-4 line-clamp-2">${cat.description}</p>
          <div class="flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
            <span class="text-slate-400 font-medium">${count} platforms</span>
            <span class="text-blue-400 font-semibold group-hover:translate-x-1 transition inline-flex items-center gap-1">
              Explore <span>→</span>
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- DASHBOARD VIEW RENDERING ---

  async renderDashboardView() {
    const dashboardContainer = document.getElementById('dashboard-content-area');
    if (!dashboardContainer) return;

    const user = window.auth.getCurrentUser();
    if (!user) {
      dashboardContainer.innerHTML = `
        <div class="glass-card p-12 text-center max-w-md mx-auto my-12 rounded-2xl border border-slate-800">
          <div class="text-4xl mb-4">👤</div>
          <h2 class="text-2xl font-bold text-white mb-2">Welcome to Your SoftHub</h2>
          <p class="text-slate-400 text-sm mb-6">
            Sign in or create an account to bookmark your favorite tools, view your access history, and customize your software dashboard.
          </p>
          <div class="flex flex-col gap-3">
            <button onclick="window.app.openAuthModal('login')" class="btn-primary py-2.5 rounded-xl font-medium text-sm">
              Sign In
            </button>
            <button onclick="window.app.openAuthModal('register')" class="glass-btn py-2.5 rounded-xl font-medium text-sm text-slate-300">
              Create Free Account
            </button>
          </div>
        </div>
      `;
      return;
    }

    const favIds = await window.db.getFavorites(user.id);
    const favoriteTools = this.allTools.filter(t => favIds.includes(t.id));
    const recents = await window.db.getRecents(user.id);

    dashboardContainer.innerHTML = `
      <div class="space-y-10 animate-fadeIn">
        <!-- User Profile Banner -->
        <div class="glass-card p-6 md:p-8 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-blue-950/20 via-slate-900/60 to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <img src="${user.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + user.email}" class="w-16 h-16 rounded-2xl border-2 border-blue-500/40 object-cover shadow-lg" alt="${user.name}"/>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-extrabold text-white">${user.name}</h1>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}">
                  ${user.role}
                </span>
              </div>
              <p class="text-slate-400 text-xs mt-0.5">${user.email}</p>
              <p class="text-slate-500 text-[11px] mt-1">Member since ${user.createdAt || '2026'}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-center px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div class="text-xl font-bold text-white">${favoriteTools.length}</div>
              <div class="text-[11px] text-slate-400 uppercase tracking-wider">Favorites</div>
            </div>
            <div class="text-center px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div class="text-xl font-bold text-white">${recents.length}</div>
              <div class="text-[11px] text-slate-400 uppercase tracking-wider">Visited</div>
            </div>
          </div>
        </div>

        <!-- Saved Favorites Section -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-rose-500 text-lg">♥</span>
              <h2 class="text-xl font-bold text-white">Your Saved Favorites (${favoriteTools.length})</h2>
            </div>
            <button onclick="window.app.navigateTo('explore')" class="text-xs text-blue-400 hover:text-blue-300 font-medium">
              Browse More Tools →
            </button>
          </div>

          ${favoriteTools.length === 0 ? `
            <div class="glass-card p-8 rounded-2xl border border-slate-800/80 text-center">
              <p class="text-slate-400 text-sm mb-3">You haven't bookmarked any software tools yet.</p>
              <button onclick="window.app.navigateTo('explore')" class="btn-primary text-xs px-4 py-2 rounded-xl">
                Explore Software Directory
              </button>
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              ${favoriteTools.map(t => this.createToolCardHtml(t, true)).join('')}
            </div>
          `}
        </div>

        <!-- Recently Visited Tools Section -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <h2 class="text-xl font-bold text-white">Recently Accessed Software</h2>
            </div>
          </div>

          ${recents.length === 0 ? `
            <div class="glass-card p-6 rounded-2xl border border-slate-800/80 text-center text-slate-400 text-xs">
              No recent tool activity recorded yet. Clicking "Open Website" on any tool will automatically track it here.
            </div>
          ` : `
            <div class="glass-card rounded-2xl border border-slate-800/80 overflow-hidden divide-y divide-slate-800/60">
              ${recents.slice(0, 8).map(rec => {
                const tool = this.allTools.find(t => t.id === rec.toolId);
                if (!tool) return '';
                return `
                  <div class="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 bg-slate-800/80 border border-slate-700/60" style="color: ${tool.color || '#3B82F6'}">
                        ${tool.icon || '<span>★</span>'}
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-white">${tool.name}</div>
                        <div class="text-xs text-slate-400">${rec.visitedAt}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button onclick="window.app.openToolModal('${tool.id}')" class="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60">
                        Details
                      </button>
                      <button onclick="window.app.launchWebsite('${tool.id}', '${tool.url}')" class="btn-primary text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                        Open <span>↗</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  // --- TOOL CARD HTML BUILDER ---

  createToolCardHtml(tool, isFav = false) {
    const safeColor = tool.color || '#3B82F6';
    return `
      <div class="tool-card group glass-card rounded-2xl border border-slate-800/80 hover:border-slate-700 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative" data-tool-id="${tool.id}">
        <!-- Top row: Logo, Category, and Favorite Button -->
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center p-2 bg-slate-900/90 border border-slate-700/60 shadow-md group-hover:scale-105 transition shrink-0" style="color: ${safeColor}">
                ${tool.icon || '<span class="text-base font-bold text-white">' + tool.name[0] + '</span>'}
              </div>
              <div>
                <h4 class="font-bold text-white text-base group-hover:text-blue-400 transition cursor-pointer" onclick="window.app.openToolModal('${tool.id}')">
                  ${tool.name}
                </h4>
                <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/40">
                  ${tool.category}
                </span>
              </div>
            </div>

            <!-- Favorite Toggle Button -->
            <button 
              onclick="window.app.toggleFavorite('${tool.id}', this, event)" 
              class="fav-btn p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition ${isFav ? 'text-rose-500' : ''}" 
              title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
            >
              <svg class="w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'fill-none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <!-- Description -->
          <p class="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2 cursor-pointer" onclick="window.app.openToolModal('${tool.id}')">
            ${tool.description || 'Explore features and launch the official web portal.'}
          </p>

          <!-- Key Features Chips -->
          ${tool.features && tool.features.length > 0 ? `
            <div class="flex flex-wrap gap-1.5 mb-4">
              ${tool.features.slice(0, 2).map(f => `
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-400 border border-slate-800">
                  ${f}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Bottom Actions -->
        <div class="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
          <button 
            onclick="window.app.openToolModal('${tool.id}')" 
            class="text-xs text-slate-400 hover:text-white font-medium transition py-1"
          >
            Details
          </button>

          <a 
            href="${tool.url}" 
            target="_blank" 
            rel="noopener noreferrer" 
            onclick="window.app.trackLaunch('${tool.id}')"
            class="btn-primary text-xs px-3.5 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5 group-hover:shadow-blue-500/20"
          >
            <span>Open ${tool.name}</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
          </a>
        </div>
      </div>
    `;
  }

  // --- ACTIONS: LAUNCH, FAVORITE, MODAL ---

  trackLaunch(toolId) {
    if (window.db) {
      window.db.incrementToolViews(toolId);
      const user = window.auth ? window.auth.getCurrentUser() : null;
      if (user) {
        window.db.addRecent(user.id, toolId);
      }
    }
  }

  async launchWebsite(toolId, url) {
    this.trackLaunch(toolId);
    window.open(url, '_blank', 'noopener,noreferrer');
  }


  async toggleFavorite(toolId, btnEl, event) {
    if (event) event.stopPropagation();

    const user = window.auth.getCurrentUser();
    if (!user) {
      this.showToast('Please sign in to save tools to your favorites.');
      this.openAuthModal('login');
      return;
    }

    const isFavNow = await window.db.toggleFavorite(user.id, toolId);
    const icon = btnEl.querySelector('svg');
    if (icon) {
      if (isFavNow) {
        icon.classList.add('fill-rose-500', 'text-rose-500');
        icon.classList.remove('fill-none');
        btnEl.classList.add('text-rose-500');
        this.showToast('Added to your favorites!');
      } else {
        icon.classList.remove('fill-rose-500', 'text-rose-500');
        icon.classList.add('fill-none');
        btnEl.classList.remove('text-rose-500');
        this.showToast('Removed from favorites.');
      }
    }

    if (this.currentView === 'dashboard') {
      this.renderDashboardView();
    }
  }

  async openToolModal(toolId) {
    const tool = await window.db.getToolById(toolId);
    if (!tool) return;

    const modal = document.getElementById('software-details-modal');
    const content = document.getElementById('software-details-content');
    if (!modal || !content) return;

    const user = window.auth.getCurrentUser();
    const isFav = user ? await window.db.isFavorite(user.id, tool.id) : false;

    // Find similar tools (same category, excluding this one)
    const similarTools = this.allTools
      .filter(t => t.category === tool.category && t.id !== tool.id)
      .slice(0, 4);

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center p-3 bg-slate-900 border border-slate-700 shadow-xl shrink-0" style="color: ${tool.color || '#3B82F6'}">
              ${tool.icon || '<span class="text-2xl font-bold">' + tool.name[0] + '</span>'}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-2xl font-extrabold text-white">${tool.name}</h2>
                ${tool.isPopular ? '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Popular</span>' : ''}
              </div>
              <div class="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                  ${tool.category}
                </span>
                <span class="text-amber-400 font-semibold">★ ${tool.rating || 4.8} / 5.0</span>
                <span>•</span>
                <span class="font-mono">${(tool.views || 0).toLocaleString()} visits</span>
              </div>
            </div>
          </div>
          <button onclick="window.app.closeToolModal()" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition">
            ✕
          </button>
        </div>

        <!-- Description -->
        <div class="text-slate-300 text-sm leading-relaxed">
          <p class="mb-3">${tool.longDescription || tool.description}</p>
        </div>

        <!-- Key Features List -->
        ${tool.features && tool.features.length > 0 ? `
          <div>
            <h4 class="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2.5">Key Capabilities & Features</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${tool.features.map(f => `
                <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>${f}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Official Launch & Bookmark Bar -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-purple-950/30 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div class="text-xs font-semibold text-white">Direct Official Platform Access</div>
            <div class="text-[11px] text-slate-400 truncate max-w-xs">${tool.url}</div>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button onclick="window.app.toggleFavorite('${tool.id}', this, event)" class="glass-btn px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-400 flex items-center gap-2 ${isFav ? 'text-rose-500' : ''}">
              <span>♥</span>
              <span>${isFav ? 'Bookmarked' : 'Favorite'}</span>
            </button>
            <button onclick="window.app.launchWebsite('${tool.id}', '${tool.url}')" class="btn-primary flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2">
              <span>Open Official Website</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
            </button>
          </div>
        </div>

        <!-- Similar / Alternative Tools -->
        ${similarTools.length > 0 ? `
          <div>
            <h4 class="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-3">Similar Tools & Alternatives in ${tool.category}</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${similarTools.map(sim => `
                <div onclick="window.app.openToolModal('${sim.id}')" class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition text-center group">
                  <div class="w-9 h-9 mx-auto rounded-lg flex items-center justify-center p-1.5 bg-slate-800 mb-2" style="color: ${sim.color || '#3B82F6'}">
                    ${sim.icon || '<span>★</span>'}
                  </div>
                  <div class="text-xs font-bold text-white group-hover:text-blue-400 transition truncate">${sim.name}</div>
                  <div class="text-[10px] text-slate-500">★ ${sim.rating || 4.8}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.remove('hidden');
  }

  closeToolModal() {
    const modal = document.getElementById('software-details-modal');
    if (modal) modal.classList.add('hidden');
    if (window.location.hash.startsWith('#tool/')) {
      window.location.hash = `#${this.currentView}`;
    }
  }

  // --- FILTERS & SEARCH ---

  filterByCategory(catName) {
    this.currentCategory = catName === 'All Categories' ? 'all' : catName;
    this.navigateTo('explore');
    this.updateCategoryChipStates();
    this.renderExploreView();
  }

  handleSearchInput(value) {
    this.searchQuery = value;
    if (this.currentView !== 'explore') {
      this.navigateTo('explore');
    } else {
      this.renderExploreView();
    }
  }

  handleHeroSearchInput(value) {
    const dropdown = document.getElementById('hero-search-dropdown');
    if (!dropdown) return;

    const q = value.toLowerCase().trim();
    if (!q) {
      dropdown.classList.add('hidden');
      return;
    }

    const matches = this.allTools.filter(t => 
      t.name.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q))
    ).slice(0, 6);

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div class="p-4 text-center text-xs text-slate-400">
          No matches found for "${value}". 
          <button onclick="window.app.openAutoImportModal('${value}')" class="text-cyan-400 hover:underline block mx-auto mt-1">
            ⚡ Auto-add this website to SoftHub
          </button>
        </div>
      `;
    } else {
      dropdown.innerHTML = matches.map(t => `
        <div onclick="window.app.openToolModal('${t.id}')" class="p-3 flex items-center justify-between hover:bg-slate-800/60 cursor-pointer transition border-b border-slate-800/40 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center p-1 bg-slate-900 border border-slate-700/60" style="color: ${t.color || '#3B82F6'}">
              ${t.icon || '<span>★</span>'}
            </div>
            <div>
              <div class="text-xs font-bold text-white">${t.name}</div>
              <div class="text-[10px] text-slate-400">${t.category}</div>
            </div>
          </div>
          <span class="text-xs text-blue-400">View →</span>
        </div>
      `).join('');
    }

    dropdown.classList.remove('hidden');
  }

  setSort(sortValue) {
    this.currentSort = sortValue;
    this.renderExploreView();
  }

  setActiveFilter(filterName) {
    this.activeFilter = filterName;
    document.querySelectorAll('.filter-chip').forEach(btn => {
      if (btn.getAttribute('data-filter') === filterName) {
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('glass-btn', 'text-slate-400');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('glass-btn', 'text-slate-400');
      }
    });
    this.renderExploreView();
  }

  resetFilters() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.activeFilter = 'all';
    const searchInput = document.getElementById('explore-search-input');
    if (searchInput) searchInput.value = '';
    const heroSearch = document.getElementById('hero-search-input');
    if (heroSearch) heroSearch.value = '';
    this.updateCategoryChipStates();
    this.renderExploreView();
  }

  // --- CATEGORY CHIPS RENDERING ---

  renderCategoryChips() {
    const container = document.getElementById('category-chips-carousel');
    if (!container) return;

    container.innerHTML = window.CONFIG.categories.map(cat => `
      <button 
        onclick="window.app.filterByCategory('${cat.name}')" 
        class="category-chip shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-2 border border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:text-white"
        data-category="${cat.name}"
      >
        <span class="w-4 h-4">${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `).join('');

    this.updateCategoryChipStates();
  }

  updateCategoryChipStates() {
    document.querySelectorAll('.category-chip').forEach(chip => {
      const cat = chip.getAttribute('data-category');
      const isSelected = (this.currentCategory === 'all' && cat === 'All Categories') || (this.currentCategory.toLowerCase() === cat.toLowerCase());
      if (isSelected) {
        chip.classList.add('bg-blue-600', 'text-white', 'border-blue-500');
        chip.classList.remove('bg-slate-900/60', 'text-slate-300', 'border-slate-800/80');
      } else {
        chip.classList.remove('bg-blue-600', 'text-white', 'border-blue-500');
        chip.classList.add('bg-slate-900/60', 'text-slate-300', 'border-slate-800/80');
      }
    });
  }

  populateCategorySelect() {
    const selects = [document.getElementById('tool-form-category'), document.getElementById('auto-import-category-override')];
    selects.forEach(select => {
      if (!select) return;
      const categories = window.CONFIG.categories.filter(c => c.id !== 'all');
      select.innerHTML = categories.map(c => `
        <option value="${c.name}">${c.name}</option>
      `).join('');
    });
  }

  // --- AUTO-IMPORT MODAL ---

  openAutoImportModal(prefillUrl = '') {
    const modal = document.getElementById('auto-import-modal');
    if (!modal) return;
    const input = document.getElementById('auto-import-url-input');
    if (input && prefillUrl) input.value = prefillUrl;
    modal.classList.remove('hidden');
  }

  closeAutoImportModal() {
    const modal = document.getElementById('auto-import-modal');
    if (modal) modal.classList.add('hidden');
  }

  async handleUserAutoImport(event) {
    event.preventDefault();
    const input = document.getElementById('auto-import-url-input');
    const btn = document.getElementById('auto-import-submit-btn');
    const msg = document.getElementById('auto-import-modal-status');
    const url = input.value.trim();

    if (!url) return;

    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-1">⌛</span> Auto-Ingesting...`;
    msg.innerHTML = `<span class="text-cyan-400">Scraping website meta & assigning category...</span>`;

    try {
      const tool = await window.autoImporter.ingestWebsite(url);
      msg.innerHTML = `<span class="text-emerald-400 font-medium">✓ Successfully added "${tool.name}"!</span>`;
      this.showToast(`✓ "${tool.name}" has been added to SoftHub!`);
      await this.refreshData();
      setTimeout(() => {
        this.closeAutoImportModal();
        this.openToolModal(tool.id);
      }, 700);
    } catch (err) {
      msg.innerHTML = `<span class="text-rose-400">❌ ${err.message}</span>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = `Auto-Add Website`;
    }
  }

  // --- AUTH MODALS ---

  openAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    this.switchAuthMode(mode);
    modal.classList.remove('hidden');
  }

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
  }

  switchAuthMode(mode) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const modalTitle = document.getElementById('auth-modal-title');
    const modalSub = document.getElementById('auth-modal-subtitle');
    const errBox = document.getElementById('auth-error-message');

    if (errBox) errBox.classList.add('hidden');

    if (mode === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      modalTitle.innerText = 'Welcome Back';
      modalSub.innerText = 'Sign in to access your dashboard and saved tools.';
    } else {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      modalTitle.innerText = 'Create an Account';
      modalSub.innerText = 'Join SoftHub to curate your personalized software hub.';
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const errBox = document.getElementById('auth-error-message');

    try {
      await window.auth.login(email, pass);
      this.closeAuthModal();
      this.showToast(`Welcome back, ${window.auth.getCurrentUser().name}!`);
    } catch (err) {
      if (errBox) {
        errBox.innerText = err.message;
        errBox.classList.remove('hidden');
      }
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const pass = document.getElementById('register-password').value;
    const errBox = document.getElementById('auth-error-message');

    try {
      await window.auth.register(name, email, pass);
      this.closeAuthModal();
      this.showToast(`Welcome to SoftHub, ${name}! Your account has been created.`);
    } catch (err) {
      if (errBox) {
        errBox.innerText = err.message;
        errBox.classList.remove('hidden');
      }
    }
  }

  // --- TOAST NOTIFICATIONS ---

  showToast(message, duration = 3000) {
    let toast = document.getElementById('softhub-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'softhub-toast';
      toast.className = 'fixed bottom-6 right-6 z-50 glass-card px-5 py-3 rounded-2xl border border-blue-500/30 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 transform transition-all duration-300 translate-y-20 opacity-0 pointer-events-none';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
      <span>${message}</span>
    `;

    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, duration);
  }
}

window.app = new AppController();
