/* ============================================================
   संस्कृत सेतु — Reusable UI Components
   Header, Bottom Nav, Toast, Progress Ring, Skeleton
   ============================================================ */

const Components = {

  // ── App Header ── //
  renderHeader() {
    const user = Store.getUser();
    const initials = user ? Utils.getInitials(user.name) : '?';
    const streak = user ? (user.streak || 0) : 0;
    const isAdmin = user ? (user.isAdmin || false) : false;

    return `
      <header class="app-header" id="app-header">
        <div class="header-inner">
          <div class="header-brand" style="cursor:pointer" onclick="Router.navigate('home')">
            <span class="brand-icon">🕉️</span>
            <div>
              <div class="brand-name">संस्कृत सेतु</div>
              <div class="brand-sub">परीक्षा तैयारी मंच</div>
            </div>
          </div>
          <div class="header-actions">
            ${isAdmin ? `<button class="btn btn-outline btn-sm" style="border-color:var(--primary);color:var(--primary)" onclick="Router.navigate('admin')">Admin</button>` : ''}
            ${streak > 0 ? `<div class="streak-flame"><span class="flame-icon">🔥</span>${streak}</div>` : ''}
            <button class="header-avatar" onclick="Router.navigate('profile')" title="प्रोफ़ाइल">${initials}</button>
          </div>
        </div>
      </header>
    `;
  },

  // ── Bottom Navigation ── //
  renderBottomNav() {
    const items = [
      { page: 'home',      icon: '🏠', label: 'मुख्य' },
      { page: 'dashboard', icon: '📊', label: 'तैयारी' },
      { page: 'exams',     icon: '📝', label: 'परीक्षा' },
      { page: 'analytics', icon: '📈', label: 'विश्लेषण' },
      { page: 'profile',   icon: '👤', label: 'प्रोफ़ाइल' }
    ];

    return `
      <nav class="bottom-nav" id="bottom-nav">
        <div class="nav-inner">
          ${items.map(item => `
            <button class="nav-item" data-page="${item.page}" onclick="Router.navigate('${item.page}')">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
            </button>
          `).join('')}
        </div>
      </nav>
    `;
  },

  // ── Toast Notifications ── //
  _toastContainer: null,

  showToast(message, type = 'info') {
    if (!this._toastContainer) {
      this._toastContainer = document.createElement('div');
      this._toastContainer.className = 'toast-container';
      document.body.appendChild(this._toastContainer);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-msg">${message}</span>
    `;
    this._toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
  },

  // ── Section Title ── //
  sectionTitle(text, extra = '') {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-xl);margin-bottom:var(--space-md)">
        <div class="section-title">${text}</div>
        ${extra}
      </div>
    `;
  },

  // ── Stat Card ── //
  statCard(value, label, icon = '') {
    return `
      <div class="stat-card">
        ${icon ? `<div style="font-size:20px;margin-bottom:4px">${icon}</div>` : ''}
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    `;
  },

  // ── Empty State ── //
  emptyState(icon, text, action = '') {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <div class="empty-text">${text}</div>
        ${action}
      </div>
    `;
  },

  // ── Back Button ── //
  backButton(label = 'वापस') {
    return `<button class="btn btn-ghost btn-sm" onclick="Router.back()">← ${label}</button>`;
  },

  // ── Page Back Header ── //
  pageHeader(title, showBack = true) {
    return `
      <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-lg)">
        ${showBack ? `<button class="btn btn-ghost btn-sm" onclick="Router.back()" style="padding:8px 12px">←</button>` : ''}
        <h3 style="flex:1;font-size:var(--fs-lg)">${title}</h3>
      </div>
    `;
  },

  // ── Loading Skeleton ── //
  skeleton(count = 3) {
    return Array(count).fill('').map(() => `
      <div class="skeleton skeleton-card"></div>
    `).join('');
  },

  // ── Confirm Dialog ── //
  showConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <h3 style="margin-bottom:var(--space-sm);font-size:var(--fs-lg)">${title}</h3>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-lg)">${message}</p>
        <div style="display:flex;gap:var(--space-sm);justify-content:flex-end">
          <button class="btn btn-ghost" id="modal-cancel">रद्द करें</button>
          <button class="btn btn-primary" id="modal-confirm">पुष्टि करें</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#modal-cancel').onclick = () => {
      document.body.removeChild(overlay);
    };
    overlay.querySelector('#modal-confirm').onclick = () => {
      document.body.removeChild(overlay);
      onConfirm();
    };
    overlay.onclick = (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    };
  }
};
