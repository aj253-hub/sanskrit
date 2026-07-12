/* ============================================================
   संस्कृत सेतु — Main App Controller
   Initializes router, registers pages, handles app lifecycle
   ============================================================ */

const App = {
  init() {
    // Build the app shell
    const appEl = document.getElementById('app');
    appEl.innerHTML = `
      ${Components.renderHeader()}
      <main class="app-content" id="app-content"></main>
      ${Components.renderBottomNav()}
    `;

    // Initialize Data
    Data.init();

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

    // Initialize router
    Router.init('app-content');

    // Update streak on load
    if (Store.isLoggedIn()) {
      Store.updateStreak();
    }

    console.log('🕉️ संस्कृत सेतु initialized');
  }
};

// ── Boot ── //
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
