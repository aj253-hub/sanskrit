/* ============================================================
   संस्कृत सेतु — Practice Hub + Quiz Engine
   ============================================================ */

// ── Practice GK List ── //
async function renderPracticeGKPage() {
  const container = document.getElementById('app-content');
  const progress = await Store.getProgress();

  container.innerHTML = `
    <div class="page-container page-enter">
      ${Components.pageHeader('संस्कृत सामान्य ज्ञान')}
      
      <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-lg)">
        प्रत्येक परीक्षा में 25 मिश्रित प्रश्न हैं। किसी भी परीक्षा से शुरू करें।
      </p>
      
      <div class="practice-list stagger-children">
        ${GK_TESTS.map((_, i) => {
          const p = progress[`gk_${i}`];
          return `
            <button class="practice-item" onclick="Router.navigate('quiz', {type:'gk',test:'${i}'})">
              <div class="pi-num">${String(i + 1).padStart(2, '0')}</div>
              <div class="pi-info">
                <div class="pi-title">परीक्षा ${i + 1}</div>
                <div class="pi-sub">२५ प्रश्न (मिश्रित विषय)${p ? ` · ${p.attempted} प्रयास` : ''}</div>
              </div>
              ${Utils.progressRing(p ? p.best : 0, 44, 4)}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ── Practice CUET List ── //
async function renderPracticeCUETPage() {
  const container = document.getElementById('app-content');
  const progress = await Store.getProgress();

  container.innerHTML = `
    <div class="page-container page-enter">
      ${Components.pageHeader('CUET संस्कृत (Code 325)')}
      
      <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-lg)">
        इकाई-वार अभ्यास — प्रत्येक इकाई में विषय-विशेष प्रश्न हैं।
      </p>
      
      <div class="practice-list stagger-children">
        ${CUET_UNITS.map(u => {
          const p = progress[`cuet_${u.id}`];
          const count = QUESTIONS_CUET.filter(q => q.unit === u.id).length;
          return `
            <button class="practice-item" onclick="Router.navigate('quiz', {type:'cuet',unit:'${u.id}'})">
              <div class="pi-num">${u.num.replace('इकाई-', '')}</div>
              <div class="pi-info">
                <div class="pi-title">${u.label}</div>
                <div class="pi-sub">${count} प्रश्न${p ? ` · ${p.attempted} प्रयास` : ''}</div>
              </div>
              ${Utils.progressRing(p ? p.best : 0, 44, 4)}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ── Quiz State ── //
let _quizState = null;
let _quizTimer = null;

function _startQuiz(deck, label, progressKey, timed = false, totalSeconds = 0) {
  _quizState = {
    // Store correctAnswer (opts[0] of original) BEFORE shuffling options.
    // This eliminates the need for any async answer-key fetch during the quiz
    // and prevents the failure-mode where getCorrectAnswer() returns null/undefined.
    deck: deck.map(q => {
      const correctAnswer = q.opts[0]; // always opts[0] in source data
      return { ...q, correctAnswer, opts: Utils.shuffle([...q.opts]) };
    }),
    idx: 0,
    picked: null,
    locked: false,
    label,
    progressKey,
    correct: 0,
    answers: [],
    timed,
    totalSeconds,
    timeRemaining: totalSeconds,
    startTime: Date.now()
  };

  if (timed && totalSeconds > 0) {
    _startTimer();
  }

  Router.navigate('quiz');
}

function _startTimer() {
  if (_quizTimer) clearInterval(_quizTimer);
  _quizTimer = setInterval(() => {
    if (!_quizState) { clearInterval(_quizTimer); return; }
    _quizState.timeRemaining--;
    const timerEl = document.getElementById('quiz-timer-display');
    if (timerEl) {
      timerEl.textContent = Utils.formatTime(_quizState.timeRemaining);
    }
    if (_quizState.timeRemaining <= 0) {
      clearInterval(_quizTimer);
      _finishQuiz();
    }
  }, 1000);
}

// ── Quiz View ── //
async function renderQuizPage(params) {
  const container = document.getElementById('app-content');
  
  // If no active quiz, start one from params
  if (!_quizState && params.type) {
    let deck, label, key;
    if (params.type === 'gk') {
      const testIdx = parseInt(params.test || '0');
      deck = [...GK_TESTS[testIdx]];
      label = `सामान्य ज्ञान — परीक्षा ${testIdx + 1}`;
      key = `gk_${testIdx}`;
    } else if (params.type === 'cuet') {
      deck = QUESTIONS_CUET.filter(q => q.unit === params.unit);
      const unit = CUET_UNITS.find(u => u.id === params.unit);
      label = `CUET · ${unit ? unit.label : params.unit}`;
      key = `cuet_${params.unit}`;
    } else {
      Router.navigate('exams');
      return;
    }
    if (!deck || deck.length === 0) {
      Components.showToast('कोई प्रश्न उपलब्ध नहीं', 'error');
      Router.navigate('exams');
      return;
    }
    _startQuiz(deck, label, key);
    return;
  }

  if (!_quizState) {
    Router.navigate('exams');
    return;
  }

  const s = _quizState;
  const q = s.deck[s.idx];
  const pctDone = Math.round((s.idx / s.deck.length) * 100);
  const tag = q.bank === 'gk' ? (GK_CAT_LABELS[q.cat] || '') : (CUET_UNITS.find(u => u.id === q.unit)?.label || '');
  const isBookmarked = await Store.isBookmarked(q.id);
  const letters = ['अ', 'आ', 'इ', 'ई'];

  container.innerHTML = `
    <div class="page-container page-enter">
      <div class="quiz-header">
        <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm);color:var(--text-primary)">${s.label}</div>
        <div style="display:flex;align-items:center;gap:var(--space-md)">
          ${s.timed ? `<div class="quiz-timer">⏱️ <span id="quiz-timer-display">${Utils.formatTime(s.timeRemaining)}</span></div>` : ''}
          <div class="quiz-counter">${s.idx + 1} / ${s.deck.length}</div>
        </div>
      </div>

      <div class="progress-bar" style="margin:var(--space-sm) 0 var(--space-md)">
        <div class="progress-fill" style="width:${pctDone}%"></div>
      </div>

      <div class="quiz-question-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-xs)">
          <span class="badge badge-gold">${tag}</span>
          <button class="quiz-bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="toggleQuizBookmark()">
            ${isBookmarked ? '★' : '☆'}
          </button>
        </div>

        <div class="quiz-question-text">${q.q}</div>

        <div class="quiz-options">
          ${q.opts.map((opt, i) => {
            let cls = '';
            if (s.locked) {
              // Use pre-stored correctAnswer (set before shuffle); fall back to q.a for custom questions
              const correct = q.correctAnswer || q.a;
              if (Utils.checkAnswer(opt, correct)) cls = 'correct';
              else if (opt === s.picked) cls = 'wrong';
              else cls = 'dimmed';
              cls += ' locked';
            }
            return `
              <button class="quiz-option ${cls}" onclick="handleQuizChoice('${Utils.escapeHtml(opt).replace(/'/g, "\\'")}')" ${s.locked ? 'disabled' : ''}>
                <span class="opt-letter">${letters[i] || i + 1}</span>
                <span>${opt}</span>
              </button>
            `;
          }).join('')}
        </div>

        ${s.locked ? `
          <div class="quiz-actions">
            <button class="btn btn-ghost btn-sm" onclick="quitQuiz()">छोड़ें</button>
            <button class="btn btn-primary" onclick="nextQuestion()">
              ${s.idx + 1 < s.deck.length ? 'अगला प्रश्न →' : 'परिणाम देखें →'}
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

async function handleQuizChoice(opt) {
  if (!_quizState || _quizState.locked) return;
  const s = _quizState;
  const q = s.deck[s.idx];
  
  s.picked = opt;
  s.locked = true;

  // Use the correctAnswer stored before shuffle — no async network call needed.
  // For custom questions that don't have correctAnswer set, fall back to getCorrectAnswer().
  let correctAnswer = q.correctAnswer;
  if (!correctAnswer) {
    correctAnswer = await Store.getCorrectAnswer(q.id);
    q.correctAnswer = correctAnswer; // cache it for the render
  }

  const isCorrect = Utils.checkAnswer(opt, correctAnswer);
  if (isCorrect) {
    s.correct++;
  } else {
    await Store.addWrongAnswer(q);
  }
  
  s.answers.push({
    q,
    picked: opt,
    correct: isCorrect
  });

  // Single render — correctAnswer is already set so colors show immediately
  await renderQuizPage({});
}

async function toggleQuizBookmark() {
  if (!_quizState) return;
  const q = _quizState.deck[_quizState.idx];
  const added = await Store.toggleBookmark(q.id);
  Components.showToast(added ? 'बुकमार्क जोड़ा ⭐' : 'बुकमार्क हटाया', added ? 'success' : 'info');
  await renderQuizPage({});
}

async function nextQuestion() {
  if (!_quizState) return;
  _quizState.idx++;
  _quizState.picked = null;
  _quizState.locked = false;
  
  if (_quizState.idx >= _quizState.deck.length) {
    await _finishQuiz();
  } else {
    await renderQuizPage({});
  }
}

async function _finishQuiz() {
  if (_quizTimer) { clearInterval(_quizTimer); _quizTimer = null; }
  if (!_quizState) return;
  
  const s = _quizState;
  const elapsed = Math.round((Date.now() - s.startTime) / 1000);
  
  // Save progress
  await Store.saveProgress(s.progressKey, {
    score: s.correct,
    total: s.deck.length,
    label: s.label,
    time: elapsed
  });
  
  await Store.updateStreak();
  
  Router.navigate('results');
}

function quitQuiz() {
  Components.showConfirm('परीक्षा छोड़ें?', 'आपकी प्रगति सहेजी जाएगी।', async () => {
    await _finishQuiz();
  });
}
