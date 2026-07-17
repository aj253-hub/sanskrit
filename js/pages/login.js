/* ============================================================
   संस्कृत सेतु — Login / Signup Page
   ============================================================ */

function renderLoginPage() {
  const container = document.getElementById('app-content');
  
  container.innerHTML = `
    <div class="login-page">
      <div class="login-container">
        <div class="login-brand">
          <img src="assets/images/logo.jpeg" class="brand-logo" alt="Logo">
          <h1>संस्कृत सेतु</h1>
          <p>आपकी संस्कृत परीक्षा तैयारी का विश्वसनीय मंच</p>
        </div>
        
        <div class="login-card">
          <div class="login-tabs">
            <button class="login-tab active" id="tab-login" onclick="switchLoginTab('login')">प्रवेश करें</button>
            <button class="login-tab" id="tab-signup" onclick="switchLoginTab('signup')">नया खाता</button>
          </div>
          
          <div id="login-form-area">
            ${_loginFormHTML()}
          </div>
        </div>
        
        <div style="text-align:center;margin-top:var(--space-lg);color:var(--text-muted);font-size:var(--fs-xs)">
          <p>CUET · Shastri · Acharya · UGC NET</p>
          <p style="margin-top:4px">संस्कृत परीक्षाओं की सम्पूर्ण तैयारी</p>
        </div>
      </div>
    </div>
  `;
  
  // Hide header and nav for login page
  const header = document.getElementById('app-header');
  const nav = document.getElementById('bottom-nav');
  const sidebar = document.getElementById('app-sidebar');
  if (header) header.style.display = 'none';
  if (nav) nav.style.display = 'none';
  if (sidebar) sidebar.style.display = 'none';
}

function _loginFormHTML() {
  return `
    <form class="login-form" onsubmit="handleLogin(event)">
      <div class="form-group">
        <label class="input-label">ईमेल</label>
        <input type="email" class="input-field" id="login-email" placeholder="aapka@email.com" required autocomplete="email">
      </div>
      <div class="form-group">
        <label class="input-label">पासवर्ड</label>
        <input type="password" class="input-field" id="login-password" placeholder="••••••••" required minlength="4" autocomplete="current-password">
      </div>
      <div id="login-error" style="color:var(--red-light);font-size:var(--fs-sm);display:none"></div>
      <button type="submit" class="btn btn-primary btn-full btn-lg" id="login-submit">
        प्रवेश करें →
      </button>
    </form>
    <div class="login-divider">या</div>
    <button class="btn btn-ghost btn-full" onclick="handleGuestLogin()">
      अतिथि के रूप में देखें
    </button>
  `;
}

function _signupFormHTML() {
  return `
    <form class="login-form" onsubmit="handleSignup(event)">
      <div class="form-group">
        <label class="input-label">पूरा नाम</label>
        <input type="text" class="input-field" id="signup-name" placeholder="आपका नाम" required autocomplete="name">
      </div>
      <div class="form-group">
        <label class="input-label">ईमेल</label>
        <input type="email" class="input-field" id="signup-email" placeholder="aapka@email.com" required autocomplete="email">
      </div>
      <div class="form-group">
        <label class="input-label">पासवर्ड</label>
        <input type="password" class="input-field" id="signup-password" placeholder="कम से कम ४ अक्षर" required minlength="4" autocomplete="new-password">
      </div>
      <div class="form-group">
        <label class="input-label">लक्ष्य परीक्षा</label>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);margin-top:var(--space-xs)">
          <button type="button" class="chip chip-active" data-goal="CUET" onclick="selectGoal(this)">CUET</button>
          <button type="button" class="chip chip-inactive" data-goal="Shastri" onclick="selectGoal(this)">Shastri</button>
          <button type="button" class="chip chip-inactive" data-goal="Acharya" onclick="selectGoal(this)">Acharya</button>
          <button type="button" class="chip chip-inactive" data-goal="General" onclick="selectGoal(this)">सामान्य</button>
        </div>
      </div>
      <div id="signup-error" style="color:var(--red-light);font-size:var(--fs-sm);display:none"></div>
      <button type="submit" class="btn btn-primary btn-full btn-lg" id="signup-submit">
        खाता बनाएँ →
      </button>
    </form>
  `;
}

function switchLoginTab(tab) {
  document.getElementById('tab-login').className = `login-tab ${tab === 'login' ? 'active' : ''}`;
  document.getElementById('tab-signup').className = `login-tab ${tab === 'signup' ? 'active' : ''}`;
  
  const area = document.getElementById('login-form-area');
  area.style.opacity = '0';
  setTimeout(() => {
    area.innerHTML = tab === 'login' ? _loginFormHTML() : _signupFormHTML();
    area.style.transition = 'opacity 0.2s ease';
    area.style.opacity = '1';
  }, 150);
}

let _selectedGoal = 'CUET';

function selectGoal(btn) {
  document.querySelectorAll('[data-goal]').forEach(el => {
    el.className = 'chip chip-inactive';
  });
  btn.className = 'chip chip-active';
  _selectedGoal = btn.dataset.goal;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  
  const result = await Store.loginUser(email, password);
  if (result.ok) {
    _refreshAppShell();
    if (result.user.isAdmin) {
      Components.showToast('स्वागतम् Admin! 🙏', 'success');
    } else {
      Components.showToast('स्वागतम्! 🙏', 'success');
    }
    Router.navigate('home');
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;
  const errorEl = document.getElementById('signup-error');
  
  try {
    const result = await Store.registerUser(name, email, password);
    if (result.ok) {
      const user = await Store.getUser();
      if (!user) {
         Components.showToast('खाता बन गया है! कृपया अपना ईमेल वेरीफाई करें।', 'info');
         switchLoginTab('login');
         return;
      }
      await Store.updateProfile({ goal: _selectedGoal });
      _refreshAppShell();
      Components.showToast('खाता सफलतापूर्वक बना! 🎉', 'success');
      Router.navigate('home');
    } else {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
    }
  } catch (err) {
    errorEl.textContent = err.message || 'Signup failed';
    errorEl.style.display = 'block';
  }
}

async function handleGuestLogin() {
  const errorEl = document.getElementById('login-error');
  try {
    const guestEmail = 'guest_demo@sanskrit.app';
    const guestPass = 'guest1234';
    
    // Try to login first to avoid hitting rate limits
    let result = await Store.loginUser(guestEmail, guestPass);
    
    // If login fails (account doesn't exist), try to register
    if (!result.ok) {
      result = await Store.registerUser('अतिथि (Guest)', guestEmail, guestPass);
    }
    
    if (result.ok) {
      const user = await Store.getUser();
      if (!user) {
         if (errorEl) {
           errorEl.textContent = 'ईमेल पुष्टिकरण आवश्यक है। अतिथि लॉगिन समर्थित नहीं है।';
           errorEl.style.display = 'block';
         }
         return;
      }
      _refreshAppShell();
      Components.showToast('अतिथि देवो भव 🙏', 'success');
      Router.navigate('home');
    } else {
      if (errorEl) {
        errorEl.textContent = result.error || 'अतिथि लॉगिन विफल';
        errorEl.style.display = 'block';
      }
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }
}

// Re-render header & nav after login/signup so user info is correct
function _refreshAppShell() {
  const headerEl = document.getElementById('app-header');
  const navEl = document.getElementById('bottom-nav');
  if (headerEl) headerEl.outerHTML = Components.renderHeader();
  if (navEl) navEl.outerHTML = Components.renderBottomNav();
}
