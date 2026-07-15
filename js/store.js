/* ============================================================
   संस्कृत सेतु — State Management (Store)
   Supabase-backed store
   ============================================================ */

const Store = {
  _listeners: {},

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

  // ── Auth ── //
  async registerUser(name, email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim()
    });
    if (error) return { ok: false, error: error.message };

    // Create the matching profile row
    await supabaseClient.from('profiles').insert({
      id: data.user.id,
      name,
      goal: 'CUET'
    });

    this._emit('user', data.user);
    return { ok: true, user: data.user };
  },

  async loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim()
    });
    if (error) return { ok: false, error: 'ईमेल या पासवर्ड गलत है' };
    await this.updateStreak();
    this._emit('user', data.user);
    return { ok: true, user: data.user };
  },

  async logout() {
    await supabaseClient.auth.signOut();
    this._emit('user', null);
  },

  async isLoggedIn() {
    const { data } = await supabaseClient.auth.getSession();
    return !!data.session;
  },

  async getUser() {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData.session) return null;
    
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data?.user) return null;
    
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    // Remap db snake_case to app camelCase
    const user = { ...data.user, ...profile };
    user.isAdmin = profile?.is_admin || false;
    user.lastActive = new Date(profile?.last_active || Date.now()).getTime();
    user.dailyGoal = profile?.daily_goal || 20;
    return user;
  },

  async getProfile() {
    return await this.getUser();
  },

  async updateProfile(updates) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    
    // Convert to snake_case for db
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.lastActive !== undefined) dbUpdates.last_active = new Date(updates.lastActive).toISOString();
    if (updates.dailyGoal !== undefined) dbUpdates.daily_goal = updates.dailyGoal;
    
    await supabaseClient.from('profiles').update(dbUpdates).eq('id', user.id);
    this._emit('user', await this.getUser());
  },

  // ── Progress ── //
  async getProgress() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return {};
    
    const { data } = await supabaseClient.from('progress').select('*').eq('user_id', user.id);
    if (!data) return {};
    
    const progressObj = {};
    data.forEach(row => {
      progressObj[row.module_key] = {
        attempted: row.attempted,
        best: row.best,
        scores: row.scores || [],
        label: row.label,
        last: new Date(row.last_updated).getTime()
      };
    });
    return progressObj;
  },

  async saveProgress(key, data) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    
    const { data: existing } = await supabaseClient.from('progress')
      .select('*').eq('user_id', user.id).eq('module_key', key).maybeSingle();
    
    if (existing) {
      const scores = existing.scores || [];
      scores.push({ score: data.score, total: data.total, date: Date.now(), time: data.time || 0 });
      if (scores.length > 20) scores.splice(0, scores.length - 20);
      
      await supabaseClient.from('progress').update({
        attempted: existing.attempted + 1,
        best: Math.max(existing.best, data.score),
        scores: scores,
        label: data.label,
        last_updated: new Date().toISOString()
      }).eq('user_id', user.id).eq('module_key', key);
    } else {
      await supabaseClient.from('progress').insert({
        user_id: user.id,
        module_key: key,
        attempted: 1,
        best: data.score,
        scores: [{ score: data.score, total: data.total, date: Date.now(), time: data.time || 0 }],
        label: data.label,
        last_updated: new Date().toISOString()
      });
    }
  },

  // ── Bookmarks ── //
  async getBookmarks() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return [];
    
    const { data } = await supabaseClient.from('bookmarks').select('question_id').eq('user_id', user.id);
    return data ? data.map(r => r.question_id) : [];
  },

  async toggleBookmark(questionId) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;
    
    const { data: existing } = await supabaseClient.from('bookmarks')
      .select('*').eq('user_id', user.id).eq('question_id', questionId).maybeSingle();
    
    if (existing) {
      await supabaseClient.from('bookmarks').delete().eq('user_id', user.id).eq('question_id', questionId);
      return false; // removed
    } else {
      await supabaseClient.from('bookmarks').insert({ user_id: user.id, question_id: questionId });
      return true; // added
    }
  },

  async isBookmarked(questionId) {
    const bm = await this.getBookmarks();
    return bm.includes(questionId);
  },

  // ── Wrong Answers ── //
  async getWrongAnswers() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return [];
    
    const { data } = await supabaseClient.from('wrong_answers')
      .select('question_id, date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(200);
    return data ? data.map(r => ({ id: r.question_id, date: new Date(r.date).getTime() })) : [];
  },

  async addWrongAnswer(question) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    
    await supabaseClient.from('wrong_answers').upsert({
      user_id: user.id,
      question_id: question.id,
      date: new Date().toISOString()
    });
  },

  async removeWrongAnswer(questionId) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    
    await supabaseClient.from('wrong_answers').delete().eq('user_id', user.id).eq('question_id', questionId);
  },

  // ── Notes ── //
  async getNotes() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return [];
    
    const { data } = await supabaseClient.from('notes').select('*').eq('user_id', user.id);
    return data ? data.map(n => ({
      ...n,
      created: new Date(n.created_at).getTime(),
      updated: new Date(n.updated_at).getTime()
    })) : [];
  },

  async saveNote(note) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    
    if (note.id) {
      await supabaseClient.from('notes').update({
        content: note.content,
        updated_at: new Date().toISOString()
      }).eq('id', note.id).eq('user_id', user.id);
    } else {
      await supabaseClient.from('notes').insert({
        user_id: user.id,
        content: note.content
      });
    }
  },

  async deleteNote(id) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    await supabaseClient.from('notes').delete().eq('id', id).eq('user_id', user.id);
  },

  // ── Streak ── //
  async updateStreak() {
    const user = await this.getUser();
    if (!user) return;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastActive = user.lastActive || 0;
    const lastDay = new Date(new Date(lastActive).getFullYear(), new Date(lastActive).getMonth(), new Date(lastActive).getDate()).getTime();
    
    let streak = user.streak || 0;
    if (today - lastDay === 86400000) {
      streak += 1;
    } else if (today !== lastDay) {
      streak = 1;
    }
    
    await this.updateProfile({ streak, lastActive: Date.now() });
    return streak;
  },

  async getCustomQuestions() {
    const { data } = await supabaseClient.from('custom_questions').select('*');
    return data || [];
  },

  async saveCustomQuestion(question) {
    // Note: To be fully secure, this should call the insert_custom_question RPC
    // so that the answer is placed into the answer_keys table.
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    const { id, bank, q, opts, a, cat, unit } = question;
    await supabaseClient.rpc('insert_custom_question', {
      p_id: id,
      p_bank: bank,
      p_q: q,
      p_opts: opts,
      p_a: a,
      p_cat: cat,
      p_unit: unit
    });
  },

  async deleteCustomQuestion(id) {
    await supabaseClient.from('custom_questions').delete().eq('id', id);
    // Note: answer_key record is orphaned or we could delete it via cascade/RPC.
  },

  // ── Secure Answer Checking ── //
  async getCorrectAnswer(q_id) {
    const { data, error } = await supabaseClient.rpc('get_correct_answer', { q_id });
    if (error) {
      console.error('Error fetching correct answer:', error);
      return null;
    }
    return data;
  },

  // ── Admin: Passes & Courses (Legacy local for now) ── //
  async getPasses() {
    const raw = localStorage.getItem('sanskrit_setu_passes');
    return raw ? JSON.parse(raw) : null;
  },
  async savePasses(passes) {
    localStorage.setItem('sanskrit_setu_passes', JSON.stringify(passes));
  },
  async getCourses() {
    const raw = localStorage.getItem('sanskrit_setu_courses');
    return raw ? JSON.parse(raw) : null;
  },
  async saveCourses(courses) {
    localStorage.setItem('sanskrit_setu_courses', JSON.stringify(courses));
  },

  // ── Manual Payment Requests ── //
  async getPendingPayments() {
    const { data } = await supabaseClient.from('pending_payments').select('*');
    return data || [];
  },
  async savePendingPayment(payment) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    await supabaseClient.from('pending_payments').insert({
      user_id: user.id,
      amount: payment.amount,
      status: 'pending'
    });
  },
  async updatePendingPaymentStatus(id, status) {
    await supabaseClient.from('pending_payments').update({ status }).eq('id', id);
  },

  // ── AI Settings ── //
  async getAiKey() { return ''; },

  // ── Stats ── //
  async getTodayStats() {
    const progress = await this.getProgress();
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

  async getStats() {
    const progress = await this.getProgress();
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

  async getUsers() {
    const { data } = await supabaseClient.from('profiles').select('*');
    return data ? data.map(p => ({ ...p, isAdmin: p.is_admin, lastActive: p.last_active, dailyGoal: p.daily_goal })) : [];
  },

  async deleteUser(id) {
    await supabaseClient.from('profiles').delete().eq('id', id);
  },

  async clearAll() {
    await this.logout();
    localStorage.clear();
  }
};
