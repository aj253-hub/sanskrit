/* ============================================================
   संस्कृत सेतु — State Management (Store)
   localStorage-backed reactive store
   ============================================================ */

const Store = {
  _listeners: {},
  _prefix: 'sanskrit_setu_',

  // ── Core CRUD ── //
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(this._prefix + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this._prefix + key, JSON.stringify(value));
      this._emit(key, value);
    } catch (e) {
      console.warn('Store.set failed:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(this._prefix + key);
    this._emit(key, null);
  },

  // ── Event System ── //
  on(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
    return () => {
      this._listeners[key] = this._listeners[key].filter(f => f !== fn);
    };
  },

  _emit(key, value) {
    (this._listeners[key] || []).forEach(fn => fn(value));
    (this._listeners['*'] || []).forEach(fn => fn(key, value));
  },

  // ── User ── //
  getUser() {
    return this.get('user', null);
  },

  setUser(user) {
    this.set('user', user);
  },

  getProfile() {
    const user = this.getUser();
    return user ? {
      name: user.name || '',
      email: user.email || '',
      goal: user.goal || 'CUET',
      joined: user.joined || Date.now(),
      streak: user.streak || 0,
      lastActive: user.lastActive || Date.now(),
      dailyGoal: user.dailyGoal || 20,
      avatar: user.avatar || '',
      isAdmin: user.isAdmin || false
    } : null;
  },

  updateProfile(updates) {
    const user = this.getUser();
    if (user) {
      const updated = { ...user, ...updates };
      this.setUser(updated);
      // Sync changes back to all_users so login works after profile edits
      this._syncUserToRegistry(updated);
    }
  },

  // Keep all_users registry in sync with active user changes
  _syncUserToRegistry(updatedUser) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updatedUser };
      this.set('all_users', users);
    }
  },

  // ── Progress ── //
  getProgress() {
    return this.get('progress', {});
  },

  saveProgress(key, data) {
    const progress = this.getProgress();
    const existing = progress[key] || { attempted: 0, best: 0, scores: [], label: data.label };
    existing.attempted += 1;
    existing.best = Math.max(existing.best, data.score);
    existing.scores.push({ score: data.score, total: data.total, date: Date.now(), time: data.time || 0 });
    if (existing.scores.length > 20) existing.scores = existing.scores.slice(-20);
    existing.last = Date.now();
    existing.label = data.label;
    progress[key] = existing;
    this.set('progress', progress);
  },

  // ── Bookmarks ── //
  getBookmarks() {
    return this.get('bookmarks', []);
  },

  toggleBookmark(questionId) {
    const bm = this.getBookmarks();
    const idx = bm.indexOf(questionId);
    if (idx >= 0) {
      bm.splice(idx, 1);
    } else {
      bm.push(questionId);
    }
    this.set('bookmarks', bm);
    return idx < 0; // true if added
  },

  isBookmarked(questionId) {
    return this.getBookmarks().includes(questionId);
  },

  // ── Wrong Answers ── //
  getWrongAnswers() {
    return this.get('wrong_answers', []);
  },

  addWrongAnswer(question) {
    const wrong = this.getWrongAnswers();
    if (!wrong.find(w => w.id === question.id)) {
      wrong.push({ id: question.id, date: Date.now() });
      if (wrong.length > 200) wrong.shift();
      this.set('wrong_answers', wrong);
    }
  },

  removeWrongAnswer(questionId) {
    const wrong = this.getWrongAnswers().filter(w => w.id !== questionId);
    this.set('wrong_answers', wrong);
  },

  // ── Notes ── //
  getNotes() {
    return this.get('notes', []);
  },

  saveNote(note) {
    const notes = this.getNotes();
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = { ...notes[idx], ...note, updated: Date.now() };
    } else {
      notes.push({ ...note, id: Utils.uid(), created: Date.now(), updated: Date.now() });
    }
    this.set('notes', notes);
  },

  deleteNote(id) {
    this.set('notes', this.getNotes().filter(n => n.id !== id));
  },

  // ── Streak ── //
  updateStreak() {
    const user = this.getUser();
    if (!user) return;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastActive = user.lastActive || 0;
    const lastDay = new Date(new Date(lastActive).getFullYear(), new Date(lastActive).getMonth(), new Date(lastActive).getDate()).getTime();
    
    let streak = user.streak || 0;
    if (today - lastDay === 86400000) {
      streak += 1; // consecutive day
    } else if (today !== lastDay) {
      streak = 1; // new streak
    }
    
    this.updateProfile({ streak, lastActive: Date.now() });
    return streak;
  },

  // ── Custom Questions (Admin) ── //
  getCustomQuestions() {
    return this.get('custom_questions', []);
  },

  saveCustomQuestion(question) {
    const questions = this.getCustomQuestions();
    const idx = questions.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      questions[idx] = { ...questions[idx], ...question };
    } else {
      questions.push({ ...question, id: question.id || Utils.uid() });
    }
    this.set('custom_questions', questions);
  },

  deleteCustomQuestion(id) {
    this.set('custom_questions', this.getCustomQuestions().filter(q => q.id !== id));
  },

  // ── Admin: Passes & Courses ── //
  getPasses() {
    return this.get('passes', null);
  },

  savePasses(passes) {
    this.set('passes', passes);
  },

  getCourses() {
    return this.get('courses', null);
  },

  saveCourses(courses) {
    this.set('courses', courses);
  },

  // ── Manual Payment Requests ── //
  getPendingPayments() {
    return this.get('pending_payments', []);
  },

  savePendingPayment(payment) {
    const payments = this.getPendingPayments();
    payments.push({ ...payment, id: Utils.uid(), timestamp: Date.now(), status: 'pending' });
    this.set('pending_payments', payments);
  },

  updatePendingPaymentStatus(id, status) {
    const payments = this.getPendingPayments();
    const idx = payments.findIndex(p => p.id === id);
    if (idx >= 0) {
      payments[idx].status = status;
      this.set('pending_payments', payments);
    }
  },

  // ── AI Settings ── //
  getAiKey() {
    return this.get('ai_api_key', null);
  },

  saveAiKey(key) {
    this.set('ai_api_key', key);
  },

  // ── Daily Stats ── //
  getTodayStats() {
    const progress = this.getProgress();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    let questionsToday = 0;
    let correctToday = 0;
    
    Object.values(progress).forEach(p => {
      (p.scores || []).forEach(s => {
        if (s.date >= todayStart) {
          questionsToday += s.total;
          correctToday += s.score;
        }
      });
    });
    
    return { questionsToday, correctToday };
  },

  // ── Aggregate Stats ── //
  getStats() {
    const progress = this.getProgress();
    const entries = Object.entries(progress);
    
    let totalAttempts = 0;
    let totalScore = 0;
    let totalQuestions = 0;
    let modulesStarted = entries.length;
    const allScores = [];
    
    entries.forEach(([, p]) => {
      totalAttempts += p.attempted;
      (p.scores || []).forEach(s => {
        totalScore += s.score;
        totalQuestions += s.total;
        allScores.push({ pct: Utils.pct(s.score, s.total), date: s.date });
      });
    });
    
    const avg = totalQuestions > 0 ? Utils.pct(totalScore, totalQuestions) : 0;
    
    // Last 10 scores for trend
    const recentScores = allScores.sort((a, b) => a.date - b.date).slice(-10);
    
    return {
      totalAttempts,
      totalScore,
      totalQuestions,
      modulesStarted,
      avg,
      recentScores
    };
  },

  // ── Auth (simple email/password in localStorage) ── //
  getUsers() {
    return this.get('all_users', []);
  },

  registerUser(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'यह ईमेल पहले से पंजीकृत है' };
    }
    const user = {
      id: Utils.uid(),
      name,
      email: email.toLowerCase(),
      password,
      goal: 'CUET',
      joined: Date.now(),
      streak: 0,
      lastActive: Date.now(),
      dailyGoal: 20,
      isAdmin: email.toLowerCase() === 'admin@sanskritsetu.com'
    };
    users.push(user);
    this.set('all_users', users);
    this.setUser(user);
    return { ok: true, user };
  },

  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return { ok: false, error: 'ईमेल या पासवर्ड गलत है' };
    }
    this.setUser(user);
    this.updateStreak();
    return { ok: true, user };
  },

  logout() {
    this.remove('user');
  },

  deleteUser(id) {
    const users = this.getUsers().filter(u => u.id !== id);
    this.set('all_users', users);
    // If deleting the current user, log them out
    const currentUser = this.getUser();
    if (currentUser && currentUser.id === id) {
      this.logout();
    }
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  // ── Clear All Data ── //
  clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this._prefix));
    keys.forEach(k => localStorage.removeItem(k));
  }
};
