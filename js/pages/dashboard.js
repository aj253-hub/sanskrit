/* ============================================================
   संस्कृत सेतु — Dashboard Page (तैयारी)
   ============================================================ */

async function renderDashboardPage() {
  const container = document.getElementById('app-content');
  const profile = await Store.getProfile();
  if (!profile) {
    Router.navigate('login');
    return;
  }
  const stats = await Store.getStats();
  const progress = await Store.getProgress();
  const todayStats = await Store.getTodayStats();
  const bookmarks = await Store.getBookmarks();
  
  // Category-wise accuracy
  const catAccuracy = {};
  Object.entries(progress).forEach(([key, p]) => {
    const allScores = p.scores || [];
    if (allScores.length > 0) {
      const total = allScores.reduce((s, sc) => s + sc.total, 0);
      const correct = allScores.reduce((s, sc) => s + sc.score, 0);
      catAccuracy[p.label || key] = { pct: Utils.pct(correct, total), total, correct };
    }
  });

  // Recent activity (sorted by last)
  const recentEntries = Object.entries(progress)
    .sort((a, b) => (b[1].last || 0) - (a[1].last || 0))
    .slice(0, 8);

  container.innerHTML = `
    <div class="page-container page-enter">
      <!-- Overview Card -->
      <div class="glass-card no-hover" style="margin-bottom:var(--space-lg)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:var(--fs-xs);color:var(--gold);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:0.5px">आपकी तैयारी की राह</div>
            <div style="font-family:var(--font-hindi);font-size:var(--fs-lg);margin-top:var(--space-xs)">लक्ष्य: ${profile.goal}</div>
          </div>
          <div class="streak-flame" style="font-size:var(--fs-lg)">
            <span class="flame-icon">🔥</span>${profile.streak || 0}
          </div>
        </div>
        
        <div class="dash-overview" style="margin-top:var(--space-md)">
          ${Components.statCard(stats.avg + '%', 'औसत स्कोर', '📊')}
          ${Components.statCard(stats.modulesStarted, 'मॉड्यूल', '📚')}
          ${Components.statCard(stats.totalAttempts, 'कुल प्रयास', '✍️')}
          ${Components.statCard(todayStats.questionsToday, 'आज', '📅')}
        </div>
      </div>

      <!-- Score Trend Chart -->
      ${stats.recentScores.length >= 2 ? `
        <div class="dash-chart-card">
          <div class="chart-header">
            <div class="chart-title">📈 स्कोर प्रवृत्ति</div>
            <span class="badge badge-gold">पिछले ${stats.recentScores.length} प्रयास</span>
          </div>
          <canvas id="score-trend-chart" style="width:100%;height:180px"></canvas>
        </div>
      ` : ''}

      <!-- Category Accuracy -->
      ${Object.keys(catAccuracy).length > 0 ? `
        <div class="dash-chart-card">
          <div class="chart-header">
            <div class="chart-title">🎯 विषय-वार सटीकता</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
            ${Object.entries(catAccuracy).map(([label, data]) => {
              const color = data.pct >= 80 ? 'var(--green)' : data.pct >= 50 ? 'var(--gold)' : 'var(--red)';
              return `
                <div class="analytics-bar">
                  <div class="bar-label" style="min-width:100px;font-size:11px">${label}</div>
                  <div class="bar-track">
                    <div class="bar-fill" style="width:${data.pct}%;background:${color}">
                      <span class="bar-value">${data.pct}%</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      ${Components.sectionTitle('हाल की गतिविधि')}
      
      <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-sm)">
        ${recentEntries.length === 0 ? 
          Components.emptyState('📝', 'अभी कोई गतिविधि नहीं। अभ्यास शुरू करें!', 
            '<button class="btn btn-primary" onclick="Router.navigate(\'exams\')">अभ्यास शुरू करें</button>') :
          recentEntries.map(([key, val]) => `
            <div class="glass-card" style="padding:var(--space-md);display:flex;align-items:center;gap:var(--space-md)">
              <div style="flex:1">
                <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">${val.label || key}</div>
                <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:2px">
                  ${val.attempted} प्रयास · ${Utils.timeAgo(val.last)}
                </div>
              </div>
              ${Utils.progressRing(val.best, 44, 4)}
            </div>
          `).join('')
        }
      </div>

      <!-- Bookmark shortcut -->
      <button class="glass-card" style="width:100%;text-align:left;margin-top:var(--space-lg);cursor:pointer" onclick="Router.navigate('bookmarks')">
        <div style="display:flex;align-items:center;gap:var(--space-md)">
          <span style="font-size:24px">⭐</span>
          <div style="flex:1">
            <div style="font-weight:var(--fw-semi)">बुकमार्क समीक्षा</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted)">${bookmarks.length} प्रश्न सहेजे गए</div>
          </div>
          <span style="color:var(--text-muted)">→</span>
        </div>
      </button>
    </div>
  `;

  // Draw charts after DOM is ready
  setTimeout(() => {
    const trendCanvas = document.getElementById('score-trend-chart');
    if (trendCanvas && stats.recentScores.length >= 2) {
      Utils.drawLineChart(trendCanvas, stats.recentScores.map((s, i) => ({
        label: `#${i + 1}`,
        value: s.pct
      })));
    }
  }, 100);
}
