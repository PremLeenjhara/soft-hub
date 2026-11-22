/**
 * SoftHub - Admin Dashboard Controller
 * Full CRUD for tools, category manager, user management, and real-time analytics.
 */

class AdminController {
  constructor() {
    this.currentEditingToolId = null;
    this.activeTab = 'overview';
  }

  async render() {
    const adminContainer = document.getElementById('admin-content-area');
    if (!adminContainer) return;

    if (!window.auth.isAdmin()) {
      adminContainer.innerHTML = `
        <div class="glass-card p-12 text-center max-w-lg mx-auto my-16 rounded-2xl border border-red-500/30">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl">
            🔒
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p class="text-slate-400 mb-6">
            You must be logged in as an administrator to manage SoftHub listings, categories, and users.
          </p>
          <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 text-left text-sm mb-6">
            <div class="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">Demo Admin Account</div>
            <div class="text-slate-300"><span class="text-slate-500">Email:</span> admin@softhub.io</div>
            <div class="text-slate-300"><span class="text-slate-500">Password:</span> admin</div>
          </div>
          <button onclick="window.app.openAuthModal('login')" class="btn-primary w-full py-3">
            Sign In as Admin
          </button>
        </div>
      `;
      return;
    }

    const summary = await window.db.getAnalyticsSummary();
    const tools = await window.db.getAllTools();
    const users = await window.db.getAllUsers();

    adminContainer.innerHTML = `
      <div class="space-y-8 animate-fadeIn">
        <!-- Admin Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Control Center
            </div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Platform Administration</h1>
            <p class="text-slate-400 text-sm mt-1">Manage software catalog, automated ingestion, registered users, and system analytics.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button onclick="window.admin.openAddToolModal()" class="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add New Software
            </button>
            <button onclick="window.admin.triggerAutoDiscovery()" class="glass-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10">
              <svg class="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              Auto-Discover Trending
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-xs uppercase font-semibold tracking-wider">Total Software</span>
              <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
            </div>
            <div class="text-3xl font-extrabold text-white">${summary.totalTools}</div>
            <div class="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <span>↑ Active in directory</span>
            </div>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-xs uppercase font-semibold tracking-wider">Total Users</span>
              <div class="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
            </div>
            <div class="text-3xl font-extrabold text-white">${summary.totalUsers}</div>
            <div class="text-xs text-purple-400 mt-2">Registered accounts</div>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-xs uppercase font-semibold tracking-wider">Total Clicks / Visits</span>
              <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
              </div>
            </div>
            <div class="text-3xl font-extrabold text-white">${summary.totalViews.toLocaleString()}</div>
            <div class="text-xs text-emerald-400 mt-2">Across all platforms</div>
          </div>

          <div class="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
            <div class="flex items-center justify-between text-slate-400 mb-3">
              <span class="text-xs uppercase font-semibold tracking-wider">Active Categories</span>
              <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>
              </div>
            </div>
            <div class="text-3xl font-extrabold text-white">${Object.keys(summary.categoryCounts).length}</div>
            <div class="text-xs text-amber-400 mt-2">Standard & custom</div>
          </div>
        </div>

        <!-- Automated URL Ingestion Banner -->
        <div class="glass-card p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-purple-950/20">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="max-w-xl">
              <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 mb-2">
                ⚡ Future-Proof Auto-Ingestion
              </div>
              <h3 class="text-xl font-bold text-white">Add Future Websites Automatically by URL</h3>
              <p class="text-slate-300 text-sm mt-1">
                Enter any domain or URL (e.g., <code class="text-cyan-300 bg-cyan-950/50 px-1 py-0.5 rounded">linear.app</code> or <code class="text-cyan-300 bg-cyan-950/50 px-1 py-0.5 rounded">midjourney.com</code>). SoftHub will automatically fetch the logo, extract metadata, categorize it, and publish it into the directory without manual coding.
              </p>
            </div>
            <div class="flex-1 max-w-md">
              <form id="auto-ingest-form" onsubmit="window.admin.handleAutoIngest(event)" class="flex gap-2">
                <input 
                  type="text" 
                  id="auto-ingest-url" 
                  placeholder="e.g. perplexity.ai or https://linear.app" 
                  class="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
                <button type="submit" id="auto-ingest-btn" class="btn-primary px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap">
                  Auto-Add
                </button>
              </form>
              <div id="auto-ingest-status" class="text-xs mt-2 text-slate-400"></div>
            </div>
          </div>
        </div>

        <!-- Admin Tabs Navigation -->
        <div class="flex border-b border-slate-800 space-x-6 text-sm font-medium">
          <button onclick="window.admin.switchTab('tools')" class="admin-tab-btn pb-3 border-b-2 ${this.activeTab === 'tools' || this.activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}">
            Software Catalog (${tools.length})
          </button>
          <button onclick="window.admin.switchTab('categories')" class="admin-tab-btn pb-3 border-b-2 ${this.activeTab === 'categories' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}">
            Categories Breakdown
          </button>
          <button onclick="window.admin.switchTab('users')" class="admin-tab-btn pb-3 border-b-2 ${this.activeTab === 'users' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}">
            Users & Roles (${users.length})
          </button>
          <button onclick="window.admin.switchTab('analytics')" class="admin-tab-btn pb-3 border-b-2 ${this.activeTab === 'analytics' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}">
            Traffic & Analytics
          </button>
        </div>

        <!-- Tab Content Areas -->
        <div id="admin-tab-content">
          ${this.renderActiveTab(tools, users, summary)}
        </div>
      </div>
    `;
  }

  renderActiveTab(tools, users, summary) {
    if (this.activeTab === 'categories') {
      return this.renderCategoriesTab(summary.categoryCounts);
    } else if (this.activeTab === 'users') {
      return this.renderUsersTab(users);
    } else if (this.activeTab === 'analytics') {
      return this.renderAnalyticsTab(summary);
    }
    return this.renderToolsTab(tools);
  }

  renderToolsTab(tools) {
    return `
      <div class="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
        <div class="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div class="text-sm font-semibold text-slate-300">
            Registered Software Listings (${tools.length})
          </div>
          <div class="w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Filter list..." 
              oninput="window.admin.filterToolsTable(this.value)" 
              class="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300" id="admin-tools-table">
            <thead class="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th class="py-3.5 px-4 font-semibold">Software</th>
                <th class="py-3.5 px-4 font-semibold">Category</th>
                <th class="py-3.5 px-4 font-semibold">Visits</th>
                <th class="py-3.5 px-4 font-semibold">Rating</th>
                <th class="py-3.5 px-4 font-semibold">Status</th>
                <th class="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60" id="admin-tools-tbody">
              ${tools.map(tool => `
                <tr class="hover:bg-slate-800/30 transition group">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center p-1.5 bg-slate-800/80 border border-slate-700/60 shrink-0" style="color: ${tool.color || '#3B82F6'}">
                        ${tool.icon || '<span class="text-xs font-bold">' + tool.name[0] + '</span>'}
                      </div>
                      <div>
                        <div class="font-semibold text-white group-hover:text-blue-400 transition flex items-center gap-2">
                          ${tool.name}
                          ${tool.isPopular ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-normal">Popular</span>' : ''}
                        </div>
                        <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-slate-400 hover:text-blue-400 transition truncate max-w-xs block">
                          ${tool.url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      ${tool.category}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-slate-300 font-mono text-xs">
                    ${(tool.views || 0).toLocaleString()}
                  </td>
                  <td class="py-3 px-4 text-amber-400 text-xs font-semibold">
                    ★ ${tool.rating || 4.8}
                  </td>
                  <td class="py-3 px-4">
                    <button 
                      onclick="window.admin.togglePopular('${tool.id}')" 
                      class="px-2 py-1 rounded text-xs transition ${tool.isPopular ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}"
                      title="Click to toggle popular status"
                    >
                      ${tool.isPopular ? 'Featured' : 'Standard'}
                    </button>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        onclick="window.admin.openEditToolModal('${tool.id}')" 
                        class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition" 
                        title="Edit Software"
                      >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button 
                        onclick="window.admin.deleteTool('${tool.id}', '${encodeURIComponent(tool.name)}')" 
                        class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition" 
                        title="Delete Software"
                      >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderCategoriesTab(categoryCounts) {
    const allCategories = window.CONFIG.categories.filter(c => c.id !== 'all');
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${allCategories.map(cat => {
          const count = categoryCounts[cat.name] || 0;
          return `
            <div class="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center p-2 shadow-lg">
                  ${cat.icon}
                </div>
                <div>
                  <h4 class="font-bold text-white text-sm">${cat.name}</h4>
                  <p class="text-xs text-slate-400 mt-0.5">${count} tool${count === 1 ? '' : 's'} assigned</p>
                </div>
              </div>
              <button onclick="window.app.filterByCategory('${cat.name}')" class="text-xs text-blue-400 hover:text-blue-300 font-medium">
                View →
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderUsersTab(users) {
    return `
      <div class="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
        <div class="p-4 bg-slate-900/60 border-b border-slate-800 text-sm font-semibold text-slate-300">
          Registered SoftHub Users (${users.length})
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th class="py-3 px-4 font-semibold">User Profile</th>
                <th class="py-3 px-4 font-semibold">Role</th>
                <th class="py-3 px-4 font-semibold">Joined Date</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${users.map(u => `
                <tr class="hover:bg-slate-800/30 transition">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <img src="${u.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + u.email}" class="w-8 h-8 rounded-full border border-slate-700 object-cover" alt="${u.name}"/>
                      <div>
                        <div class="font-semibold text-white">${u.name}</div>
                        <div class="text-xs text-slate-400">${u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'}">
                      ${u.role || 'user'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-xs text-slate-400">
                    ${u.createdAt || 'N/A'}
                  </td>
                  <td class="py-3 px-4 text-right">
                    ${u.role !== 'admin' ? `
                      <button onclick="window.admin.promoteUser('${u.id}')" class="text-xs text-blue-400 hover:text-blue-300 font-medium">
                        Promote to Admin
                      </button>
                    ` : '<span class="text-xs text-slate-500">Root Admin</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderAnalyticsTab(summary) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Performing Tools -->
        <div class="glass-card p-6 rounded-2xl border border-slate-800/80">
          <h3 class="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span>🔥 Most Popular Tools</span>
            <span class="text-xs font-normal text-slate-400">By user click volume</span>
          </h3>
          <div class="space-y-4">
            ${summary.topTools.map(t => {
              const maxViews = summary.topTools[0]?.views || 1;
              const percent = Math.min(100, Math.round((t.views / maxViews) * 100));
              return `
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="font-semibold text-white">${t.name}</span>
                    <span class="text-slate-400 font-mono">${(t.views || 0).toLocaleString()} clicks</span>
                  </div>
                  <div class="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style="width: ${percent}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Platform Distribution -->
        <div class="glass-card p-6 rounded-2xl border border-slate-800/80">
          <h3 class="text-base font-bold text-white mb-4">
            📊 Category Distribution
          </h3>
          <div class="space-y-3">
            ${Object.entries(summary.categoryCounts).map(([catName, count]) => {
              const percent = Math.round((count / summary.totalTools) * 100);
              return `
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-300">${catName}</span>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-white">${count} tools</span>
                    <span class="text-slate-500">(${percent}%)</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  filterToolsTable(query) {
    const q = query.toLowerCase().trim();
    const rows = document.querySelectorAll('#admin-tools-tbody tr');
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = text.includes(q) ? '' : 'none';
    });
  }

  // --- CRUD ACTIONS ---

  openAddToolModal() {
    this.currentEditingToolId = null;
    const modal = document.getElementById('tool-form-modal');
    if (!modal) return;
    document.getElementById('tool-form-title').innerText = 'Add New Software Listing';
    document.getElementById('tool-form').reset();
    document.getElementById('tool-form-id').value = '';
    modal.classList.remove('hidden');
  }

  async openEditToolModal(toolId) {
    this.currentEditingToolId = toolId;
    const tool = await window.db.getToolById(toolId);
    if (!tool) return;

    const modal = document.getElementById('tool-form-modal');
    if (!modal) return;

    document.getElementById('tool-form-title').innerText = 'Edit Software Listing';
    document.getElementById('tool-form-id').value = tool.id;
    document.getElementById('tool-form-name').value = tool.name;
    document.getElementById('tool-form-url').value = tool.url;
    document.getElementById('tool-form-category').value = tool.category;
    document.getElementById('tool-form-desc').value = tool.description;
    document.getElementById('tool-form-features').value = (tool.features || []).join('\n');
    document.getElementById('tool-form-tags').value = (tool.tags || []).join(', ');
    document.getElementById('tool-form-color').value = tool.color || '#3B82F6';
    document.getElementById('tool-form-popular').checked = !!tool.isPopular;

    modal.classList.remove('hidden');
  }

  closeToolModal() {
    const modal = document.getElementById('tool-form-modal');
    if (modal) modal.classList.add('hidden');
  }

  async saveToolForm(event) {
    event.preventDefault();
    const id = document.getElementById('tool-form-id').value;
    const name = document.getElementById('tool-form-name').value.trim();
    const url = document.getElementById('tool-form-url').value.trim();
    const category = document.getElementById('tool-form-category').value;
    const desc = document.getElementById('tool-form-desc').value.trim();
    const featuresRaw = document.getElementById('tool-form-features').value;
    const tagsRaw = document.getElementById('tool-form-tags').value;
    const color = document.getElementById('tool-form-color').value;
    const isPopular = document.getElementById('tool-form-popular').checked;

    const features = featuresRaw.split('\n').map(f => f.trim()).filter(Boolean);
    const tags = tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    const cleanUrl = window.autoImporter.cleanUrl(url);
    const domain = window.autoImporter.extractDomain(cleanUrl);

    if (id) {
      // Update
      await window.db.updateTool(id, {
        name,
        url: cleanUrl,
        category,
        description: desc,
        features: features.length > 0 ? features : ['Official Web Application'],
        tags,
        color,
        isPopular
      });
      window.app.showToast(`Software "${name}" updated successfully!`);
    } else {
      // Add new
      const newTool = {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        url: cleanUrl,
        category,
        description: desc,
        longDescription: `${name} is an online platform for ${category.toLowerCase()}.`,
        features: features.length > 0 ? features : ['Official Web Application', 'Cloud Synced'],
        tags,
        color,
        isPopular,
        isFeatured: isPopular,
        icon: `<img src="${window.autoImporter.getIconUrl(domain)}" alt="${name} logo" class="w-full h-full object-contain rounded-lg p-1" onerror="this.src='https://api.dicebear.com/7.x/identicon/svg?seed=${name}'"/>`,
        rating: 4.8,
        views: 1
      };
      await window.db.addTool(newTool);
      window.app.showToast(`New software "${name}" added to catalog!`);
    }

    this.closeToolModal();
    await this.render();
    window.app.refreshData();
  }

  async deleteTool(toolId, toolNameEscaped) {
    const toolName = decodeURIComponent(toolNameEscaped);
    if (!confirm(`Are you sure you want to delete "${toolName}"? This action cannot be undone.`)) {
      return;
    }

    await window.db.deleteTool(toolId);
    window.app.showToast(`"${toolName}" has been removed from SoftHub.`);
    await this.render();
    window.app.refreshData();
  }

  async togglePopular(toolId) {
    const tool = await window.db.getToolById(toolId);
    if (!tool) return;
    const newPopular = !tool.isPopular;
    await window.db.updateTool(toolId, { isPopular: newPopular, isFeatured: newPopular });
    await this.render();
    window.app.refreshData();
    window.app.showToast(`"${tool.name}" ${newPopular ? 'marked as Featured/Popular' : 'set to Standard'}.`);
  }

  async handleAutoIngest(event) {
    event.preventDefault();
    const input = document.getElementById('auto-ingest-url');
    const status = document.getElementById('auto-ingest-status');
    const btn = document.getElementById('auto-ingest-btn');
    const url = input.value.trim();

    if (!url) return;

    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-1">⌛</span> Ingesting...`;
    status.innerHTML = `<span class="text-cyan-400">Fetching metadata & categorizing website...</span>`;

    try {
      const addedTool = await window.autoImporter.ingestWebsite(url);
      status.innerHTML = `<span class="text-emerald-400">✓ Successfully added "${addedTool.name}" in category "${addedTool.category}"!</span>`;
      input.value = '';
      window.app.showToast(`✓ Auto-Ingested "${addedTool.name}" successfully!`);
      await this.render();
      window.app.refreshData();
    } catch (err) {
      status.innerHTML = `<span class="text-rose-400">❌ Error: ${err.message}</span>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = `Auto-Add`;
    }
  }

  async triggerAutoDiscovery() {
    window.app.showToast('Scanning web discovery feed for trending platforms...');
    const result = await window.autoImporter.autoDiscoverNextTrendingTools(2);
    if (result.addedCount > 0) {
      window.app.showToast(result.message);
      await this.render();
      window.app.refreshData();
    } else {
      window.app.showToast('No new tools in discovery feed. All are up to date!');
    }
  }

  async promoteUser(userId) {
    await window.db.updateUser(userId, { role: 'admin' });
    window.app.showToast('User has been granted Admin privileges.');
    await this.render();
  }
}

window.admin = new AdminController();
