/* ============================================================
   संस्कृत सेतु — Analytics Page (विस्तृत विश्लेषण)
   ============================================================ */

function renderAnalyticsPage() {
  const container = document.getElementById('app-content');
  const stats = Store.getStats();
  const progress = Store.getProgress();
  
  // Category accuracy data for bar chart
  const catData = [];
  const colors = ['#C9A227', '#7A2E2E', '#3B6BCA', '#2E7D5E', '#D4853A', '#7B5EA7', '#C94444', '#3DA876', '#5A8AE0'];
  
  // GK categories
  Object.keys(GK_CAT_LABELS).forEach((cat, i) => {
    const questions = QUESTIONS_GK.filter(q => q.cat === cat);
    const attempted = [];
    Object.values(progress).forEach(p => {
      (p.scores || []).forEach(s => {
        // Simple heuristic: track by progress keys
      });
    });
    if (questions.length > 0) {
      catData.push({
        label: GK_CAT_LABELS[cat].slice(0, 8),
        fullLabel: GK_CAT_LABELS[cat],
        value: 0,
        color: colors[i % colors.length],
        count: questions.length
      });
    }
  });

  // Progress-based accuracy
  const progressData = [];
  Object.entries(progress).forEach(([key, p]) => {
    const allScores = p.scores || [];
    if (allScores.length > 0) {
      const total = allScores.reduce((s, sc) => s + sc.total, 0);
      const correct = allScores.reduce((s, sc) => s + sc.score, 0);
      const avgTime = allScores.reduce((s, sc) => s + (sc.time || 0), 0) / allScores.length;
      progressData.push({
        key,
        label: p.label || key,
        pct: Utils.pct(correct, total),
        total,
        correct,
        attempts: p.attempted,
        avgTime: Math.round(avgTime),
        best: p.best,
        color: p.best >= 80 ? 'var(--green)' : p.best >= 50 ? 'var(--gold)' : 'var(--red)'
      });
    }
  });

  // Donut data
  const totalCorrect = stats.totalScore;
  const totalWrong = stats.totalQuestions - stats.totalScore;

  container.innerHTML = `
    <div class="page-container page-enter">
      ${Components.pageHeader('विस्तृत विश्लेषण')}

      <!-- Summary Cards -->
      <div class="dash-overview stagger-children">
        ${Components.statCard(stats.avg + '%', 'समग्र सटीकता', '🎯')}
        ${Components.statCard(stats.totalQuestions, 'कुल प्रश्न', '📝')}
        ${Components.statCard(stats.totalScore, 'सही उत्तर', '✅')}
        ${Components.statCard(stats.totalAttempts, 'कुल प्रयास', '📊')}
      </div>

      <!-- Score Trend -->
      ${stats.recentScores.length >= 2 ? `
        <div class="dash-chart-card">
          <div class="chart-header">
            <div class="chart-title">📈 स्कोर प्रवृत्ति</div>
            <span class="badge badge-gold">पिछले ${stats.recentScores.length} प्रयास</span>
          </div>
          <canvas id="analytics-trend-chart" style="width:100%;height:200px"></canvas>
        </div>
      ` : ''}

      <!-- Accuracy Donut -->
      ${stats.totalQuestions > 0 ? `
        <div class="dash-chart-card">
          <div class="chart-header">
            <div class="chart-title">🎯 सही/गलत अनुपात</div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-xl)">
            <canvas id="analytics-donut" style="width:150px;height:150px"></canvas>
            <div>
              <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-sm)">
                <span style="width:12px;height:12px;border-radius:3px;background:var(--green);display:inline-block"></span>
                <span style="font-size:var(--fs-sm)">सही: ${totalCorrect} (${Utils.pct(totalCorrect, stats.totalQuestions)}%)</span>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-sm)">
                <span style="width:12px;height:12px;border-radius:3px;background:var(--red);display:inline-block"></span>
                <span style="font-size:var(--fs-sm)">गलत: ${totalWrong} (${Utils.pct(totalWrong, stats.totalQuestions)}%)</span>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Module-wise Performance -->
      ${progressData.length > 0 ? `
        <div class="dash-chart-card">
          <div class="chart-header">
            <div class="chart-title">📚 मॉड्यूल-वार प्रदर्शन</div>
          </div>
          <canvas id="analytics-bar-chart" style="width:100%;height:${Math.max(180, progressData.length * 28)}px"></canvas>
        </div>

        ${Components.sectionTitle('विस्तृत विवरण')}
        <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-sm)">
          ${progressData.sort((a, b) => b.pct - a.pct).map(d => `
            <div class="glass-card no-hover" style="padding:var(--space-md)">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="flex:1">
                  <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">${d.label}</div>
                  <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:2px">
                    ${d.attempts} प्रयास · ${d.correct}/${d.total} सही
                    ${d.avgTime > 0 ? ` · ~${Utils.formatTime(d.avgTime)}` : ''}
                  </div>
                </div>
                ${Utils.progressRing(d.best, 44, 4)}
              </div>
              <div class="progress-bar" style="margin-top:var(--space-sm)">
                <div class="progress-fill" style="width:${d.pct}%;background:${d.color}"></div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : Components.emptyState('📊', 'अभी कोई डेटा नहीं। अभ्यास शुरू करें!',
          '<button class="btn btn-primary" onclick="Router.navigate(\'exams\')">अभ्यास शुरू करें</button>')}

      <!-- Weak Areas -->
      ${progressData.filter(d => d.pct < 60).length > 0 ? `
        ${Components.sectionTitle('⚠️ कमज़ोर क्षेत्र')}
        <div class="glass-card no-hover" style="border-color:rgba(201,68,68,0.3)">
          <p style="font-size:var(--fs-sm);color:var(--text-secondary);margin-bottom:var(--space-md)">
            इन विषयों में और अभ्यास की आवश्यकता है:
          </p>
          ${progressData.filter(d => d.pct < 60).map(d => `
            <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-sm)">
              <span style="color:var(--red)">●</span>
              <span style="font-size:var(--fs-sm)">${d.label} — ${d.pct}%</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  // Draw charts
  setTimeout(() => {
    // Trend chart
    const trendCanvas = document.getElementById('analytics-trend-chart');
    if (trendCanvas) {
      Utils.drawLineChart(trendCanvas, stats.recentScores.map((s, i) => ({
        label: `#${i + 1}`,
        value: s.pct
      })));
    }

    // Donut chart
    const donutCanvas = document.getElementById('analytics-donut');
    if (donutCanvas) {
      Utils.drawDonutChart(donutCanvas, [
        { value: totalCorrect, color: '#2E7D5E' },
        { value: totalWrong, color: '#C94444' }
      ], { centerText: stats.avg + '%' });
    }

    // Bar chart
    const barCanvas = document.getElementById('analytics-bar-chart');
    if (barCanvas && progressData.length > 0) {
      Utils.drawBarChart(barCanvas, progressData.map(d => ({
        label: d.label.slice(0, 6),
        value: d.pct,
        color: d.pct >= 80 ? '#2E7D5E' : d.pct >= 50 ? '#C9A227' : '#C94444'
      })));
    }
  }, 150);
}
