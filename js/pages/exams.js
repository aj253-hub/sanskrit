/* ============================================================
   संस्कृत सेतु — Exams Page (Categorized Taxonomy)
   HONESTY RULE: never show a test count that isn't backed by real data.
   If a pool is empty, mark comingSoon:true and disable the button.
   ============================================================ */

async function renderExamsPage() {
  const container = document.getElementById('app-content');
  const user = await Store.getUser();
  const hasPass = user?.isPro || false;

  const header = document.getElementById('app-header');
  const nav = document.getElementById('bottom-nav');
  if (header) header.style.display = '';
  if (nav) nav.style.display = '';

  // ── Real question counts (computed from actual data) ── //
  const cuetCount  = typeof QUESTIONS_CUET !== 'undefined' ? QUESTIONS_CUET.length : 0;
  const ntaCount   = typeof QUESTIONS_NTA  !== 'undefined' ? QUESTIONS_NTA.length  : 0;
  const gkCount    = typeof QUESTIONS_GK   !== 'undefined' ? QUESTIONS_GK.length   : 0;

  // ── Helper: derive "test count" label from real questions ── //
  // A test is defined as 25 questions. We cap display at actual capacity.
  const realTests = (count) => Math.floor(count / 25);

  // ── Category definitions ── //
  // Fields:
  //   pool        – which question bank to draw from (used by startMockTest)
  //   comingSoon  – true if NO dedicated content exists yet; disables button
  //   isPro       – requires pass
  //   isDemo      – free demo available
  //   realCount   – actual question count (shown instead of tests for small banks)
  //
  // Rule: if comingSoon is true, tests/realCount are NOT shown to the user.
  const categories = [
    {
      id: 'cat-cuet',
      title: 'विश्वविद्यालय प्रवेश परीक्षाएँ (CUET & Others)',
      icon: '🎓',
      subcategories: [
        {
          title: 'CUET (UG)',
          exams: [
            {
              title: 'Shastri (B.A.) / Shastri Pratishtha',
              pool: 'cuet',
              realCount: cuetCount,
              isPro: false,
              isDemo: true
            },
            {
              title: 'Prak-Shastri',
              pool: 'cuet',
              realCount: cuetCount,
              isPro: true,
              isDemo: false
            },
            {
              title: 'B.Sc. (Yogic Science)',
              comingSoon: true,
              isPro: true
            }
          ]
        },
        {
          title: 'CUET (PG)',
          exams: [
            {
              title: 'Shiksha Shastri (B.Ed.) & Shiksha Acharya (M.Ed.)',
              pool: 'cuet',
              realCount: cuetCount,
              isPro: false,
              isDemo: true
            },
            {
              title: 'Acharya in Sahitya, Darshan, Dharmashastra, Prakrit',
              comingSoon: true,
              isPro: true
            },
            {
              title: 'Acharya in Veda-Paurohitya, Vyakarana, Puranetihasa, Jyotish',
              comingSoon: true,
              isPro: true
            },
            {
              title: 'M.A. (Pali, Hindu Studies, Sanskrit, Natyashastra)',
              comingSoon: true,
              isPro: true
            }
          ]
        },
        {
          title: 'CPET & NCET',
          exams: [
            {
              title: 'CPET (Common Prak-Shastri Entrance)',
              pool: 'cuet',
              realCount: cuetCount,
              isPro: false,
              isDemo: true
            },
            {
              title: 'NCET (ITEP B.A.-B.Ed)',
              comingSoon: true,
              isPro: true
            }
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
            {
              title: 'Prathama',
              pool: 'gk',
              realCount: gkCount,
              isPro: false,
              isDemo: true
            },
            {
              title: 'Purva-Madhyama',
              comingSoon: true,
              isPro: true
            },
            {
              title: 'Uttar-Madhyama',
              comingSoon: true,
              isPro: true
            },
            {
              title: 'Shastri / Acharya (Board Level)',
              comingSoon: true,
              isPro: true
            }
          ]
        },
        {
          title: 'Muktaswadhyaypeetham',
          exams: [
            {
              title: 'Prak-Shastri / Shastri Bridge Courses',
              pool: 'gk',
              realCount: gkCount,
              isPro: false,
              isDemo: true
            },
            {
              title: 'Acharya-Bridge',
              comingSoon: true,
              isPro: true
            }
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
            {
              title: 'UGC NET Sanskrit (Paper 25 / 73)',
              pool: 'nta',
              realCount: ntaCount,
              isPro: false,
              isDemo: true
            }
          ]
        },
        {
          title: 'State Level (TET / PSC)',
          exams: [
            // No dedicated question banks exist for any of these yet.
            // Mark all comingSoon=true so users are never shown fake content.
            {
              title: 'UP TGT / PGT Sanskrit',
              comingSoon: true,
              isPro: false
            },
            {
              title: 'RPSC 1st & 2nd Grade Sanskrit',
              comingSoon: true,
              isPro: true
            },
            {
              title: 'Bihar STET Sanskrit',
              comingSoon: true,
              isPro: true
            },
            {
              title: 'DSSSB TGT Sanskrit',
              comingSoon: true,
              isPro: true
            }
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

  // ── Render helpers ── //
  const comingSoonBadge = `<span style="color:var(--text-muted);font-size:10px;margin-left:8px;padding:2px 6px;border-radius:4px;border:1px solid var(--glass-border)">जल्द आ रहा है</span>`;
  const freeBadge       = `<span style="color:var(--green-light);font-size:10px;margin-left:8px;padding:2px 6px;border-radius:4px;border:1px solid var(--green-light)">Free Demo</span>`;

  const examCountLabel = (exam) => {
    if (exam.comingSoon) return '';
    const count = exam.realCount || 0;
    if (count === 0) return '<span style="font-size:11px;color:var(--text-muted)">प्रश्न लोड हो रहे हैं...</span>';
    return `<span style="font-size:11px;color:var(--text-muted)">📝 ${count} प्रश्न उपलब्ध</span>`;
  };

  const examButton = (exam, hasPass) => {
    if (exam.comingSoon) {
      return `<button class="btn btn-ghost" style="padding:6px 16px;font-size:11px;opacity:0.5;cursor:not-allowed" disabled>जल्द आ रहा है</button>`;
    }
    if (exam.isPro && !hasPass) {
      return `<button class="btn btn-outline" style="padding:6px 16px;font-size:11px;border-color:var(--gold);color:var(--gold)" onclick="startMockTest('${exam.pool}', true)">🔒 अनलॉक</button>`;
    }
    return `<button class="btn btn-primary" style="padding:6px 16px;font-size:11px" onclick="startMockTest('${exam.pool}', false)">Explore</button>`;
  };

  const renderExamRow = (exam, hasPass) => `
    <div class="glass-card" style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);${exam.isDemo && !exam.comingSoon && !hasPass ? 'border-left:3px solid var(--green-light)' : 'border-left:none'}">
      <div>
        <div style="font-size:var(--fs-sm);font-weight:var(--fw-semi);color:${exam.comingSoon ? 'var(--text-muted)' : 'var(--text-primary)'};margin-bottom:4px">
          ${exam.title}
          ${exam.comingSoon ? comingSoonBadge : (exam.isDemo && !hasPass ? freeBadge : '')}
        </div>
        ${examCountLabel(exam)}
      </div>
      ${examButton(exam, hasPass)}
    </div>
  `;

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
                ${sub.exams.map(exam => renderExamRow(exam, hasPass)).join('')}
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
        अपनी परीक्षा चुनें। हम CUET और UGC NET के लिए वास्तविक प्रश्न बैंक प्रदान करते हैं। अन्य परीक्षाएँ शीघ्र जोड़ी जाएँगी।
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

// ── Start Mock Test — routes to the correct pool ── //
async function startMockTest(pool = 'cuet', isPro = false) {
  const user = await Store.getUser();
  if (isPro && (!user || !user.isPro)) {
    Components.showConfirm('प्रो पास आवश्यक', 'यह टेस्ट केवल संस्कृत सेतु पास सदस्यों के लिए उपलब्ध है। क्या आप पास खरीदना चाहते हैं?', () => {
      Router.navigate('pass');
    });
    return;
  }

  // Route to the correct question bank — never mix pools
  let sourcePool;
  let label;
  let progressKey;

  if (pool === 'nta') {
    sourcePool = typeof QUESTIONS_NTA !== 'undefined' ? QUESTIONS_NTA : [];
    label = 'UGC NET Sanskrit — मॉक परीक्षा';
    progressKey = 'mock_nta';
  } else if (pool === 'gk') {
    sourcePool = typeof QUESTIONS_GK !== 'undefined' ? QUESTIONS_GK : [];
    label = 'Sanskrit GK — मॉक परीक्षा';
    progressKey = 'mock_gk';
  } else {
    // Default: cuet
    sourcePool = typeof QUESTIONS_CUET !== 'undefined' ? QUESTIONS_CUET : [];
    label = 'CUET Sanskrit — मॉक परीक्षा';
    progressKey = 'mock_cuet';
  }

  if (!sourcePool || sourcePool.length === 0) {
    Components.showToast('इस परीक्षा के प्रश्न अभी उपलब्ध नहीं हैं।', 'info');
    return;
  }

  const maxQuestions = Math.min(50, sourcePool.length);
  const deck = Utils.shuffle([...sourcePool]).slice(0, maxQuestions);
  _startQuiz(deck, `${label} (${maxQuestions} प्रश्न)`, progressKey, true, 3600);
}
