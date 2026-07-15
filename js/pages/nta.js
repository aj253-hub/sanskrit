/* ============================================================
   संस्कृत सेतु — NTA UGC NET Practice & CBT Mock Engine
   ============================================================ */

// ── Practice NTA List (Unit-wise) ── //
async function renderPracticeNTAPage() {
  const container = document.getElementById('app-content');
  const progress = await Store.getProgress();

  container.innerHTML = `
    <div class="page-container page-enter" style="padding-bottom: 100px;">
      ${Components.pageHeader('NTA UGC NET (Sanskrit)')}
      
      <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-lg)">
        इकाई-वार अभ्यास — प्रत्येक इकाई में विषय-विशेष प्रश्न हैं।
      </p>
      
      <div class="practice-list stagger-children">
        ${NTA_UNITS.map(u => {
          const p = progress[`nta_${u.id}`];
          const count = QUESTIONS_NTA.filter(q => q.unit === u.id).length;
          return `
            <button class="practice-item" onclick="Router.navigate('quiz', {type:'nta',unit:'${u.id}'})">
              <div class="pi-num">${u.num.replace('इकाई-', '')}</div>
              <div class="pi-info">
                <div class="pi-title">${u.label}</div>
                <div class="pi-sub">${count} प्रश्न${p ? ` · ${p.attempted} प्रयास` : ''}</div>
              </div>
              ${Utils.progressRing(p ? p.best : 0, count, 4)}
            </button>
          `;
        }).join('')}
      </div>
      
      <div style="margin-top: var(--space-2xl);">
        ${Components.sectionTitle('NTA CBT Mock Test')}
        <div class="glass-card" style="padding:var(--space-md);display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);">
          <div>
            <div style="font-size:var(--fs-md);font-weight:var(--fw-bold);color:var(--text-primary);margin-bottom:4px">
              UGC NET Paper 2 (Sanskrit)
            </div>
            <div style="font-size:12px;color:var(--text-muted)">${QUESTIONS_NTA.length} प्रश्न · 180 मिनट · NTA CBT Pattern</div>
          </div>
          <button class="btn btn-primary" onclick="Router.navigate('quiz-nta', {test:0})">
            Start Mock
          </button>
        </div>
      </div>
    </div>
  `;
}

// ── NTA CBT Quiz State ── //
let _ntaState = null;
let _ntaTimer = null;

function _startNTAQuiz(deck, label, progressKey, totalSeconds = 10800) {
  _ntaState = {
    deck: deck.map(q => ({ ...q, opts: Utils.shuffle([...q.opts]) })),
    idx: 0,
    answers: new Array(deck.length).fill(null), // null (unanswered), string (answered)
    statuses: new Array(deck.length).fill('not-visited'), // 'not-visited', 'not-answered', 'answered', 'marked', 'answered-marked'
    label,
    progressKey,
    timeRemaining: totalSeconds,
    startTime: Date.now()
  };
  
  _ntaState.statuses[0] = 'not-answered';

  if (totalSeconds > 0) {
    if (_ntaTimer) clearInterval(_ntaTimer);
    _ntaTimer = setInterval(() => {
      if (!_ntaState) { clearInterval(_ntaTimer); return; }
      _ntaState.timeRemaining--;
      const timerEl = document.getElementById('nta-timer-display');
      if (timerEl) {
        timerEl.textContent = Utils.formatTime(_ntaState.timeRemaining);
      }
      if (_ntaState.timeRemaining <= 0) {
        clearInterval(_ntaTimer);
        _finishNTAQuiz();
      }
    }, 1000);
  }

  Router.navigate('quiz-nta');
}

// ── NTA CBT Quiz View ── //
async function renderNTAQuizPage(params) {
  const container = document.getElementById('app-content');
  
  // Initialize if coming directly to the route with params
  if (!_ntaState && params.test !== undefined) {
    const testIdx = parseInt(params.test || '0');
    const deck = NTA_TESTS[testIdx] ? [...NTA_TESTS[testIdx]] : [];
    if (!deck.length) {
      Router.navigate('practice-nta');
      return;
    }
    _startNTAQuiz(deck, 'UGC NET Sanskrit Mock Test', `nta_mock_${testIdx}`, 10800);
    return;
  }

  if (!_ntaState) {
    Router.navigate('practice-nta');
    return;
  }

  const s = _ntaState;
  const q = s.deck[s.idx];
  const currentAnswer = s.answers[s.idx];
  
  // Status Counts
  const counts = {
    'answered': 0,
    'not-answered': 0,
    'not-visited': 0,
    'marked': 0,
    'answered-marked': 0
  };
  s.statuses.forEach(st => counts[st]++);

  // Format HTML
  container.innerHTML = `
    <div class="nta-cbt-container">
      <!-- Header -->
      <div class="nta-header">
        <div class="nta-title">${s.label}</div>
        <div class="nta-timer">Time Left: <span id="nta-timer-display" style="font-weight:bold;color:var(--gold);">${Utils.formatTime(s.timeRemaining)}</span></div>
      </div>
      
      <div class="nta-body">
        <!-- Left Panel: Question -->
        <div class="nta-question-panel">
          <div class="nta-question-header">
            <span class="nta-q-num">Question No. ${s.idx + 1}</span>
          </div>
          
          <div class="nta-question-text">${q.q}</div>
          
          <div class="nta-options-list">
            ${q.opts.map((opt, i) => `
              <label class="nta-option-label">
                <input type="radio" name="nta-opt" value="${Utils.escapeHtml(opt).replace(/'/g, "\\'")}" ${currentAnswer === opt ? 'checked' : ''} onchange="ntaSelectOption(this.value)">
                <span class="nta-opt-text">${opt}</span>
              </label>
            `).join('')}
          </div>
          
          <div class="nta-actions">
            <button class="btn btn-primary" style="background:#5cb85c;border-color:#4cae4c;color:#fff" onclick="ntaSaveAndNext()">Save & Next</button>
            <button class="btn btn-outline" style="color:#d9534f;border-color:#d9534f" onclick="ntaClearResponse()">Clear</button>
            <button class="btn btn-outline" style="color:#f0ad4e;border-color:#eea236" onclick="ntaSaveAndMark()">Save & Mark for Review</button>
            <button class="btn btn-outline" style="color:#5bc0de;border-color:#46b8da" onclick="ntaMarkAndNext()">Mark for Review & Next</button>
          </div>
        </div>
        
        <!-- Right Panel: Palette -->
        <div class="nta-palette-panel">
          <div class="nta-user-info">
            <img src="${(await Store.getUser())?.avatar || 'assets/images/logo.jpeg'}" alt="User" style="width:50px;height:50px;border-radius:50%">
            <div style="font-size:var(--fs-sm);font-weight:bold;">${(await Store.getUser())?.name || 'Candidate'}</div>
          </div>
          
          <div class="nta-status-legend">
            <div class="nta-legend-item"><div class="nta-q-btn answered">${counts['answered']}</div> Answered</div>
            <div class="nta-legend-item"><div class="nta-q-btn not-answered">${counts['not-answered']}</div> Not Answered</div>
            <div class="nta-legend-item"><div class="nta-q-btn not-visited">${counts['not-visited']}</div> Not Visited</div>
            <div class="nta-legend-item"><div class="nta-q-btn marked">${counts['marked']}</div> Marked for Review</div>
            <div class="nta-legend-item"><div class="nta-q-btn answered-marked">${counts['answered-marked']}</div> Answered & Marked</div>
          </div>
          
          <div class="nta-palette-grid">
            ${s.deck.map((_, i) => `
              <button class="nta-q-btn ${s.statuses[i]} ${i === s.idx ? 'active' : ''}" onclick="ntaJumpToQuestion(${i})">
                ${i + 1}
              </button>
            `).join('')}
          </div>
          
          <div class="nta-submit-area">
            <button class="btn btn-primary" style="width:100%;font-size:16px;padding:12px" onclick="ntaConfirmSubmit()">Submit Exam</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── NTA Actions ── //
function ntaSelectOption(val) {
  if (!_ntaState) return;
  _ntaState.answers[_ntaState.idx] = val;
}

function _updateCurrentStatus(isAnswered, isMarked) {
  if (!_ntaState) return;
  const s = _ntaState;
  
  if (isAnswered && isMarked) s.statuses[s.idx] = 'answered-marked';
  else if (isAnswered) s.statuses[s.idx] = 'answered';
  else if (isMarked) s.statuses[s.idx] = 'marked';
  else s.statuses[s.idx] = 'not-answered';
}

async function ntaSaveAndNext() {
  if (!_ntaState) return;
  const s = _ntaState;
  const hasAnswer = s.answers[s.idx] !== null;
  
  _updateCurrentStatus(hasAnswer, false);
  await ntaJumpToQuestion(s.idx + 1);
}

function ntaClearResponse() {
  if (!_ntaState) return;
  _ntaState.answers[_ntaState.idx] = null;
  // Uncheck radio buttons in DOM
  document.querySelectorAll('input[name="nta-opt"]').forEach(el => el.checked = false);
}

async function ntaSaveAndMark() {
  if (!_ntaState) return;
  const s = _ntaState;
  const hasAnswer = s.answers[s.idx] !== null;
  
  _updateCurrentStatus(hasAnswer, true);
  await ntaJumpToQuestion(s.idx + 1);
}

async function ntaMarkAndNext() {
  if (!_ntaState) return;
  const s = _ntaState;
  const hasAnswer = s.answers[s.idx] !== null;
  
  _updateCurrentStatus(hasAnswer, true);
  await ntaJumpToQuestion(s.idx + 1);
}

async function ntaJumpToQuestion(targetIdx) {
  if (!_ntaState) return;
  const s = _ntaState;
  
  // If moving away from current without saving, mark as not-answered if it was not-visited
  if (s.statuses[s.idx] === 'not-visited') {
    s.statuses[s.idx] = 'not-answered';
  }

  // Handle bounds
  if (targetIdx >= s.deck.length) {
    await renderNTAQuizPage({});
    return;
  }
  
  s.idx = targetIdx;
  if (s.statuses[s.idx] === 'not-visited') {
    s.statuses[s.idx] = 'not-answered';
  }
  
  await renderNTAQuizPage({});
}

function ntaConfirmSubmit() {
  Components.showConfirm('Submit Exam?', 'Are you sure you want to submit the exam? You will not be able to change your answers.', async () => {
    await _finishNTAQuiz();
  });
}

async function _finishNTAQuiz() {
  if (_ntaTimer) { clearInterval(_ntaTimer); _ntaTimer = null; }
  if (!_ntaState) return;
  
  const s = _ntaState;
  const elapsed = Math.round((Date.now() - s.startTime) / 1000);
  
  // Calculate NTA scoring (+2 for correct, 0 for incorrect/unanswered)
  
  const container = document.getElementById('app-content');
  if(container) container.innerHTML = '<div class="page-container page-enter" style="text-align:center;padding-top:100px;"><h2>Submitting Exam...</h2><p>Please wait while we evaluate your answers securely.</p></div>';

  let correct = 0;
  
  const gradingPromises = s.deck.map(async (q, i) => {
    if (s.answers[i] === null) return 0;
    const realAnswer = await Store.getCorrectAnswer(q.id);
    if (Utils.checkAnswer(s.answers[i], realAnswer)) {
      return 1;
    } else {
      q.a = realAnswer; // For any UI that might need it later
      await Store.addWrongAnswer(q);
      return 0;
    }
  });

  const results = await Promise.all(gradingPromises);
  correct = results.reduce((sum, val) => sum + val, 0);

  const score = correct * 2;
  const total = s.deck.length * 2;
  
  // Save progress
  await Store.saveProgress(s.progressKey, {
    score: score,
    total: total,
    label: s.label,
    time: elapsed
  });
  
  await Store.updateStreak();
  Router.navigate('results');
}
