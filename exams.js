/* ============================================================
   संस्कृत सेतु — Exams Page
   ============================================================ */

function renderExamsPage() {
  const container = document.getElementById('app-content');
  const progress = Store.getProgress();
  
  // Calculate stats for each exam type
  const cuetProgress = CUET_UNITS.map(u => progress[`cuet_${u.id}`]).filter(Boolean);
  const gkProgress = GK_TESTS.map((_, i) => progress[`gk_${i}`]).filter(Boolean);
  
  const cuetAvg = cuetProgress.length > 0 ? Math.round(cuetProgress.reduce((s, p) => s + p.best, 0) / cuetProgress.length) : 0;
  const gkAvg = gkProgress.length > 0 ? Math.round(gkProgress.reduce((s, p) => s + p.best, 0) / gkProgress.length) : 0;

  container.innerHTML = `
    <div class="page-container page-enter">
      <h3 style="font-size:var(--fs-xl);margin-bottom:var(--space-xs)">परीक्षा केंद्र</h3>
      <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-xl)">
        जिस परीक्षा की तैयारी कर रहे हैं, उसे चुनें।
      </p>

      <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-md)">
        <!-- CUET Card -->
        <button class="exam-card" onclick="Router.navigate('practice-cuet')">
          <div class="exam-meta">
            <span class="badge badge-gold">CUET</span>
            <span class="badge badge-blue">Code 325</span>
            ${cuetProgress.length > 0 ? `<span class="badge badge-green">${cuetProgress.length}/${CUET_UNITS.length} शुरू</span>` : ''}
          </div>
          <div class="exam-title">CUET संस्कृत</div>
          <div class="exam-desc">
            Applied grammar: शब्दरूप, धातुरूप, सन्धि, समास, प्रत्यय, विभक्ति, अलङ्कार, छन्द, गद्य-पद्य — ${CUET_UNITS.length} इकाइयाँ
          </div>
          ${cuetAvg > 0 ? `
            <div style="display:flex;align-items:center;gap:var(--space-md);margin-top:var(--space-sm)">
              ${Utils.progressRing(cuetAvg, 36, 3)}
              <span style="font-size:var(--fs-xs);color:var(--text-muted)">औसत सर्वोत्तम स्कोर</span>
            </div>
          ` : ''}
          <div class="exam-cta">अभ्यास शुरू करें →</div>
        </button>

        <!-- GK Card -->
        <button class="exam-card" onclick="Router.navigate('practice-gk')">
          <div class="exam-meta">
            <span class="badge badge-maroon">GK</span>
            <span class="badge badge-blue">मिश्रित</span>
            ${gkProgress.length > 0 ? `<span class="badge badge-green">${gkProgress.length}/${GK_TESTS.length} शुरू</span>` : ''}
          </div>
          <div class="exam-title">संस्कृत सामान्य ज्ञान</div>
          <div class="exam-desc">
            वेद, वेदांग, दर्शन, उपनिषद्, साहित्य — Shastri/Acharya परीक्षाओं हेतु ${GK_TESTS.length} मिश्रित परीक्षाएँ, प्रत्येक में 25 प्रश्न
          </div>
          ${gkAvg > 0 ? `
            <div style="display:flex;align-items:center;gap:var(--space-md);margin-top:var(--space-sm)">
              ${Utils.progressRing(gkAvg, 36, 3)}
              <span style="font-size:var(--fs-xs);color:var(--text-muted)">औसत सर्वोत्तम स्कोर</span>
            </div>
          ` : ''}
          <div class="exam-cta">अभ्यास शुरू करें →</div>
        </button>

        <!-- Mock Test Card -->
        <button class="exam-card" onclick="startMockTest()">
          <div class="exam-meta">
            <span class="badge badge-gold">MOCK</span>
            <span class="badge badge-maroon">⏱️ समयबद्ध</span>
          </div>
          <div class="exam-title">मॉक परीक्षा</div>
          <div class="exam-desc">
            50 प्रश्न · 60 मिनट · सम्पूर्ण परीक्षा अनुभव — CUET + GK मिश्रित
          </div>
          <div class="exam-cta">मॉक शुरू करें →</div>
        </button>

        <!-- Wrong Answers -->
        <button class="exam-card" onclick="startWrongAnswerPractice()">
          <div class="exam-meta">
            <span class="badge badge-maroon">🔄</span>
          </div>
          <div class="exam-title">गलत उत्तर बैंक</div>
          <div class="exam-desc">
            ${Store.getWrongAnswers().length} गलत उत्तर सहेजे गए — इन्हें दोबारा हल करें
          </div>
          <div class="exam-cta">पुनः अभ्यास →</div>
        </button>
      </div>
    </div>
  `;
}

function startMockTest() {
  const deck = Utils.shuffle([...ALL_QUESTIONS]).slice(0, 50);
  _startQuiz(deck, 'मॉक परीक्षा (50 प्रश्न)', 'mock', true, 3600);
}
