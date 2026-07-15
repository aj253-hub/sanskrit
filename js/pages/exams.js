/* ============================================================
   संस्कृत सेतु — Exams Page (Categorized Taxonomy)
   ============================================================ */

async function renderExamsPage() {
  const container = document.getElementById('app-content');
  const user = await Store.getUser();
  const hasPass = user?.isPro || false;

  const header = document.getElementById('app-header');
  const nav = document.getElementById('bottom-nav');
  if (header) header.style.display = '';
  if (nav) nav.style.display = '';

  const categories = [
    {
      id: 'cat-cuet',
      title: 'विश्वविद्यालय प्रवेश परीक्षाएँ (CUET & Others)',
      icon: '🎓',
      subcategories: [
        {
          title: 'CUET (UG)',
          exams: [
            { title: 'Shastri (B.A.) / Shastri Pratishtha', tests: 45, isPro: false, isDemo: true },
            { title: 'Prak-Shastri', tests: 20, isPro: true },
            { title: 'B.Sc. (Yogic Science)', tests: 15, isPro: true }
          ]
        },
        {
          title: 'CUET (PG)',
          exams: [
            { title: 'Shiksha Shastri (B.Ed.) & Shiksha Acharya (M.Ed.)', tests: 50, isPro: false, isDemo: true },
            { title: 'Acharya in Sahitya, Darshan, Dharmashastra, Prakrit', tests: 40, isPro: true },
            { title: 'Acharya in Veda-Paurohitya, Vyakarana, Puranetihasa, Jyotish', tests: 40, isPro: true },
            { title: 'M.A. (Pali, Hindu Studies, Sanskrit, Natyashastra)', tests: 30, isPro: true }
          ]
        },
        {
          title: 'CPET & NCET',
          exams: [
            { title: 'CPET (Common Prak-Shastri Entrance)', tests: 15, isPro: false, isDemo: true },
            { title: 'NCET (ITEP B.A.-B.Ed)', tests: 25, isPro: true }
          ]
        }
      ]
    },
    {
      id: 'cat-traditional',
      title: 'पारंपरिक बोर्ड परीक्षाएँ (Gurukul/Pathshala)',
      icon: '🏛️',
      subcategories: [
        {
          title: 'UPMSSP & State Boards',
          exams: [
            { title: 'Prathama', tests: 20, isPro: false, isDemo: true },
            { title: 'Purva-Madhyama', tests: 25, isPro: true },
            { title: 'Uttar-Madhyama', tests: 30, isPro: true },
            { title: 'Shastri / Acharya (Board Level)', tests: 40, isPro: true }
          ]
        },
        {
          title: 'Muktaswadhyaypeetham',
          exams: [
            { title: 'Prak-Shastri / Shastri Bridge Courses', tests: 15, isPro: false, isDemo: true },
            { title: 'Acharya-Bridge', tests: 10, isPro: true }
          ]
        }
      ]
    },
    {
      id: 'cat-gov',
      title: 'सरकारी एवं शिक्षक भर्ती परीक्षाएँ',
      icon: '📜',
      subcategories: [
        {
          title: 'National Level',
          exams: [
            { title: 'UGC NET Sanskrit (Paper 25 / 73)', tests: 80, isPro: false, isDemo: true }
          ]
        },
        {
          title: 'State Level (TET / PSC)',
          exams: [
            { title: 'UP TGT / PGT Sanskrit', tests: 50, isPro: false, isDemo: true },
            { title: 'RPSC 1st & 2nd Grade Sanskrit', tests: 60, isPro: true },
            { title: 'Bihar STET Sanskrit', tests: 40, isPro: true },
            { title: 'DSSSB TGT Sanskrit', tests: 45, isPro: true }
          ]
        }
      ]
    }
  ];

  window.toggleAccordion = function(id) {
    const el = document.getElementById(id);
    const content = el.querySelector('.accordion-content');
    if (el.classList.contains('active')) {
      el.classList.remove('active');
      content.style.maxHeight = '0';
    } else {
      document.querySelectorAll('.accordion.active').forEach(a => {
        if(a.id !== id) {
          a.classList.remove('active');
          a.querySelector('.accordion-content').style.maxHeight = '0';
        }
      });
      el.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  };

  const renderCategory = (cat) => `
    <div class="accordion" id="${cat.id}">
      <div class="accordion-header" onclick="toggleAccordion('${cat.id}')">
        <div class="accordion-title">
          <span style="font-size:24px">${cat.icon}</span>
          ${cat.title}
        </div>
        <div class="accordion-icon">▼</div>
      </div>
      <div class="accordion-content">
        <div class="accordion-content-inner">
          ${cat.subcategories.map(sub => `
            <div style="margin-bottom:var(--space-sm)">
              <div style="font-size:var(--fs-xs);color:var(--gold);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;padding-left:8px;border-left:2px solid var(--gold)">
                ${sub.title}
              </div>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${sub.exams.map(exam => `
                  <div class="glass-card" style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);border-left:${exam.isDemo && !hasPass ? '3px solid var(--green-light)' : 'none'}">
                    <div>
                      <div style="font-size:var(--fs-sm);font-weight:var(--fw-semi);color:var(--text-primary);margin-bottom:4px">
                        ${exam.title}
                        ${exam.isDemo && !hasPass ? '<span style="color:var(--green-light);font-size:10px;margin-left:8px;padding:2px 6px;border-radius:4px;border:1px solid var(--green-light)">Free Demo</span>' : ''}
                      </div>
                      <div style="font-size:11px;color:var(--text-muted)">📝 ${exam.tests} मॉक टेस्ट उपलब्ध</div>
                    </div>
                    <button class="btn ${exam.isPro && !hasPass ? 'btn-outline' : 'btn-primary'}" style="padding:6px 16px;font-size:11px;${exam.isPro && !hasPass ? 'border-color:var(--gold);color:var(--gold)' : ''}" onclick="startMockTest(${exam.isPro})">
                      ${exam.isPro && !hasPass ? '🔒 अनलॉक' : 'Explore'}
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="page-container page-enter" style="padding-top:16px;padding-bottom:100px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md)">
        <h2 style="font-size:var(--fs-2xl);color:var(--text-primary);font-family:var(--font-hindi)">टेस्ट सीरीज़</h2>
        <button class="btn btn-ghost btn-sm" onclick="Router.navigate('pass')">
          ${hasPass ? '✨ PRO सक्रिय' : '🎟️ पास खरीदें'}
        </button>
      </div>
      
      <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-lg)">
        अपनी परीक्षा चुनें। हम CUET, पारंपरिक बोर्डों और शिक्षक भर्ती से लेकर UGC NET तक सभी परीक्षाओं को कवर करते हैं।
      </p>

      <div style="display:flex;flex-direction:column;gap:var(--space-sm);margin-bottom:var(--space-2xl)">
        ${categories.map(renderCategory).join('')}
      </div>

      ${Components.sectionTitle('विषय-वार अभ्यास')}
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);margin-bottom:var(--space-xl)">
        <div class="glass-card" style="padding:var(--space-sm);text-align:center;cursor:pointer" onclick="Router.navigate('practice-cuet')">
          <div style="font-size:32px;margin-bottom:8px">📚</div>
          <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">CUET अध्याय</div>
        </div>
        <div class="glass-card" style="padding:var(--space-sm);text-align:center;cursor:pointer" onclick="Router.navigate('practice-nta')">
          <div style="font-size:32px;margin-bottom:8px">🎯</div>
          <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">NTA NET (CBT)</div>
        </div>
        <div class="glass-card" style="padding:var(--space-sm);text-align:center;cursor:pointer" onclick="Router.navigate('practice-gk')">
          <div style="font-size:32px;margin-bottom:8px">🧠</div>
          <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">साहित्य/दर्शन</div>
        </div>
        <div class="glass-card" style="padding:var(--space-sm);text-align:center;cursor:pointer" onclick="startQuickPractice()">
          <div style="font-size:32px;margin-bottom:8px">⚡</div>
          <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">क्विक क्विज़</div>
        </div>
        <div class="glass-card" style="padding:var(--space-sm);text-align:center;cursor:pointer" onclick="startWrongAnswerPractice()">
          <div style="font-size:32px;margin-bottom:8px">🔄</div>
          <div style="font-weight:var(--fw-semi);font-size:var(--fs-sm)">गलत उत्तर</div>
        </div>
      </div>
    </div>
  `;
}

async function startMockTest(isPro = false) {
  const user = await Store.getUser();
  if (isPro && (!user || !user.isPro)) {
    Components.showConfirm('प्रो पास आवश्यक', 'यह टेस्ट केवल संस्कृत सेतु पास सदस्यों के लिए उपलब्ध है। क्या आप पास खरीदना चाहते हैं?', () => {
      Router.navigate('pass');
    });
    return;
  }
  
  const deck = Utils.shuffle([...ALL_QUESTIONS]).slice(0, 50);
  _startQuiz(deck, 'मॉक परीक्षा (50 प्रश्न)', 'mock', true, 3600);
}
