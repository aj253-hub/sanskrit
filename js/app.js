/* ============================================================
   संस्कृत सेतु — Main App Controller
   Initializes router, registers pages, handles app lifecycle
   ============================================================ */

const App = {
  async init() {
    // Build the app shell (Large Platform Layout)
    const appEl = document.getElementById('app');
    appEl.innerHTML = `
      ${await Components.renderSidebar()}
      <div class="app-main">
        ${await Components.renderHeader()}
        <main class="app-content" id="app-content"></main>
      </div>
    `;

    // Initialize Data
    await Data.init();

    // Register routes
    Router.register('login', () => renderLoginPage());
    Router.register('home', () => renderHomePage());
    Router.register('dashboard', () => renderDashboardPage());
    Router.register('exams', () => renderExamsPage());
    Router.register('practice-gk', () => renderPracticeGKPage());
    Router.register('practice-cuet', () => renderPracticeCUETPage());
    Router.register('quiz', (params) => renderQuizPage(params));
    Router.register('results', () => renderResultsPage());
    Router.register('profile', () => renderProfilePage());
    Router.register('analytics', () => renderAnalyticsPage());
    Router.register('notes', () => renderNotesPage());
    Router.register('bookmarks', () => renderBookmarksPage());
    Router.register('admin', () => renderAdminPage());
    Router.register('pass', () => renderPassPage());
    Router.register('practice-nta', () => renderPracticeNTAPage());
    Router.register('quiz-nta', (params) => renderNTAQuizPage(params));
    Router.register('materials', () => renderMaterialsPage());

    // Initialize router
    Router.init('app-content');

    // Update streak on load
    if (await Store.isLoggedIn()) {
      await Store.updateStreak();
    }

    // Initialize AI Assistant Chatbot
    if (typeof AI !== 'undefined') {
      AI.init();
    }

    // Register Service Worker for PWA Support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
    }

    console.log('🕉️ संस्कृत सेतु initialized');
  }
};

// ── Boot ── //
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
