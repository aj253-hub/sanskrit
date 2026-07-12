/* ============================================================
   संस्कृत सेतु — Bookmarks Page
   ============================================================ */

function renderBookmarksPage() {
  const container = document.getElementById('app-content');
  const bookmarks = Store.getBookmarks();
  const items = bookmarks.map(id => QUESTION_MAP[id]).filter(Boolean);

  // Group by category
  const grouped = {};
  items.forEach(q => {
    const cat = q.bank === 'gk' ? (GK_CAT_LABELS[q.cat] || 'सामान्य') : (CUET_UNITS.find(u => u.id === q.unit)?.label || 'CUET');
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(q);
  });

  container.innerHTML = `
    <div class="page-container page-enter">
      ${Components.pageHeader('⭐ बुकमार्क')}
      
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg)">
        <p style="color:var(--text-secondary);font-size:var(--fs-sm)">
          ${items.length} प्रश्न सहेजे गए
        </p>
        ${items.length > 0 ? `
          <button class="btn btn-primary btn-sm" onclick="practiceBookmarks()">अभ्यास करें</button>
        ` : ''}
      </div>

      ${items.length === 0 ? 
        Components.emptyState('⭐', 'कोई बुकमार्क नहीं। परीक्षा के दौरान ★ दबाकर प्रश्न सहेजें।',
          '<button class="btn btn-primary" onclick="Router.navigate(\'exams\')">अभ्यास शुरू करें</button>') :
        Object.entries(grouped).map(([cat, questions]) => `
          ${Components.sectionTitle(`${cat} (${questions.length})`)}
          <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-sm)">
            ${questions.map(q => `
              <div class="bookmark-item">
                <div class="bm-content">
                  <div class="bm-category">${q.bank === 'gk' ? GK_CAT_LABELS[q.cat] : CUET_UNITS.find(u => u.id === q.unit)?.label}</div>
                  <div class="bm-question">${q.q}</div>
                  <div class="bm-answer">उत्तर: ${q.a}</div>
                </div>
                <button class="btn btn-ghost btn-sm" style="color:var(--red-light);flex-shrink:0" 
                  onclick="removeBookmark('${q.id}')">हटाएँ</button>
              </div>
            `).join('')}
          </div>
        `).join('')
      }
    </div>
  `;
}

function removeBookmark(qid) {
  Store.toggleBookmark(qid);
  Components.showToast('बुकमार्क हटाया', 'info');
  renderBookmarksPage();
}

function practiceBookmarks() {
  const bookmarks = Store.getBookmarks();
  const deck = bookmarks.map(id => QUESTION_MAP[id]).filter(Boolean);
  if (deck.length === 0) {
    Components.showToast('कोई बुकमार्क नहीं', 'info');
    return;
  }
  _startQuiz(Utils.shuffle(deck), 'बुकमार्क अभ्यास', 'bookmarks');
}
