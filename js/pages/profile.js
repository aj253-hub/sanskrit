/* ============================================================
   संस्कृत सेतु — Profile Page
   ============================================================ */

async function renderProfilePage() {
  const container = document.getElementById('app-content');
  const profile = await Store.getProfile();
  const stats = await Store.getStats();
  const bookmarks = await Store.getBookmarks();
  const notes = await Store.getNotes();
  const wrongAnswers = await Store.getWrongAnswers();
  const bookmarkCount = bookmarks.length;
  const noteCount = notes.length;
  const wrongCount = wrongAnswers.length;

  container.innerHTML = `
    <div class="page-container page-enter">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">${Utils.getInitials(profile.name)}</div>
        <div class="profile-name">${Utils.escapeHtml(profile.name)}</div>
        <div style="color:var(--text-muted);font-size:var(--fs-sm);margin-top:var(--space-xs)">${Utils.escapeHtml(profile.email)}</div>
        <div style="display:flex;justify-content:center;gap:var(--space-lg);margin-top:var(--space-md)">
          <div style="text-align:center">
            <div class="streak-flame"><span class="flame-icon">🔥</span>${profile.streak}</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted)">स्ट्रीक</div>
          </div>
          <div style="text-align:center">
            <div style="font-family:var(--font-mono);font-weight:var(--fw-bold);color:var(--gold)">${stats.avg}%</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted)">औसत</div>
          </div>
          <div style="text-align:center">
            <div style="font-family:var(--font-mono);font-weight:var(--fw-bold);color:var(--gold)">${stats.totalAttempts}</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted)">प्रयास</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Goal Selection -->
      <div class="profile-section">
        <div class="section-title">लक्ष्य परीक्षा</div>
        <div style="display:flex;gap:var(--space-sm);flex-wrap:wrap">
          ${['CUET', 'Shastri', 'Acharya', 'General'].map(g => `
            <button class="chip ${profile.goal === g ? 'chip-active' : 'chip-inactive'}" 
              onclick="updateGoal('${g}')">${g}</button>
          `).join('')}
        </div>
      </div>

      <!-- Daily Goal -->
      <div class="profile-section">
        <div class="section-title">दैनिक लक्ष्य</div>
        <div class="glass-card no-hover" style="padding:var(--space-md)">
          <div style="display:flex;align-items:center;gap:var(--space-md)">
            <span style="font-size:24px">🎯</span>
            <div style="flex:1">
              <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">प्रतिदिन प्रश्न</div>
              <div style="font-size:var(--fs-xs);color:var(--text-muted)">अपना दैनिक लक्ष्य चुनें</div>
            </div>
            <select class="input-field" style="width:80px;padding:8px 12px" onchange="updateDailyGoal(this.value)">
              ${[10, 15, 20, 30, 50].map(n => `
                <option value="${n}" ${profile.dailyGoal === n ? 'selected' : ''}>${n}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="profile-section">
        <div class="section-title">उपकरण</div>
        
        <button class="profile-menu-item" onclick="Router.navigate('bookmarks')">
          <span class="pm-icon">⭐</span>
          <span class="pm-label">बुकमार्क</span>
          <span class="badge badge-gold">${bookmarkCount}</span>
          <span class="pm-arrow">→</span>
        </button>
        
        <button class="profile-menu-item" onclick="Router.navigate('notes')">
          <span class="pm-icon">📝</span>
          <span class="pm-label">नोट्स</span>
          <span class="badge badge-gold">${noteCount}</span>
          <span class="pm-arrow">→</span>
        </button>
        
        <button class="profile-menu-item" onclick="Router.navigate('analytics')">
          <span class="pm-icon">📊</span>
          <span class="pm-label">विस्तृत विश्लेषण</span>
          <span class="pm-arrow">→</span>
        </button>

        <button class="profile-menu-item" onclick="startWrongAnswerPractice()">
          <span class="pm-icon">🔄</span>
          <span class="pm-label">गलत उत्तर बैंक</span>
          <span class="badge badge-maroon">${wrongCount}</span>
          <span class="pm-arrow">→</span>
        </button>
      </div>

      <!-- Account -->
      <div class="profile-section">
        <div class="section-title">खाता</div>
        
        <button class="profile-menu-item" onclick="editProfileName()">
          <span class="pm-icon">✏️</span>
          <span class="pm-label">नाम बदलें</span>
          <span class="pm-arrow">→</span>
        </button>

        <button class="profile-menu-item" onclick="exportData()">
          <span class="pm-icon">📤</span>
          <span class="pm-label">डेटा निर्यात करें</span>
          <span class="pm-arrow">→</span>
        </button>

        <button class="profile-menu-item" style="border-color:rgba(201,68,68,0.2)" onclick="handleLogout()">
          <span class="pm-icon">🚪</span>
          <span class="pm-label" style="color:var(--red-light)">लॉग आउट</span>
          <span class="pm-arrow">→</span>
        </button>
      </div>

      <!-- Info -->
      <div style="text-align:center;margin-top:var(--space-2xl);color:var(--text-muted);font-size:var(--fs-xs)">
        <p>संस्कृत सेतु v1.0</p>
        <p style="margin-top:4px">खाता बनाया: ${Utils.formatDate(profile.joined)}</p>
      </div>
    </div>
  `;
}

async function updateGoal(goal) {
  await Store.updateProfile({ goal });
  Components.showToast(`लक्ष्य बदला: ${goal}`, 'success');
  await renderProfilePage();
}

async function updateDailyGoal(value) {
  await Store.updateProfile({ dailyGoal: parseInt(value) });
  Components.showToast('दैनिक लक्ष्य अपडेट किया', 'success');
}

async function editProfileName() {
  const profile = await Store.getProfile();
  const name = prompt('नया नाम दर्ज करें:', profile.name);
  if (name && name.trim()) {
    await Store.updateProfile({ name: name.trim() });
    Components.showToast('नाम अपडेट किया', 'success');
    // Update header avatar
    const headerEl = document.getElementById('app-header');
    if (headerEl) headerEl.outerHTML = await Components.renderHeader();
    await renderProfilePage();
  }
}

async function exportData() {
  const data = {
    profile: await Store.getProfile(),
    progress: await Store.getProgress(),
    bookmarks: await Store.getBookmarks(),
    notes: await Store.getNotes(),
    wrongAnswers: await Store.getWrongAnswers(),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sanskrit-setu-data-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  Components.showToast('डेटा निर्यात हो गया 📤', 'success');
}

function handleLogout() {
  Components.showConfirm('लॉग आउट?', 'क्या आप लॉग आउट करना चाहते हैं?', async () => {
    await Store.logout();
    window.location.hash = '#login';
    window.location.reload();
  });
}
