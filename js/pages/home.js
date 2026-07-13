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
    <div class="page-container page-enter" style="padding-top:16px;padding-bottom:100px;">
      
      <!-- Top Banner / User Greeting -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-md)">
        <div>
          <div style="color:var(--text-secondary);font-size:var(--fs-sm)">${greeting}</div>
          <div style="font-size:var(--fs-xl);font-weight:var(--fw-bold);color:var(--gold);font-family:var(--font-hindi)">${Utils.escapeHtml(user.name)}</div>
        </div>
        <div class="glass-card" style="padding:8px 12px;display:flex;gap:8px;align-items:center" onclick="Router.navigate('pass')">
          <span style="font-size:20px">🎟️</span>
          <div>
            <div style="font-size:10px;color:var(--gold);font-weight:bold">संस्कृत सेतु पास</div>
            <div style="font-size:12px">${user.isPro ? 'सक्रिय' : 'प्राप्त करें'}</div>
          </div>
        </div>
      </div>

      <!-- Hero Carousel -->
      <div class="glass-card" style="padding:0;overflow:hidden;border:none;margin-bottom:var(--space-xl);position:relative;background:linear-gradient(135deg, var(--maroon-deep) 0%, var(--bg-primary) 100%)">
        <div style="padding:var(--space-xl);position:relative;z-index:2">
          <span class="badge" style="background:var(--gold);color:var(--bg-deep);font-weight:bold;margin-bottom:8px">नया ऑफर</span>
          <h3 style="font-size:var(--fs-xl);color:white;margin-bottom:8px">NTA UGC NET की तैयारी शुरू करें</h3>
          <p style="color:rgba(255,255,255,0.8);font-size:var(--fs-sm);margin-bottom:16px">टेस्ट सीरीज के साथ अपनी सफलता सुनिश्चित करें।</p>
          <button class="btn" style="background:white;color:var(--maroon-deep)" onclick="Router.navigate('exams')">टेस्ट देखें</button>
        </div>
        <div style="position:absolute;right:-20px;bottom:-20px;font-size:150px;opacity:0.2;z-index:1">📚</div>
      </div>

      <!-- Quick Actions Grid -->
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:var(--space-sm);margin-bottom:var(--space-xl);text-align:center">
        <div onclick="Router.navigate('classes')" style="cursor:pointer">
          <div style="width:56px;height:56px;border-radius:var(--radius-full);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:24px;color:var(--blue-light)">📺</div>
          <div style="font-size:11px;font-weight:var(--fw-semi)">लाइव क्लास</div>
        </div>
        <div onclick="Router.navigate('exams')" style="cursor:pointer">
          <div style="width:56px;height:56px;border-radius:var(--radius-full);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:24px;color:var(--gold)">📝</div>
          <div style="font-size:11px;font-weight:var(--fw-semi)">टेस्ट सीरीज</div>
        </div>
        <div onclick="Router.navigate('materials')" style="cursor:pointer">
          <div style="width:56px;height:56px;border-radius:var(--radius-full);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:24px;color:var(--green-light)">📄</div>
          <div style="font-size:11px;font-weight:var(--fw-semi)">PDF नोट्स</div>
        </div>
        <div onclick="startQuickPractice()" style="cursor:pointer">
          <div style="width:56px;height:56px;border-radius:var(--radius-full);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:24px;color:var(--orange)">⚡</div>
          <div style="font-size:11px;font-weight:var(--fw-semi)">क्विज़</div>
        </div>
      </div>

      ${Components.sectionTitle('अनुशंसित टेस्ट सीरीज़', '<a href="#exams" style="color:var(--gold);font-size:var(--fs-sm)">सभी देखें</a>')}
      
      <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-sm);margin-bottom:var(--space-xl)">
        <div class="glass-card" style="display:flex;gap:12px;padding:12px;align-items:center" onclick="Router.navigate('exams')">
          <div style="width:48px;height:48px;background:rgba(201,162,39,0.1);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--gold)">🎓</div>
          <div style="flex:1">
            <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">UGC NET JRF संस्कृत</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">80+ टेस्ट · 50k+ छात्र</div>
          </div>
          <button class="btn btn-primary" style="padding:6px 12px;font-size:11px">Join</button>
        </div>
        <div class="glass-card" style="display:flex;gap:12px;padding:12px;align-items:center" onclick="Router.navigate('exams')">
          <div style="width:48px;height:48px;background:rgba(201,162,39,0.1);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;color:var(--gold)">📜</div>
          <div style="flex:1">
            <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">CUET (UG & PG)</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">150+ पेपर्स · विस्तृत हल</div>
          </div>
          <button class="btn btn-outline" style="padding:6px 12px;font-size:11px;border-color:var(--gold);color:var(--gold)">Explore</button>
        </div>
      </div>
      
      <!-- Current Progress & Stats -->
      ${Components.sectionTitle('आपकी प्रगति')}
      <div class="glass-card" style="margin-bottom:var(--space-lg)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
          <span style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">आज का लक्ष्य (${profile.dailyGoal} प्रश्न)</span>
          <span class="font-mono" style="color:var(--gold);font-size:var(--fs-sm)">${Math.round(Utils.pct(todayStats.questionsToday, profile.dailyGoal))}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${Math.min(100, Utils.pct(todayStats.questionsToday, profile.dailyGoal))}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:var(--space-md)">
           <div style="text-align:center">
             <div style="font-size:var(--fs-lg);color:var(--gold);font-weight:bold;font-family:var(--font-mono)">${streak > 0 ? streak : 0}</div>
             <div style="font-size:10px;color:var(--text-muted)">स्ट्रीक (दिन)</div>
           </div>
           <div style="text-align:center">
             <div style="font-size:var(--fs-lg);color:var(--gold);font-weight:bold;font-family:var(--font-mono)">${stats.avg}%</div>
             <div style="font-size:10px;color:var(--text-muted)">औसत स्कोर</div>
           </div>
           <div style="text-align:center">
             <div style="font-size:var(--fs-lg);color:var(--gold);font-weight:bold;font-family:var(--font-mono)">${stats.questionsAttempted}</div>
             <div style="font-size:10px;color:var(--text-muted)">प्रश्न हल किए</div>
           </div>
        </div>
      </div>
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
