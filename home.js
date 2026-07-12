/* ============================================================
   संस्कृत सेतु — Home Page
   ============================================================ */

function renderHomePage() {
  const container = document.getElementById('app-content');
  const user = Store.getUser();
  const profile = Store.getProfile();
  const stats = Store.getStats();
  const todayStats = Store.getTodayStats();
  const streak = user.streak || 0;
  const progress = Store.getProgress();
  
  // Show header/nav
  const header = document.getElementById('app-header');
  const nav = document.getElementById('bottom-nav');
  if (header) header.style.display = '';
  if (nav) nav.style.display = '';
  
  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'शुभ प्रभातम्';
  if (hour >= 12 && hour < 17) greeting = 'शुभ अपराह्णम्';
  else if (hour >= 17 && hour < 21) greeting = 'शुभ सन्ध्याम्';
  else if (hour >= 21) greeting = 'शुभ रात्रिम्';

  // Find last activity
  const entries = Object.entries(progress);
  const lastEntry = entries.sort((a, b) => (b[1].last || 0) - (a[1].last || 0))[0];
  
  // Suggest next
  const nextCuet = CUET_UNITS.find(u => !progress[`cuet_${u.id}`]);
  const nextGkIdx = GK_TESTS.findIndex((_, i) => !progress[`gk_${i}`]);

  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="home-hero">
        <div class="home-greeting">${greeting}</div>
        <div class="home-title">${Utils.escapeHtml(user.name)} 🙏</div>
        
        <div class="home-stats-row stagger-children">
          ${Components.statCard(streak > 0 ? `🔥 ${streak}` : '—', 'दिन स्ट्रीक')}
          ${Components.statCard(stats.avg + '%', 'औसत स्कोर')}
          ${Components.statCard(todayStats.questionsToday, 'आज के प्रश्न')}
          ${Components.statCard(stats.modulesStarted, 'मॉड्यूल')}
        </div>
      </div>

      <!-- Daily Goal Progress -->
      <div class="glass-card no-hover" style="margin-bottom:var(--space-md)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
          <span style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">📎 आज का लक्ष्य</span>
          <span class="font-mono" style="color:var(--gold);font-size:var(--fs-sm)">${todayStats.questionsToday}/${profile.dailyGoal}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${Math.min(100, Utils.pct(todayStats.questionsToday, profile.dailyGoal))}%"></div>
        </div>
        <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:var(--space-xs)">
          ${todayStats.questionsToday >= profile.dailyGoal ? '🎉 लक्ष्य पूरा!' : `${profile.dailyGoal - todayStats.questionsToday} प्रश्न और शेष`}
        </div>
      </div>

      <!-- Continue Learning -->
      ${lastEntry ? `
        <button class="continue-card" onclick="Router.navigate('${lastEntry[0].startsWith('cuet') ? 'practice-cuet' : 'practice-gk'}')" style="width:100%;margin-bottom:var(--space-lg)">
          <div style="flex:1">
            <div style="font-size:var(--fs-xs);color:var(--gold);font-weight:var(--fw-bold)">जारी रखें</div>
            <div style="font-weight:var(--fw-semi);margin-top:2px">${lastEntry[1].label}</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:2px">${Utils.timeAgo(lastEntry[1].last)} · सर्वोत्तम: ${lastEntry[1].best}%</div>
          </div>
          ${Utils.progressRing(lastEntry[1].best, 48, 4)}
        </button>
      ` : ''}

      ${Components.sectionTitle('तुरन्त शुरू करें')}
      
      <div class="home-quick-actions stagger-children">
        <button class="quick-action-card" onclick="Router.navigate('practice-cuet')">
          <div class="qa-icon">📚</div>
          <div class="qa-title">CUET अभ्यास</div>
          <div class="qa-desc">${CUET_UNITS.length} इकाइयाँ</div>
        </button>
        <button class="quick-action-card" onclick="Router.navigate('practice-gk')">
          <div class="qa-icon">🧠</div>
          <div class="qa-title">सामान्य ज्ञान</div>
          <div class="qa-desc">${GK_TESTS.length} परीक्षाएँ</div>
        </button>
        <button class="quick-action-card" onclick="startQuickPractice()">
          <div class="qa-icon">⚡</div>
          <div class="qa-title">त्वरित अभ्यास</div>
          <div class="qa-desc">१० प्रश्न</div>
        </button>
        <button class="quick-action-card" onclick="startWrongAnswerPractice()">
          <div class="qa-icon">🔄</div>
          <div class="qa-title">गलत उत्तर</div>
          <div class="qa-desc">पुनः अभ्यास</div>
        </button>
      </div>

      ${Components.sectionTitle('परीक्षा तैयारी')}
      
      <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-sm)">
        <button class="exam-card" onclick="Router.navigate('exams')">
          <div class="exam-meta">
            <span class="badge badge-gold">CUET</span>
            <span class="badge badge-maroon">GK</span>
          </div>
          <div class="exam-title">संस्कृत परीक्षा केंद्र</div>
          <div class="exam-desc">CUET, Shastri, Acharya परीक्षाओं के लिए व्यापक प्रश्न बैंक</div>
          <div class="exam-cta">अभ्यास शुरू करें →</div>
        </button>
      </div>

      ${nextCuet || nextGkIdx >= 0 ? `
        ${Components.sectionTitle('सुझावित अगला कदम')}
        <button class="glass-card" style="width:100%;text-align:left;cursor:pointer" onclick="${nextCuet ? `Router.navigate('quiz', {type:'cuet',unit:'${nextCuet.id}'})` : `Router.navigate('quiz', {type:'gk',test:'${nextGkIdx}'})`}">
          <div style="font-size:var(--fs-xs);color:var(--gold);font-weight:var(--fw-bold)">${nextCuet ? 'CUET · ' + nextCuet.num : 'सामान्य ज्ञान'}</div>
          <div style="font-weight:var(--fw-semi);margin-top:4px">${nextCuet ? nextCuet.label : 'परीक्षा ' + (nextGkIdx + 1)}</div>
          <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px">अभी तक शुरू नहीं किया — अभ्यास आरम्भ करें →</div>
        </button>
      ` : ''}
    </div>
  `;
}

function startQuickPractice() {
  // Pick 10 random questions from all
  const deck = Utils.shuffle([...ALL_QUESTIONS]).slice(0, 10);
  _startQuiz(deck, 'त्वरित अभ्यास', 'quick');
}

function startWrongAnswerPractice() {
  const wrongIds = Store.getWrongAnswers().map(w => w.id);
  if (wrongIds.length === 0) {
    Components.showToast('कोई गलत उत्तर नहीं मिला! 🎉', 'info');
    return;
  }
  const deck = wrongIds.map(id => QUESTION_MAP[id]).filter(Boolean).slice(0, 25);
  if (deck.length === 0) {
    Components.showToast('कोई प्रश्न उपलब्ध नहीं', 'info');
    return;
  }
  _startQuiz(Utils.shuffle(deck), 'गलत उत्तर — पुनः अभ्यास', 'wrong_review');
}
