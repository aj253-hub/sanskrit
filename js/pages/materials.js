/* ============================================================
   संस्कृत सेतु — Study Materials / Notes Page
   ============================================================ */

function renderMaterialsPage() {
  const container = document.getElementById('app-content');
  
  // Show header/nav
  const header = document.getElementById('app-header');
  const nav = document.getElementById('bottom-nav');
  if (header) header.style.display = '';
  if (nav) nav.style.display = '';

  const materials = [
    { title: 'UGC NET Syllabus & PYQ PDF (2018-2023)', size: '12.4 MB', type: 'PDF', isPro: false },
    { title: 'UP TGT/PGT संस्कृत हस्तलिखित नोट्स', size: '25.8 MB', type: 'PDF', isPro: true },
    { title: 'CUET-PG आचार्य सम्पूर्ण पाठ्यक्रम', size: '5.2 MB', type: 'PDF', isPro: true },
    { title: 'UPMSSP उत्तर मध्यमा हल प्रश्न पत्र', size: '3.1 MB', type: 'PDF', isPro: true },
    { title: 'सामान्य ज्ञान - दर्शन शास्त्र सारांश', size: '8.4 MB', type: 'PDF', isPro: false },
  ];

  const user = Store.getUser();
  const hasPass = user?.isPro || false;

  container.innerHTML = `
    <div class="page-container page-enter">
      <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md)">
        <h2 style="font-size:var(--fs-2xl);color:var(--text-primary);font-family:var(--font-hindi);flex:1">अध्ययन सामग्री</h2>
        <button class="btn btn-ghost btn-sm">🔍 खोजें</button>
      </div>

      <div class="glass-card" style="padding:15px; border:1px solid #0088cc; background:rgba(0,136,204,0.1); margin-bottom:var(--space-xl); display:flex; flex-direction:column; align-items:center; text-align:center;">
        <div style="font-size:32px; margin-bottom:10px;">📱</div>
        <h3 style="color:#0088cc; font-size:18px; margin-bottom:8px;">सभी PDF और नोट्स Telegram पर उपलब्ध हैं!</h3>
        <p style="color:var(--text-secondary); font-size:14px; margin-bottom:15px;">
          कृपया हमारे आधिकारिक Telegram चैनल से जुड़ें जहाँ आपको सभी प्रीमियम और फ्री PDF नोट्स मिलेंगे।
        </p>
        <a href="https://t.me/+2VgqIi_cms0wZDQ1" target="_blank" class="btn btn-primary" style="background:#0088cc; border-color:#0088cc; color:white; font-weight:bold; width:100%;">
          Telegram चैनल से जुड़ें
        </a>
      </div>

      <div class="tabs-container" style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-xl);overflow-x:auto;padding-bottom:4px">
        <button class="badge badge-gold" style="font-size:var(--fs-sm);padding:6px 16px;white-space:nowrap">सभी</button>
        <button class="badge" style="background:var(--bg-elevated);color:var(--text-secondary);font-size:var(--fs-sm);padding:6px 16px;white-space:nowrap">UGC NET</button>
        <button class="badge" style="background:var(--bg-elevated);color:var(--text-secondary);font-size:var(--fs-sm);padding:6px 16px;white-space:nowrap">CUET (UG/PG)</button>
        <button class="badge" style="background:var(--bg-elevated);color:var(--text-secondary);font-size:var(--fs-sm);padding:6px 16px;white-space:nowrap">पारंपरिक बोर्ड</button>
        <button class="badge" style="background:var(--bg-elevated);color:var(--text-secondary);font-size:var(--fs-sm);padding:6px 16px;white-space:nowrap">TET/PSC</button>
      </div>
      
      <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-md);padding-bottom:var(--space-2xl)">
        ${materials.map(item => `
          <div class="glass-card material-card" style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md)">
            <div style="width:48px;height:48px;border-radius:var(--radius-sm);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--red-light)">
              📄
            </div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px">
                <h4 style="font-size:var(--fs-sm);margin-bottom:4px;line-height:1.3">${item.title}</h4>
                ${item.isPro ? `<span class="badge" style="background:var(--gold-glow);color:var(--gold);font-size:10px;padding:2px 6px">PRO</span>` : ''}
              </div>
              <div style="color:var(--text-secondary);font-size:var(--fs-xs)">
                ${item.type} · ${item.size}
              </div>
            </div>
            <button class="btn btn-ghost" style="width:40px;height:40px;padding:0;border-radius:50%;color:${item.isPro && !hasPass ? 'var(--text-muted)' : 'var(--gold)'}" 
                    onclick="handleDownloadMaterial(${item.isPro})">
              ${item.isPro && !hasPass ? '🔒' : '⬇️'}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function handleDownloadMaterial(isPro) {
  const user = Store.getUser();
  if (isPro && (!user || !user.isPro)) {
    Components.showConfirm('प्रो पास आवश्यक', 'यह सामग्री केवल संस्कृत सेतु पास सदस्यों के लिए उपलब्ध है। क्या आप पास खरीदना चाहते हैं?', () => {
      Router.navigate('pass');
    });
    return;
  }
  
  // Direct users to Telegram
  window.open('https://t.me/+2VgqIi_cms0wZDQ1', '_blank');
}
