/* ============================================================
   संस्कृत सेतु — Results Page
   ============================================================ */

async function renderResultsPage() {
  const container = document.getElementById('app-content');
  
  if (!_quizState) {
    Router.navigate('home');
    return;
  }
  
  const s = _quizState;
  const total = s.deck.length;
  const pct = Utils.pct(s.correct, total);
  const elapsed = Math.round((Date.now() - s.startTime) / 1000);
  const wrong = total - s.correct;
  
  let verdict, verdictIcon;
  if (pct >= 90) { verdict = 'अत्युत्तमम्!'; verdictIcon = '🏆'; }
  else if (pct >= 80) { verdict = 'उत्तमः!'; verdictIcon = '🎉'; }
  else if (pct >= 60) { verdict = 'साधु प्रयत्नः!'; verdictIcon = '👍'; }
  else if (pct >= 40) { verdict = 'ठीक है, और प्रयास करें'; verdictIcon = '💪'; }
  else { verdict = 'पुनः अभ्यासः आवश्यकः'; verdictIcon = '📖'; }

  const bookmarks = await Store.getBookmarks();

  container.innerHTML = `
    <div class="page-container page-enter">
      <!-- Result Hero -->
      <div class="result-hero">
        <div style="font-size:48px;margin-bottom:var(--space-sm)">${verdictIcon}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">${s.label}</div>
        <div class="result-score">${s.correct}/${total}</div>
        <div class="result-verdict">${verdict}</div>
        ${Utils.progressRing(pct, 80, 5)}
      </div>

      <!-- Stats -->
      <div class="result-stats stagger-children">
        ${Components.statCard(pct + '%', 'सटीकता', '🎯')}
        ${Components.statCard(s.correct, 'सही', '✅')}
        ${Components.statCard(wrong, 'गलत', '❌')}
        ${elapsed > 0 ? Components.statCard(Utils.formatTime(elapsed), 'समय', '⏱️') : ''}
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:var(--space-sm);margin:var(--space-xl) 0;flex-wrap:wrap">
        <button class="btn btn-primary" style="flex:1" onclick="retryQuiz()">पुनः अभ्यास</button>
        <button class="btn btn-secondary" style="flex:1" onclick="Router.navigate('dashboard')">तैयारी पर वापस</button>
      </div>

      ${Components.sectionTitle('उत्तर-समीक्षा', `<span class="badge badge-gold">${s.correct} सही / ${wrong} गलत</span>`)}
      
      <div class="result-review-list stagger-children">
        ${s.answers.map((a, i) => {
          const isBookmarked = bookmarks.includes(a.q.id);
          return `
            <div class="review-item ${a.correct ? 'review-correct' : 'review-wrong'}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-sm)">
                <div style="flex:1">
                  <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:4px">प्रश्न ${i + 1}</div>
                  <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm);color:var(--text-primary)">${a.q.q}</div>
                </div>
                <button class="quiz-bookmark-btn ${isBookmarked ? 'active' : ''}" 
                  onclick="toggleResultBookmark('${a.q.id}')" style="font-size:18px">
                  ${isBookmarked ? '★' : '☆'}
                </button>
              </div>
              <div style="margin-top:var(--space-sm);font-size:var(--fs-sm)">
                <div style="color:${a.correct ? 'var(--green-light)' : 'var(--red-light)'}">
                  आपका उत्तर: ${a.picked}
                </div>
                ${!a.correct ? `<div style="color:var(--green-light);margin-top:2px">सही उत्तर: ${a.q.a}</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

async function toggleResultBookmark(qid) {
  const added = await Store.toggleBookmark(qid);
  Components.showToast(added ? 'बुकमार्क जोड़ा ⭐' : 'बुकमार्क हटाया', added ? 'success' : 'info');
  await renderResultsPage();
}

function retryQuiz() {
  if (!_quizState) { Router.navigate('exams'); return; }
  const s = _quizState;
  // Re-start with same deck (reshuffled)
  _startQuiz(
    Utils.shuffle(s.deck.map(q => QUESTION_MAP[q.id]).filter(Boolean)),
    s.label,
    s.progressKey,
    s.timed,
    s.totalSeconds
  );
}
