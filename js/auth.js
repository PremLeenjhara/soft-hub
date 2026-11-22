/**
 * SoftHub - Authentication & User Session Manager
 */

class AuthManager {
  constructor() {
    this.sessionKey = 'softhub_current_session';
    this.currentUser = null;
    this.listeners = [];
    this.init();
  }

  init() {
    const saved = localStorage.getItem(this.sessionKey);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
        localStorage.removeItem(this.sessionKey);
      }
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentUser);
      } catch (e) {
        console.error('[SoftHub Auth] Listener error:', e);
      }
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    await window.db.readyPromise;
    const user = await window.db.getUserByEmail(email);

    if (!user) {
      throw new Error('No account found with this email address.');
    }

    if (user.password !== password) {
      throw new Error('Invalid password. Please check your credentials.');
    }

    // Set active session (excluding raw password for security)
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email)}`,
      createdAt: user.createdAt
    };

    this.currentUser = sessionUser;
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));
    this.notifyListeners();
    window.db.recordEvent('login', { userId: user.id, email: user.email });

    return sessionUser;
  }

  async register(name, email, password) {
    if (!name || !email || !password) {
      throw new Error('Please complete all required fields.');
    }

    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }

    await window.db.readyPromise;
    const existing = await window.db.getUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email.trim())}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await window.db.createUser(newUser);

    // Auto-login upon registration
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    };

    this.currentUser = sessionUser;
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));
    this.notifyListeners();
    window.db.recordEvent('register', { userId: newUser.id, email: newUser.email });

    return sessionUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
    this.notifyListeners();
  }

  async updateProfile(updates) {
    if (!this.currentUser) throw new Error('Not logged in.');

    await window.db.readyPromise;
    const updated = await window.db.updateUser(this.currentUser.id, updates);
    if (updated) {
      this.currentUser = {
        ...this.currentUser,
        name: updated.name || this.currentUser.name,
        avatar: updated.avatar || this.currentUser.avatar
      };
      localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
      this.notifyListeners();
    }
    return this.currentUser;
  }
}

window.auth = new AuthManager();
