/* ============================================================
   संस्कृत सेतु — Home Page
   ============================================================ */

async function renderHomePage() {
  const container = document.getElementById('app-content');
  const user = await Store.getUser();
  const profile = await Store.getProfile();
  const stats = await Store.getStats();
  const todayStats = await Store.getTodayStats();
  const streak = user.streak || 0;
  
  // Show header/sidebar
  const header = document.getElementById('app-header');
  const sidebar = document.getElementById('app-sidebar');
  if (header) header.style.display = '';
  if (sidebar) sidebar.style.display = 'flex';
  
  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'शुभ प्रभातम्';
  if (hour >= 12 && hour < 17) greeting = 'शुभ अपराह्णम्';
  else if (hour >= 17 && hour < 21) greeting = 'शुभ सन्ध्याम्';
  else if (hour >= 21) greeting = 'शुभ रात्रिम्';

  // Subhashitam of the Day
  const subhashitam = {
    sanskrit: "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः।<br>न हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः॥",
    hindi: "परिश्रम से ही कार्य सिद्ध होते हैं, केवल इच्छा करने से नहीं। जैसे सोये हुए शेर के मुँह में हिरण स्वयं प्रवेश नहीं करता।"
  };

  container.innerHTML = `
    <div class="page-container page-enter">
      
      <!-- Top Banner / User Greeting -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-xl)">
        <div>
          <div style="color:var(--text-secondary);font-size:var(--fs-sm)">${greeting},</div>
          <div style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);color:var(--text-primary);font-family:var(--font-hindi)">${Utils.escapeHtml(user.name)}</div>
        </div>
        <div class="clean-card" style="padding:12px 20px;display:flex;gap:12px;align-items:center;background:var(--saffron);color:white;cursor:pointer" onclick="Router.navigate('pass')">
          <span style="font-size:24px">🎟️</span>
          <div>
            <div style="font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px">संस्कृत सेतु पास</div>
            <div style="font-size:14px">${user.isPro ? 'सक्रिय' : 'प्राप्त करें'}</div>
          </div>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        
        <!-- Left Column: Main Content -->
        <div class="dashboard-main">
          
          <!-- Daily Subhashitam -->
          <div class="clean-card subhashitam-card" style="margin-bottom:var(--space-xl);background:linear-gradient(135deg, #FFf5eb 0%, #ffffff 100%);border-left:4px solid var(--saffron);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-md)">
              <span class="badge badge-saffron">सुभाषितम् (Quote of the Day)</span>
              <button class="btn btn-ghost btn-sm" onclick="Components.showToast('Audio playing...')">🔊 सुनें</button>
            </div>
            <div style="font-family:var(--font-hindi);font-size:var(--fs-xl);color:var(--text-primary);line-height:1.6;margin-bottom:var(--space-md);text-align:center;font-weight:var(--fw-semi)">
              ${subhashitam.sanskrit}
            </div>
            <div style="font-size:var(--fs-sm);color:var(--text-secondary);text-align:center;">
              <strong>अर्थ:</strong> ${subhashitam.hindi}
            </div>
          </div>

          <!-- Quick Actions Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-md);margin-bottom:var(--space-xl)">
            <div class="clean-card stat-card" onclick="Router.navigate('classes')" style="cursor:pointer">
              <div style="width:48px;height:48px;border-radius:var(--radius-md);background:rgba(0,119,182,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px;color:var(--blue)">📺</div>
              <div style="font-size:14px;font-weight:var(--fw-semi);color:var(--text-primary)">लाइव क्लास</div>
              <div style="font-size:12px;color:var(--text-muted)">Live Classes</div>
            </div>
            <div class="clean-card stat-card" onclick="Router.navigate('exams')" style="cursor:pointer">
              <div style="width:48px;height:48px;border-radius:var(--radius-md);background:rgba(255,153,51,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px;color:var(--saffron)">📝</div>
              <div style="font-size:14px;font-weight:var(--fw-semi);color:var(--text-primary)">टेस्ट सीरीज</div>
              <div style="font-size:12px;color:var(--text-muted)">Mock Tests</div>
            </div>
            <div class="clean-card stat-card" onclick="Router.navigate('materials')" style="cursor:pointer">
              <div style="width:48px;height:48px;border-radius:var(--radius-md);background:rgba(43,147,72,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px;color:var(--green)">📚</div>
              <div style="font-size:14px;font-weight:var(--fw-semi);color:var(--text-primary)">ई-ग्रंथालय</div>
              <div style="font-size:12px;color:var(--text-muted)">Study Materials</div>
            </div>
            <div class="clean-card stat-card" onclick="startQuickPractice()" style="cursor:pointer">
              <div style="width:48px;height:48px;border-radius:var(--radius-md);background:rgba(114,9,183,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px;color:var(--purple)">⚡</div>
              <div style="font-size:14px;font-weight:var(--fw-semi);color:var(--text-primary)">त्वरित क्विज़</div>
              <div style="font-size:12px;color:var(--text-muted)">Quick Practice</div>
            </div>
          </div>

          <!-- Featured Courses / Exams -->
          ${Components.sectionTitle('अनुशंसित परीक्षा (Recommended Exams)', '<a href="#exams" style="color:var(--blue);font-size:var(--fs-sm);font-weight:var(--fw-semi)">सभी देखें →</a>')}
          
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:var(--space-md);margin-bottom:var(--space-xl)">
            <div class="clean-card" style="display:flex;flex-direction:column;gap:12px" onclick="Router.navigate('exams')">
              <div style="display:flex;gap:12px;align-items:flex-start">
                <div style="width:56px;height:56px;background:rgba(255,153,51,0.1);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;color:var(--saffron);font-size:24px">🎓</div>
                <div style="flex:1">
                  <span class="badge badge-saffron" style="margin-bottom:4px">Trending</span>
                  <div style="font-weight:var(--fw-bold);font-size:var(--fs-md);color:var(--text-primary)">NTA UGC NET JRF संस्कृत</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Code 25 & 73</div>
                </div>
              </div>
              <div style="display:flex;gap:12px;margin-top:auto;padding-top:12px;border-top:1px solid var(--border-light)">
                <div style="font-size:12px;color:var(--text-secondary)"><strong>80+</strong> टेस्ट</div>
                <div style="font-size:12px;color:var(--text-secondary)"><strong>50k+</strong> छात्र</div>
                <div style="font-size:12px;color:var(--blue);margin-left:auto;font-weight:bold">Join Now</div>
              </div>
            </div>
            
            <div class="clean-card" style="display:flex;flex-direction:column;gap:12px" onclick="Router.navigate('exams')">
              <div style="display:flex;gap:12px;align-items:flex-start">
                <div style="width:56px;height:56px;background:rgba(0,119,182,0.1);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;color:var(--blue);font-size:24px">🏛️</div>
                <div style="flex:1">
                  <span class="badge badge-blue" style="margin-bottom:4px">University</span>
                  <div style="font-weight:var(--fw-bold);font-size:var(--fs-md);color:var(--text-primary)">CUET (UG & PG)</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Sanskrit Domain</div>
                </div>
              </div>
              <div style="display:flex;gap:12px;margin-top:auto;padding-top:12px;border-top:1px solid var(--border-light)">
                <div style="font-size:12px;color:var(--text-secondary)"><strong>150+</strong> पेपर्स</div>
                <div style="font-size:12px;color:var(--text-secondary)">विस्तृत हल</div>
                <div style="font-size:12px;color:var(--blue);margin-left:auto;font-weight:bold">Explore</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Sidebar Stats -->
        <div class="dashboard-sidebar">
          ${Components.sectionTitle('आपकी प्रगति (Progress)')}
          <div class="clean-card" style="margin-bottom:var(--space-lg)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
              <span style="font-weight:var(--fw-semi);font-size:var(--fs-sm);color:var(--text-primary)">आज का लक्ष्य (${profile.dailyGoal} प्रश्न)</span>
              <span class="font-mono" style="color:var(--saffron);font-weight:bold;font-size:var(--fs-sm)">${Math.round(Utils.pct(todayStats.questionsToday, profile.dailyGoal))}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${Math.min(100, Utils.pct(todayStats.questionsToday, profile.dailyGoal))}%;background:var(--saffron)"></div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-top:var(--space-lg)">
               <div style="text-align:center;padding:12px;background:var(--bg-deep);border-radius:var(--radius-md)">
                 <div style="font-size:var(--fs-xl);color:var(--text-primary);font-weight:bold;font-family:var(--font-mono)">${streak > 0 ? streak : 0} 🔥</div>
                 <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase">स्ट्रीक (दिन)</div>
               </div>
               <div style="text-align:center;padding:12px;background:var(--bg-deep);border-radius:var(--radius-md)">
                 <div style="font-size:var(--fs-xl);color:var(--text-primary);font-weight:bold;font-family:var(--font-mono)">${stats.avg}% 📈</div>
                 <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase">औसत स्कोर</div>
               </div>
               <div style="grid-column:1 / -1;text-align:center;padding:12px;background:var(--bg-deep);border-radius:var(--radius-md)">
                 <div style="font-size:var(--fs-xl);color:var(--text-primary);font-weight:bold;font-family:var(--font-mono)">${stats.questionsAttempted}</div>
                 <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase">कुल प्रश्न हल किए (Total Attempted)</div>
               </div>
            </div>
          </div>
          
          <div class="clean-card" style="background:linear-gradient(135deg, var(--maroon) 0%, var(--maroon-deep) 100%);color:white">
            <h4 style="color:white;margin-bottom:var(--space-xs)">संस्कृत व्याकरण टूल</h4>
            <p style="font-size:var(--fs-sm);opacity:0.9;margin-bottom:var(--space-md)">संधि, समास और शब्द रूप का अभ्यास करें।</p>
            <button class="btn btn-full" style="background:white;color:var(--maroon);font-weight:bold" onclick="Components.showToast('Vyakaran Tool Coming Soon!')">अभी आज़माएं</button>
          </div>
        </div>

      </div> <!-- End Dashboard Grid -->
    </div>
  `;
}

function startQuickPractice() {
  // Pick 10 random questions from all
  const deck = Utils.shuffle([...ALL_QUESTIONS]).slice(0, 10);
  _startQuiz(deck, 'त्वरित अभ्यास', 'quick');
}

async function startWrongAnswerPractice() {
  const wrongAnswers = await Store.getWrongAnswers();
  const wrongIds = wrongAnswers.map(w => w.id);
  if (wrongIds.length === 0) {
    Components.showToast('कोई गलत उत्तर नहीं मिला! 🎉', 'info');
    return;
  }
  const deck = wrongIds.map(id => QUESTION_MAP[id]).filter(Boolean).slice(0, 25);
  if (deck.length === 0) {
    Components.showToast('कोई प्रश्न उपलब्ध नहीं', 'info');
    return;
  }
  _startQuiz(Utils.shuffle(deck), 'गलत उत्तर — पुनः अभ्यास', 'wrong_review');
}
