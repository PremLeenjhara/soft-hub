/**
 * SoftHub - Database Management Layer
 * Uses IndexedDB for production-grade client-side persistence with localStorage fallback.
 */

class DatabaseManager {
  constructor() {
    this.dbName = window.CONFIG?.dbName || 'SoftHubDB';
    this.version = window.CONFIG?.dbVersion || 1;
    this.db = null;
    this.isReady = false;
    this.readyPromise = this.init();
  }

  async init() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('[SoftHub DB] IndexedDB not available. Using localStorage fallback.');
        this.initFallback();
        this.isReady = true;
        resolve(this);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Tools store
        if (!db.objectStoreNames.contains('tools')) {
          const toolStore = db.createObjectStore('tools', { keyPath: 'id' });
          toolStore.createIndex('category', 'category', { unique: false });
          toolStore.createIndex('isPopular', 'isPopular', { unique: false });
          toolStore.createIndex('views', 'views', { unique: false });
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Favorites store (userId + toolId)
        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favStore.createIndex('userId', 'userId', { unique: false });
        }

        // Recents store
        if (!db.objectStoreNames.contains('recents')) {
          const recentStore = db.createObjectStore('recents', { keyPath: 'id' });
          recentStore.createIndex('userId', 'userId', { unique: false });
        }

        // Analytics / Activity logs store
        if (!db.objectStoreNames.contains('analytics')) {
          db.createObjectStore('analytics', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        this.isReady = true;
        await this.seedInitialData();
        resolve(this);
      };

      request.onerror = (event) => {
        console.error('[SoftHub DB] IndexedDB open error, falling back:', event.target.error);
        this.initFallback();
        this.isReady = true;
        resolve(this);
      };
    });
  }

  initFallback() {
    const seeds = window.SEED_TOOLS || [];
    const current = JSON.parse(localStorage.getItem('softhub_tools') || '[]');
    if (!localStorage.getItem('softhub_tools') || current.length === 0) {
      localStorage.setItem('softhub_tools', JSON.stringify(seeds));
    }
    if (!localStorage.getItem('softhub_users')) {
      localStorage.setItem('softhub_users', JSON.stringify([window.CONFIG.defaultAdmin]));
    }
    if (!localStorage.getItem('softhub_favorites')) {
      localStorage.setItem('softhub_favorites', JSON.stringify([]));
    }
    if (!localStorage.getItem('softhub_recents')) {
      localStorage.setItem('softhub_recents', JSON.stringify([]));
    }
  }

  async seedInitialData() {
    const existingTools = await this.getAllTools();
    if (existingTools.length === 0) {
      let seedTools = window.SEED_TOOLS || [];
      if (seedTools.length === 0) {
        try {
          const response = await fetch('./data/tools.json');
          if (response.ok) {
            seedTools = await response.json();
          }
        } catch (e) {
          console.warn('[SoftHub DB] Could not fetch ./data/tools.json directly');
        }
      }

      if (seedTools.length > 0) {
        for (const tool of seedTools) {
          await this.addTool(tool);
        }
      }
    }

    // Seed default admin user
    const adminUser = await this.getUserByEmail(window.CONFIG.defaultAdmin.email);
    if (!adminUser) {
      await this.createUser(window.CONFIG.defaultAdmin);
    }
  }

  // --- TOOLS OPERATIONS ---

  async getAllTools() {
    if (!this.db) {
      const stored = JSON.parse(localStorage.getItem('softhub_tools') || '[]');
      if (stored.length > 0) return stored;
      return window.SEED_TOOLS || [];
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('tools', 'readonly');
      const store = tx.objectStore('tools');
      const request = store.getAll();
      request.onsuccess = () => {
        const list = request.result || [];
        if (list.length > 0) {
          resolve(list);
        } else {
          resolve(window.SEED_TOOLS || []);
        }
      };
      request.onerror = () => resolve(window.SEED_TOOLS || []);
    });
  }

  async getToolById(id) {
    if (!this.db) {
      const tools = JSON.parse(localStorage.getItem('softhub_tools') || '[]');
      return tools.find(t => t.id === id) || null;
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('tools', 'readonly');
      const store = tx.objectStore('tools');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async addTool(tool) {
    if (!tool.id) {
      tool.id = 'tool_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    }
    if (!tool.createdAt) tool.createdAt = new Date().toISOString().split('T')[0];
    if (tool.views === undefined) tool.views = 0;
    if (tool.rating === undefined) tool.rating = 4.8;
    if (tool.isPopular === undefined) tool.isPopular = false;
    if (tool.isFeatured === undefined) tool.isFeatured = false;

    if (!this.db) {
      const tools = JSON.parse(localStorage.getItem('softhub_tools') || '[]');
      tools.push(tool);
      localStorage.setItem('softhub_tools', JSON.stringify(tools));
      return tool;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tools', 'readwrite');
      const store = tx.objectStore('tools');
      const request = store.put(tool);
      request.onsuccess = () => resolve(tool);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTool(id, updates) {
    const existing = await this.getToolById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    if (!this.db) {
      let tools = JSON.parse(localStorage.getItem('softhub_tools') || '[]');
      tools = tools.map(t => t.id === id ? merged : t);
      localStorage.setItem('softhub_tools', JSON.stringify(tools));
      return merged;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tools', 'readwrite');
      const store = tx.objectStore('tools');
      const request = store.put(merged);
      request.onsuccess = () => resolve(merged);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTool(id) {
    if (!this.db) {
      let tools = JSON.parse(localStorage.getItem('softhub_tools') || '[]');
      tools = tools.filter(t => t.id !== id);
      localStorage.setItem('softhub_tools', JSON.stringify(tools));
      return true;
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction('tools', 'readwrite');
      const store = tx.objectStore('tools');
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async incrementToolViews(id) {
    const tool = await this.getToolById(id);
    if (tool) {
      tool.views = (tool.views || 0) + 1;
      await this.updateTool(id, { views: tool.views });
      this.recordEvent('click', { toolId: id, toolName: tool.name });
    }
    return tool;
  }

  // --- USERS OPERATIONS ---

  async getAllUsers() {
    if (!this.db) {
      return JSON.parse(localStorage.getItem('softhub_users') || '[]');
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async getUserByEmail(email) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    if (!this.db) {
      const users = JSON.parse(localStorage.getItem('softhub_users') || '[]');
      return users.find(u => u.email.toLowerCase() === normalized) || null;
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const index = store.index('email');
      const request = index.get(normalized);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async createUser(user) {
    if (!user.id) user.id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    user.email = user.email.toLowerCase().trim();
    if (!user.role) user.role = 'user';
    if (!user.createdAt) user.createdAt = new Date().toISOString().split('T')[0];

    if (!this.db) {
      const users = JSON.parse(localStorage.getItem('softhub_users') || '[]');
      users.push(user);
      localStorage.setItem('softhub_users', JSON.stringify(users));
      return user;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const request = store.put(user);
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(id, updates) {
    const allUsers = await this.getAllUsers();
    const existing = allUsers.find(u => u.id === id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };

    if (!this.db) {
      let users = JSON.parse(localStorage.getItem('softhub_users') || '[]');
      users = users.map(u => u.id === id ? merged : u);
      localStorage.setItem('softhub_users', JSON.stringify(users));
      return merged;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const request = store.put(merged);
      request.onsuccess = () => resolve(merged);
      request.onerror = () => reject(request.error);
    });
  }

  // --- FAVORITES OPERATIONS ---

  async getFavorites(userId) {
    if (!userId) return [];
    if (!this.db) {
      const favs = JSON.parse(localStorage.getItem('softhub_favorites') || '[]');
      return favs.filter(f => f.userId === userId).map(f => f.toolId);
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('favorites', 'readonly');
      const store = tx.objectStore('favorites');
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.map(r => r.toolId));
      };
      request.onerror = () => resolve([]);
    });
  }

  async isFavorite(userId, toolId) {
    if (!userId || !toolId) return false;
    const favs = await this.getFavorites(userId);
    return favs.includes(toolId);
  }

  async toggleFavorite(userId, toolId) {
    if (!userId || !toolId) return false;
    const favKey = `${userId}_${toolId}`;
    const favs = await this.getFavorites(userId);
    const isCurrentlyFav = favs.includes(toolId);

    if (!this.db) {
      let favList = JSON.parse(localStorage.getItem('softhub_favorites') || '[]');
      if (isCurrentlyFav) {
        favList = favList.filter(f => f.id !== favKey);
      } else {
        favList.push({ id: favKey, userId, toolId, createdAt: Date.now() });
      }
      localStorage.setItem('softhub_favorites', JSON.stringify(favList));
      return !isCurrentlyFav;
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction('favorites', 'readwrite');
      const store = tx.objectStore('favorites');
      if (isCurrentlyFav) {
        const req = store.delete(favKey);
        req.onsuccess = () => resolve(false);
        req.onerror = () => resolve(false);
      } else {
        const req = store.put({ id: favKey, userId, toolId, createdAt: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      }
    });
  }

  // --- RECENT VISITS OPERATIONS ---

  async getRecents(userId) {
    if (!userId) return [];
    if (!this.db) {
      const recs = JSON.parse(localStorage.getItem('softhub_recents') || '[]');
      return recs
        .filter(r => r.userId === userId)
        .sort((a, b) => b.timestamp - a.timestamp);
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('recents', 'readonly');
      const store = tx.objectStore('recents');
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const results = (request.result || []).sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      request.onerror = () => resolve([]);
    });
  }

  async addRecent(userId, toolId) {
    if (!userId || !toolId) return;
    const recentKey = `${userId}_${toolId}`;
    const record = {
      id: recentKey,
      userId,
      toolId,
      timestamp: Date.now(),
      visitedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString()
    };

    if (!this.db) {
      let recs = JSON.parse(localStorage.getItem('softhub_recents') || '[]');
      recs = recs.filter(r => r.id !== recentKey);
      recs.unshift(record);
      if (recs.length > 50) recs.pop();
      localStorage.setItem('softhub_recents', JSON.stringify(recs));
      return record;
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction('recents', 'readwrite');
      const store = tx.objectStore('recents');
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => resolve(null);
    });
  }

  // --- ANALYTICS OPERATIONS ---

  async recordEvent(eventType, eventData = {}) {
    const event = {
      type: eventType,
      data: eventData,
      timestamp: Date.now(),
      timeFormatted: new Date().toISOString()
    };
    if (this.db) {
      try {
        const tx = this.db.transaction('analytics', 'readwrite');
        tx.objectStore('analytics').add(event);
      } catch (e) {
        // quiet ignore
      }
    }
  }

  async getAnalyticsSummary() {
    const tools = await this.getAllTools();
    const users = await this.getAllUsers();
    const totalViews = tools.reduce((sum, t) => sum + (Number(t.views) || 0), 0);
    const categoryCounts = {};
    tools.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    const topTools = [...tools].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

    return {
      totalTools: tools.length,
      totalUsers: users.length,
      totalViews,
      categoryCounts,
      topTools
    };
  }
}

window.db = new DatabaseManager();
