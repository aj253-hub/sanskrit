/* ============================================================
   संस्कृत सेतु — Admin Panel
   Manage Questions
   ============================================================ */

function renderAdminPage() {
  const user = Store.getUser();
  if (!user || !user.isAdmin) {
    Router.navigate('home');
    return;
  }

  const container = document.getElementById('app-content');
  
  // State for the admin panel
  let currentBank = 'gk';
  let isEditing = false;
  let editingId = null;

  function renderList() {
    const questions = currentBank === 'gk' ? QUESTIONS_GK : QUESTIONS_CUET;
    const customQuestions = Store.getCustomQuestions();
    
    // Group by category/unit for better display
    let html = `
      ${Components.pageHeader('प्रशासन कक्ष (Admin Panel)')}
      
      <div class="tabs" style="display:flex; gap:10px; margin-bottom:20px;">
        <button class="btn ${currentBank === 'gk' ? 'btn-primary' : 'btn-outline'}" id="tab-gk">GK Questions</button>
        <button class="btn ${currentBank === 'cuet' ? 'btn-primary' : 'btn-outline'}" id="tab-cuet">CUET Questions</button>
      </div>
      
      <button class="btn btn-primary" id="btn-add-q" style="margin-bottom:20px;">+ नया प्रश्न जोड़ें (Add Question)</button>
      
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
          <div style="color:var(--success); margin-bottom:10px;">उत्तर: ${q.a}</div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-sm btn-outline btn-edit-q" data-id="${q.id}">Edit</button>
            ${isCustom ? `<button class="btn btn-sm btn-outline btn-delete-q" style="color:var(--error); border-color:var(--error)" data-id="${q.id}">Delete</button>` : ''}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = `<div class="page-container">${html}</div>`;

    document.getElementById('tab-gk').onclick = () => { currentBank = 'gk'; renderList(); };
    document.getElementById('tab-cuet').onclick = () => { currentBank = 'cuet'; renderList(); };
    document.getElementById('btn-add-q').onclick = () => renderForm(null);
    
    document.querySelectorAll('.btn-edit-q').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const q = QUESTION_MAP[id];
        if (q) renderForm(q);
      };
    });

    document.querySelectorAll('.btn-delete-q').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        if(confirm("क्या आप इस प्रश्न को हटाना चाहते हैं? (Are you sure you want to delete this custom question?)")) {
          Store.deleteCustomQuestion(id);
          Data.init();
          renderList();
        }
      };
    });
  }

  function renderForm(q) {
    const isEdit = !!q;
    const bank = q ? q.bank : currentBank;
    
    let html = `
      <div class="page-container">
        ${Components.pageHeader(isEdit ? 'प्रश्न संपादित करें (Edit Question)' : 'नया प्रश्न जोड़ें (Add Question)', false)}
        
        <div class="card" style="padding:20px;">
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
      </div>
    `;

    container.innerHTML = html;

    document.getElementById('btn-cancel-frm').onclick = () => renderList();
    
    document.getElementById('btn-save-frm').onclick = () => {
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
      
      Store.saveCustomQuestion(newQ);
      Data.init(); // Refresh data
      Components.showToast('Question saved successfully!', 'success');
      renderList();
    };
  }

  // Initial render
  renderList();
}
