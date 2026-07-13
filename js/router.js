/* ============================================================
   संस्कृत सेतु — SPA Router
   Hash-based routing with transitions
   ============================================================ */

const Router = {
  _routes: {},
  _current: null,
  _history: [],
  _container: null,

  init(containerId) {
    this._container = document.getElementById(containerId);
    window.addEventListener('hashchange', () => this._onHashChange());
    // Initial route
    this._onHashChange();
  },

  register(path, handler) {
    this._routes[path] = handler;
  },

  navigate(path, params = {}) {
    const search = Object.keys(params).length 
      ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';
    window.location.hash = path + search;
  },

  back() {
    if (this._history.length > 1) {
      this._history.pop();
      const prev = this._history[this._history.length - 1];
      window.location.hash = prev;
    } else {
      this.navigate('home');
    }
  },

  getCurrentRoute() {
    return this._current;
  },

  getParams() {
    const hash = window.location.hash.slice(1);
    const [, search] = hash.split('?');
    if (!search) return {};
    const params = {};
    search.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      params[k] = decodeURIComponent(v || '');
    });
    return params;
  },

  _onHashChange() {
    const hash = window.location.hash.slice(1) || 'login';
    const [path] = hash.split('?');
    
    // Auth guard
    if (path !== 'login' && !Store.isLoggedIn()) {
      this.navigate('login');
      return;
    }
    if (path === 'login' && Store.isLoggedIn()) {
      this.navigate('home');
      return;
    }

    this._current = path;
    this._history.push(hash);
    if (this._history.length > 50) this._history.shift();

    const handler = this._routes[path];
    if (handler && this._container) {
      // Page transition
      this._container.style.opacity = '0';
      this._container.style.transform = 'translateY(8px)';
      
      setTimeout(() => {
        this._container.innerHTML = '';
        handler(this.getParams());
        this._container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        this._container.style.opacity = '1';
        this._container.style.transform = 'translateY(0)';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update nav highlight
        this._updateNav(path);
      }, 150);
    } else if (this._container) {
      this._container.innerHTML = `
        <div class="page-container" style="text-align:center;padding-top:100px">
          <div style="font-size:48px;margin-bottom:16px">🔍</div>
          <h3>पृष्ठ नहीं मिला</h3>
          <p style="color:var(--text-muted);margin-top:8px">यह पृष्ठ उपलब्ध नहीं है</p>
          <button class="btn btn-primary" style="margin-top:24px" onclick="Router.navigate('home')">मुखपृष्ठ पर जाएँ</button>
        </div>
      `;
    }
  },

  _updateNav(path) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === path || 
        (el.dataset.page === 'home' && path === 'home') ||
        (el.dataset.page === 'classes' && path === 'classes') ||
        (el.dataset.page === 'exams' && ['exams', 'practice-gk', 'practice-cuet', 'quiz', 'results'].includes(path)) ||
        (el.dataset.page === 'pass' && path === 'pass') ||
        (el.dataset.page === 'profile' && ['profile', 'notes', 'bookmarks', 'materials'].includes(path))
      );
    });
  }
};
