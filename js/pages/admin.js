/* ============================================================
   संस्कृत सेतु — Admin Panel
   Manage Questions, Passes, Courses, and View Users
   ============================================================ */

async function renderAdminPage() {
  const user = await Store.getUser();
  if (!user || !user.isAdmin) {
    Router.navigate('home');
    return;
  }

  const container = document.getElementById('app-content');
  
  // State for the admin panel
  let currentTab = 'questions'; // 'questions', 'passes', 'courses', 'users'
  
  // Questions State
  let currentBank = 'gk';
  
  async function renderLayout() {
    let html = `
      <div class="page-container">
        ${Components.pageHeader('प्रशासन कक्ष (Admin Panel)')}
        
        <div class="tabs-container" style="display:flex; gap:10px; margin-bottom:20px; overflow-x:auto; padding-bottom:10px;">
          <button class="btn ${currentTab === 'questions' ? 'btn-primary' : 'btn-outline'}" id="tab-nav-questions">Questions</button>
          <button class="btn ${currentTab === 'passes' ? 'btn-primary' : 'btn-outline'}" id="tab-nav-passes">Passes</button>
          <button class="btn ${currentTab === 'courses' ? 'btn-primary' : 'btn-outline'}" id="tab-nav-courses">Courses</button>
          <button class="btn ${currentTab === 'users' ? 'btn-primary' : 'btn-outline'}" id="tab-nav-users">Users</button>
          <button class="btn ${currentTab === 'payments' ? 'btn-primary' : 'btn-outline'}" id="tab-nav-payments">Payments</button>
          <button class="btn ${currentTab === 'ai' ? 'btn-primary' : 'btn-outline'}" id="tab-nav-ai">AI Settings</button>
        </div>
        
        <div id="admin-tab-content"></div>
      </div>
    `;
    container.innerHTML = html;
    
    document.getElementById('tab-nav-questions').onclick = async () => { currentTab = 'questions'; await renderLayout(); };
    document.getElementById('tab-nav-passes').onclick = async () => { currentTab = 'passes'; await renderLayout(); };
    document.getElementById('tab-nav-courses').onclick = async () => { currentTab = 'courses'; await renderLayout(); };
    document.getElementById('tab-nav-users').onclick = async () => { currentTab = 'users'; await renderLayout(); };
    document.getElementById('tab-nav-payments').onclick = async () => { currentTab = 'payments'; await renderLayout(); };
    document.getElementById('tab-nav-ai').onclick = async () => { currentTab = 'ai'; await renderLayout(); };
    
    const content = document.getElementById('admin-tab-content');
    if (currentTab === 'questions') await renderQuestions(content);
    else if (currentTab === 'passes') await renderPasses(content);
    else if (currentTab === 'courses') await renderCourses(content);
    else if (currentTab === 'users') await renderUsers(content);
    else if (currentTab === 'payments') await renderPayments(content);
    else if (currentTab === 'ai') await renderAISettings(content);
  }

  // ── Questions Tab ── //
  async function renderQuestions(parent) {
    const questions = currentBank === 'gk' ? QUESTIONS_GK : QUESTIONS_CUET;
    const customQuestions = await Store.getCustomQuestions();
    
    let html = `
      <div class="tabs" style="display:flex; gap:10px; margin-bottom:20px;">
        <button class="btn ${currentBank === 'gk' ? 'btn-primary' : 'btn-outline'}" id="tab-gk">GK Questions</button>
        <button class="btn ${currentBank === 'cuet' ? 'btn-primary' : 'btn-outline'}" id="tab-cuet">CUET Questions</button>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
        <button class="btn btn-primary" id="btn-add-q">+ नया प्रश्न जोड़ें (Add Question)</button>
        
        <div class="glass-card" style="padding:10px 15px; border:1px dashed var(--gold); background:rgba(201, 162, 39, 0.05); display:flex; align-items:center; gap:10px;">
          <div style="font-size:20px;">✨</div>
          <div>
            <div style="font-weight:bold; font-size:14px; color:var(--gold);">AI PDF Extractor</div>
            <div style="font-size:11px; color:var(--text-muted);">PDF अपलोड करें, AI स्वचालित रूप से प्रश्न निकाल लेगा।</div>
          </div>
          <input type="file" id="ai-pdf-upload" accept="application/pdf" style="display:none;">
          <button class="btn btn-sm btn-outline" style="border-color:var(--gold); color:var(--gold);" onclick="document.getElementById('ai-pdf-upload').click()">
            PDF चुनें
          </button>
        </div>
      </div>
      
      <div id="ai-pdf-loading" style="display:none; padding:20px; text-align:center; background:var(--bg-elevated); border-radius:8px; margin-bottom:20px; border:1px solid var(--primary);">
        <div class="spinner" style="margin:0 auto 10px auto;"></div>
        <div style="color:var(--primary); font-weight:bold;">संस्कृत गुरु PDF पढ़ रहे हैं... कृपया प्रतीक्षा करें (इसमें 10-30 सेकंड लग सकते हैं)</div>
      </div>
      
      <div id="admin-q-list" style="display:flex; flex-direction:column; gap:10px;">
    `;

    questions.forEach(q => {
      const isCustom = customQuestions.some(cq => cq.id === q.id);
      html += `
        <div class="card" style="padding:15px; border-left: 4px solid ${isCustom ? 'var(--primary)' : '#ccc'}">
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:5px;">
            ID: ${q.id} | Bank: ${q.bank} | ${q.cat ? 'Cat: ' + q.cat : 'Unit: ' + q.unit}
            ${isCustom ? '<span style="color:var(--primary); font-weight:bold; margin-left:10px;">[Customized]</span>' : ''}
          </div>
          <div style="font-weight:bold; margin-bottom:10px;">${q.q}</div>
          <div style="color:var(--success); margin-bottom:10px;">उत्तर: ${q.a ? q.a : '[सुरक्षित (Secure in DB)]'}</div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-sm btn-outline btn-edit-q" data-id="${q.id}">Edit</button>
            ${isCustom ? `<button class="btn btn-sm btn-outline btn-delete-q" style="color:var(--error); border-color:var(--error)" data-id="${q.id}">Delete</button>` : ''}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    parent.innerHTML = html;

    document.getElementById('tab-gk').onclick = async () => { currentBank = 'gk'; await renderQuestions(parent); };
    document.getElementById('tab-cuet').onclick = async () => { currentBank = 'cuet'; await renderQuestions(parent); };
    document.getElementById('btn-add-q').onclick = () => renderQuestionForm(null);
    
    document.querySelectorAll('.btn-edit-q').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const q = QUESTION_MAP[id];
        if (q) renderQuestionForm(q);
      };
    });

    document.querySelectorAll('.btn-delete-q').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.dataset.id;
        if(confirm("क्या आप इस प्रश्न को हटाना चाहते हैं? (Are you sure you want to delete this custom question?)")) {
          await Store.deleteCustomQuestion(id);
          await Data.init();
          await renderQuestions(parent);
        }
      };
    });

    // Handle PDF Upload
    const pdfInput = document.getElementById('ai-pdf-upload');
    if (pdfInput) {
      pdfInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const apiKey = await Store.getAiKey();
        if (!apiKey) {
          Components.showToast('Please save your Gemini API Key in AI Settings first!', 'error');
          return;
        }

        document.getElementById('ai-pdf-loading').style.display = 'block';
        
        try {
          const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
          });

          const prompt = `You are a strict data extraction AI. Extract all multiple-choice questions from the attached document. 
          Return ONLY a raw JSON array. DO NOT include markdown formatting like \`\`\`json. 
          The JSON array must contain objects exactly matching this schema:
          {
            "q": "The question text in Hindi/Sanskrit",
            "opts": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "a": "The exact text of the correct option"
          }
          Ensure exactly 4 options per question. If a question is incomplete, skip it.`;

          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: base64Data
                    }
                  }
                ]
              }]
            })
          });

          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error.message || 'Gemini API Error');
          }

          let responseText = data.candidates[0].content.parts[0].text;
          responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          
          const extractedQuestions = JSON.parse(responseText);
          
          if (!Array.isArray(extractedQuestions) || extractedQuestions.length === 0) {
            throw new Error('No valid questions found in PDF.');
          }

          for (const eq of extractedQuestions) {
            if (eq.q && Array.isArray(eq.opts) && eq.opts.length >= 2 && eq.a) {
              const newQ = {
                id: `${currentBank}_custom_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                bank: currentBank,
                q: eq.q,
                opts: eq.opts,
                a: eq.a,
                cat: currentBank === 'gk' ? 'general' : undefined,
                unit: currentBank === 'cuet' ? 'shabdaroop' : undefined
              };
              await Store.saveCustomQuestion(newQ);
              addedCount++;
            }
          }

          await Data.init();
          Components.showToast(`Success! Extracted ${addedCount} questions.`, 'success');
          await renderQuestions(parent);
          
        } catch (error) {
          console.error('PDF Extraction Error:', error);
          Components.showToast('Error extracting questions: ' + error.message, 'error');
        } finally {
          const loader = document.getElementById('ai-pdf-loading');
          if (loader) loader.style.display = 'none';
          pdfInput.value = '';
        }
      };
    }
  }

  function renderQuestionForm(q) {
    const isEdit = !!q;
    const bank = q ? q.bank : currentBank;
    
    let html = `
      <div class="card" style="padding:20px;">
        <h3 style="margin-bottom: 20px;">${isEdit ? 'प्रश्न संपादित करें (Edit Question)' : 'नया प्रश्न जोड़ें (Add Question)'}</h3>
        <div class="form-group" style="margin-bottom:15px;">
          <label style="display:block; margin-bottom:5px;">Bank</label>
          <select id="frm-bank" class="form-control" style="width:100%; padding:8px;" ${isEdit ? 'disabled' : ''}>
            <option value="gk" ${bank === 'gk' ? 'selected' : ''}>GK (सामान्य ज्ञान)</option>
            <option value="cuet" ${bank === 'cuet' ? 'selected' : ''}>CUET</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom:15px;">
          <label style="display:block; margin-bottom:5px;">Category / Unit</label>
          <input type="text" id="frm-cat" class="form-control" style="width:100%; padding:8px;" value="${q ? (q.cat || q.unit || '') : ''}" placeholder="e.g. general, veda OR shabdaroop">
        </div>

        <div class="form-group" style="margin-bottom:15px;">
          <label style="display:block; margin-bottom:5px;">Question</label>
          <textarea id="frm-q" class="form-control" style="width:100%; padding:8px;" rows="3">${q ? q.q : ''}</textarea>
        </div>
        
        <div class="form-group" style="margin-bottom:15px;">
          <label style="display:block; margin-bottom:5px;">Options (Comma separated, exactly 4)</label>
          <input type="text" id="frm-opts" class="form-control" style="width:100%; padding:8px;" value="${q ? q.opts.join(',') : ''}" placeholder="Option1,Option2,Option3,Option4">
        </div>

        <div class="form-group" style="margin-bottom:20px;">
          <label style="display:block; margin-bottom:5px;">Correct Answer (Must match one option exactly)</label>
          <input type="text" id="frm-a" class="form-control" style="width:100%; padding:8px;" value="${q ? q.a : ''}">
        </div>
        
        <div style="display:flex; gap:10px;">
          <button class="btn btn-outline" id="btn-cancel-frm">Cancel</button>
          <button class="btn btn-primary" id="btn-save-frm">Save Question</button>
        </div>
      </div>
    `;

    const parent = document.getElementById('admin-tab-content');
    parent.innerHTML = html;

    document.getElementById('btn-cancel-frm').onclick = async () => await renderQuestions(parent);
    
    document.getElementById('btn-save-frm').onclick = async () => {
      const formBank = document.getElementById('frm-bank').value;
      const formCat = document.getElementById('frm-cat').value;
      const formQ = document.getElementById('frm-q').value;
      const formOpts = document.getElementById('frm-opts').value.split(',').map(s => s.trim());
      const formA = document.getElementById('frm-a').value.trim();
      
      if(!formQ || formOpts.length < 2 || !formA) {
        Components.showToast('Please fill all required fields correctly.', 'error');
        return;
      }
      if(!formOpts.includes(formA)) {
        Components.showToast('Correct answer must exactly match one of the options.', 'error');
        return;
      }

      const newQ = {
        id: isEdit ? q.id : `${formBank}_custom_${Date.now()}`,
        bank: formBank,
        q: formQ,
        opts: formOpts,
        a: formA
      };
      
      if(formBank === 'gk') newQ.cat = formCat || 'general';
      else newQ.unit = formCat || 'shabdaroop';
      
      await Store.saveCustomQuestion(newQ);
      await Data.init();
      Components.showToast('Question saved successfully!', 'success');
      await renderQuestions(parent);
    };
  }

  // ── Passes Tab ── //
  const defaultPasses = [
    { id: 'monthly', title: 'मासिक पास', validity: '30 दिन की वैधता', price: 49, oldPrice: 99, recommended: false },
    { id: 'quarterly', title: 'त्रैमासिक पास', validity: '90 दिन की वैधता', price: 129, oldPrice: 299, recommended: false },
    { id: 'half-yearly', title: 'अर्धवार्षिक पास', validity: '180 दिन की वैधता', price: 199, oldPrice: 599, recommended: false },
    { id: 'yearly', title: 'वार्षिक पास', validity: '365 दिन की वैधता', price: 299, oldPrice: 1196, recommended: true, discount: '75% छूट' }
  ];
  
  async function renderPasses(parent) {
    let passes = (await Store.getPasses()) || defaultPasses;
    
    let html = `
      <div style="display:flex;flex-direction:column;gap:15px;">
        <h3>Recharge Plans (Passes)</h3>
        <p style="color:var(--text-muted);font-size:12px;">Edit pricing and details of the subscription passes.</p>
    `;
    
    passes.forEach((p, idx) => {
      html += `
        <div class="card" style="padding:15px; border-left:4px solid var(--gold);">
          <div style="font-weight:bold;font-size:16px;">${p.title} (${p.id})</div>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px;">
             <div><label>Title</label><input type="text" id="pass-title-${idx}" value="${p.title}" class="form-control"></div>
             <div><label>Price (₹)</label><input type="number" id="pass-price-${idx}" value="${p.price}" class="form-control"></div>
             <div><label>Validity</label><input type="text" id="pass-val-${idx}" value="${p.validity}" class="form-control"></div>
          </div>
        </div>
      `;
    });
    
    html += `
        <button class="btn btn-primary" id="btn-save-passes" style="margin-top:20px;">Save Passes</button>
      </div>
    `;
    parent.innerHTML = html;
    
    document.getElementById('btn-save-passes').onclick = async () => {
      let updated = passes.map((p, idx) => {
        return {
          ...p,
          title: document.getElementById(`pass-title-${idx}`).value,
          price: parseInt(document.getElementById(`pass-price-${idx}`).value) || 0,
          validity: document.getElementById(`pass-val-${idx}`).value
        };
      });
      await Store.savePasses(updated);
      Components.showToast('Passes updated!', 'success');
      await renderPasses(parent);
    };
  }

  // ── Courses Tab ── //
  const defaultCourses = [
    {
      module: 'खण्ड 1: सांख्य दर्शन परिचय',
      lessons: [
        { title: 'सांख्य दर्शन की भूमिका', duration: '45:20', isFree: true, video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: 'सत्कार्यवाद का सिद्धान्त', duration: '38:15', isFree: false, video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: 'प्रकृति और पुरुष का स्वरूप', duration: '52:10', isFree: false, video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
      ]
    },
    {
      module: 'खण्ड 2: प्रमाण मीमांसा',
      lessons: [
        { title: 'प्रत्यक्ष, अनुमान और शब्द प्रमाण', duration: '41:05', isFree: false, video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: 'प्रमाणों की उपयोगिता', duration: '30:45', isFree: false, video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
      ]
    },
    {
      module: 'खण्ड 3: सृष्टिक्रम एवं मोक्ष',
      lessons: [
        { title: 'प्रकृति से महत्तत्त्व का विकास', duration: '48:30', isFree: false, video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: 'पञ्चतन्मात्राएँ और महाभूत', duration: '42:15', isFree: false, video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { title: 'कैवल्य (मोक्ष) की प्राप्ति', duration: '55:00', isFree: false, video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
      ]
    }
  ];

  async function renderCourses(parent) {
    let courses = (await Store.getCourses()) || defaultCourses;
    
    let html = `
      <div style="display:flex;flex-direction:column;gap:15px;">
        <h3>Course Modules & Videos</h3>
        <p style="color:var(--text-muted);font-size:12px;">Edit lessons and video URLs.</p>
    `;
    
    courses.forEach((mod, mIdx) => {
      html += `
        <div class="card" style="padding:15px;border:1px solid var(--primary);position:relative;">
          <button class="btn-remove-module" data-midx="${mIdx}" style="position:absolute;top:10px;right:10px;background:none;border:none;color:var(--red);cursor:pointer;font-size:20px;" title="Remove Module">&times;</button>
          <label>Module Name</label>
          <input type="text" id="mod-title-${mIdx}" value="${mod.module}" class="form-control" style="font-weight:bold;margin-bottom:10px;">
          <div style="margin-left:15px;display:flex;flex-direction:column;gap:10px;">
      `;
      mod.lessons.forEach((l, lIdx) => {
        html += `
            <div style="border-left:2px solid #555;padding-left:10px;position:relative;margin-top:10px;">
               <button class="btn-remove-lesson" data-midx="${mIdx}" data-lidx="${lIdx}" style="position:absolute;top:0;right:0;background:none;border:none;color:var(--red);cursor:pointer;font-size:18px;" title="Remove Lesson">&times;</button>
               <label>Lesson ${lIdx+1} Title</label>
               <input type="text" id="lesson-title-${mIdx}-${lIdx}" value="${l.title}" class="form-control" placeholder="Lesson Title" style="margin-bottom:5px;">
               <label>Video URL</label>
               <input type="text" id="lesson-vid-${mIdx}-${lIdx}" value="${l.video}" class="form-control" placeholder="Video URL" style="margin-bottom:5px;font-family:monospace;font-size:12px;">
            </div>
        `;
      });
      html += `
            <button class="btn btn-sm btn-outline btn-add-lesson" data-midx="${mIdx}" style="margin-top:10px;align-self:flex-start;">+ Add Lesson</button>
          </div>
        </div>
      `;
    });
    
    html += `
        <button class="btn btn-outline" id="btn-add-module" style="margin-top:10px;border-style:dashed;">+ Add New Module</button>
        <button class="btn btn-primary" id="btn-save-courses" style="margin-top:20px;">Save Courses</button>
      </div>
    `;
    parent.innerHTML = html;
    
    // -- Bind Add/Remove Events --
    document.getElementById('btn-add-module').onclick = async () => {
      courses.push({ module: 'नया खण्ड (New Module)', lessons: [] });
      await Store.saveCourses(courses);
      await renderCourses(parent);
    };

    document.querySelectorAll('.btn-remove-module').forEach(btn => {
      btn.onclick = async (e) => {
        if(confirm("Remove this entire module?")) {
          const mIdx = e.target.dataset.midx;
          courses.splice(mIdx, 1);
          await Store.saveCourses(courses);
          await renderCourses(parent);
        }
      };
    });

    document.querySelectorAll('.btn-add-lesson').forEach(btn => {
      btn.onclick = async (e) => {
        const mIdx = e.target.dataset.midx;
        courses[mIdx].lessons.push({ title: 'नया पाठ (New Lesson)', duration: '00:00', isFree: false, video: '' });
        await Store.saveCourses(courses);
        await renderCourses(parent);
      };
    });

    document.querySelectorAll('.btn-remove-lesson').forEach(btn => {
      btn.onclick = async (e) => {
        if(confirm("Remove this lesson?")) {
          const mIdx = e.target.dataset.midx;
          const lIdx = e.target.dataset.lidx;
          courses[mIdx].lessons.splice(lIdx, 1);
          await Store.saveCourses(courses);
          await renderCourses(parent);
        }
      };
    });
    
    document.getElementById('btn-save-courses').onclick = async () => {
      let updated = courses.map((mod, mIdx) => {
        return {
          module: document.getElementById(`mod-title-${mIdx}`).value,
          lessons: mod.lessons.map((l, lIdx) => ({
            ...l,
            title: document.getElementById(`lesson-title-${mIdx}-${lIdx}`).value,
            video: document.getElementById(`lesson-vid-${mIdx}-${lIdx}`).value
          }))
        };
      });
      await Store.saveCourses(updated);
      Components.showToast('Courses updated!', 'success');
      await renderCourses(parent);
    };
  }

  // ── User Stats Tab ── //
  async function renderUsers(parent) {
    const users = await Store.getUsers();
    
    let html = `
      <div style="display:flex;flex-direction:column;gap:15px;">
        <h3>Registered Users (${users.length})</h3>
        <p style="color:var(--text-muted);font-size:12px;">View user statistics (Local Data)</p>
        
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse: collapse; text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid #555;">
                <th style="padding:10px;">Name</th>
                <th style="padding:10px;">Email</th>
                <th style="padding:10px;">Goal</th>
                <th style="padding:10px;">Streak</th>
                <th style="padding:10px;">Pro</th>
                <th style="padding:10px;">Action</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(u => {
      html += `
        <tr style="border-bottom:1px solid #333;">
          <td style="padding:10px;white-space:nowrap;">${u.name} ${u.isAdmin ? '👑' : ''}</td>
          <td style="padding:10px;font-family:monospace;font-size:12px;white-space:nowrap;">${u.email}</td>
          <td style="padding:10px;">${u.goal}</td>
          <td style="padding:10px;">🔥 ${u.streak}</td>
          <td style="padding:10px;color:${u.isPro ? 'var(--gold)' : '#888'};font-weight:bold;">${u.isPro ? 'YES' : 'NO'}</td>
          <td style="padding:10px;">
            ${!u.isAdmin ? `<button class="btn btn-sm btn-outline btn-delete-user" data-id="${u.id}" style="color:var(--red);border-color:var(--red);padding:4px 8px;">Delete</button>` : ''}
          </td>
        </tr>
      `;
    });
    
    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    parent.innerHTML = html;

    document.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.onclick = async (e) => {
        if(confirm("Are you sure you want to permanently delete this user?")) {
          await Store.deleteUser(e.target.dataset.id);
          Components.showToast('User deleted', 'info');
          await renderUsers(parent);
        }
      };
    });
  }

  // ── Payment Requests Tab ── //
  async function renderPayments(parent) {
    const payments = (await Store.getPendingPayments()).sort((a, b) => b.timestamp - a.timestamp);
    
    let html = `
      <div style="display:flex;flex-direction:column;gap:15px;">
        <h3>Payment Verification (${payments.filter(p => p.status === 'pending').length} Pending)</h3>
        <p style="color:var(--text-muted);font-size:12px;">Verify UTRs submitted by users and approve their passes.</p>
        
        <div style="display:flex;flex-direction:column;gap:10px;">
    `;

    if (payments.length === 0) {
      html += `<div style="padding:20px;text-align:center;color:var(--text-muted)">No payment requests found.</div>`;
    }

    payments.forEach(p => {
      const isPending = p.status === 'pending';
      html += `
        <div class="card" style="padding:15px; border-left: 4px solid ${isPending ? 'var(--gold)' : (p.status === 'approved' ? 'var(--green)' : 'var(--red)')}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <div>
              <div style="font-weight:bold">${p.userName} <span style="font-size:12px;color:var(--text-muted);font-weight:normal">(${p.userEmail})</span></div>
              <div style="font-size:12px;margin-top:4px">Tier: <strong>${p.passTier}</strong> | Amount: <strong>₹${p.amount}</strong></div>
              <div style="font-size:14px;margin-top:8px;font-family:monospace">UTR: <strong style="color:var(--gold)">${p.utr}</strong></div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${new Date(p.timestamp).toLocaleString()}</div>
            </div>
            <div style="font-size:12px;font-weight:bold;text-transform:uppercase;color:${isPending ? 'var(--gold)' : (p.status === 'approved' ? 'var(--green)' : 'var(--red)')}">
              ${p.status}
            </div>
          </div>
          ${isPending ? `
            <div style="display:flex;gap:10px;margin-top:10px">
              <button class="btn btn-sm btn-outline btn-reject-payment" data-id="${p.id}" style="color:var(--red);border-color:var(--red)">Reject</button>
              <button class="btn btn-sm btn-primary btn-approve-payment" data-id="${p.id}" data-userid="${p.userId}" data-tier="${p.passTier}">Approve & Grant Pass</button>
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
    parent.innerHTML = html;

    document.querySelectorAll('.btn-approve-payment').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.dataset.id;
        const userId = e.target.dataset.userid;
        const tier = e.target.dataset.tier;
        
        if (confirm('Are you sure you want to approve this payment and grant Pro access?')) {
          await Store.updatePendingPaymentStatus(id, 'approved');
          
          // Update the user's profile in the registry
          const allUsers = await Store.getUsers();
          const uIdx = allUsers.findIndex(u => u.id === userId);
          if (uIdx >= 0) {
            allUsers[uIdx].isPro = true;
            allUsers[uIdx].passTier = tier;
            await Store.set('all_users', allUsers);
            
            // If the user being approved is the currently logged-in user (e.g. testing)
            const currentUser = await Store.getUser();
            if (currentUser && currentUser.id === userId) {
              await Store.updateProfile({ isPro: true, passTier: tier });
            }
            
            Components.showToast('Payment Approved and Pass Granted!', 'success');
            await renderPayments(parent);
          }
        }
      };
    });

    document.querySelectorAll('.btn-reject-payment').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to reject this payment request?')) {
          await Store.updatePendingPaymentStatus(id, 'rejected');
          Components.showToast('Payment Rejected.', 'info');
          await renderPayments(parent);
        }
      };
    });
  }

  // ── AI Settings Tab ── //
  async function renderAISettings(parent) {
    const currentKey = (await Store.getAiKey()) || '';
    
    let html = `
      <div style="display:flex;flex-direction:column;gap:15px;">
        <h3>Sanskrit Guru AI (Gemini Integration)</h3>
        <p style="color:var(--text-muted);font-size:14px;line-height:1.6;">
          यहाँ अपनी <strong>Google Gemini API Key</strong> डालें ताकि "संस्कृत गुरु" (AI Assistant) काम कर सके।
          यह कुंजी केवल आपके ब्राउज़र के LocalStorage में सुरक्षित रूप से सहेजी जाएगी।
        </p>
        
        <div class="card" style="padding:20px; border-left:4px solid var(--primary);">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">Gemini API Key</label>
          <input type="password" id="admin-ai-key" class="form-control" placeholder="AIzaSy..." value="${currentKey}" style="width:100%;margin-bottom:15px;">
          
          <button class="btn btn-primary" id="btn-save-ai-key">Save Key</button>
          
          <div style="margin-top:20px;font-size:12px;color:var(--text-muted);">
            Don't have an API Key? Get one for free from <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--primary);text-decoration:underline;">Google AI Studio</a>.
          </div>
        </div>
      </div>
    `;
    parent.innerHTML = html;

    document.getElementById('btn-save-ai-key').onclick = async () => {
      const key = document.getElementById('admin-ai-key').value.trim();
      await Store.saveAiKey(key);
      Components.showToast('AI API Key Saved successfully!', 'success');
    };
  }

  // Initial render
  await renderLayout();
}
