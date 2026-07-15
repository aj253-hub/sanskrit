/* ============================================================
   संस्कृत सेतु — Notes Page
   ============================================================ */

let _editingNote = null;

async function renderNotesPage() {
  const container = document.getElementById('app-content');
  const notes = await Store.getNotes();

  if (_editingNote) {
    _renderNoteEditor(container);
    return;
  }

  container.innerHTML = `
    <div class="page-container page-enter">
      ${Components.pageHeader('📝 मेरे नोट्स')}
      
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg)">
        <p style="color:var(--text-secondary);font-size:var(--fs-sm)">
          ${notes.length} नोट्स
        </p>
        <button class="btn btn-primary btn-sm" onclick="createNewNote()">+ नया नोट</button>
      </div>

      ${notes.length === 0 ? 
        Components.emptyState('📝', 'अभी कोई नोट नहीं। अपने अध्ययन नोट्स यहाँ लिखें!',
          '<button class="btn btn-primary" onclick="createNewNote()">पहला नोट बनाएँ</button>') :
        `<div class="notes-list stagger-children">
          ${notes.sort((a, b) => (b.updated || b.created) - (a.updated || a.created)).map(note => `
            <button class="note-card" onclick="editNote('${note.id}')">
              <div class="note-title">${Utils.escapeHtml(note.title || 'बिना शीर्षक')}</div>
              <div class="note-preview">${Utils.escapeHtml((note.content || '').slice(0, 80))}</div>
              <div class="note-date">${Utils.timeAgo(note.updated || note.created)}</div>
            </button>
          `).join('')}
        </div>`
      }
    </div>
  `;
}

function _renderNoteEditor(container) {
  const note = _editingNote;
  const isNew = !note.id;

  container.innerHTML = `
    <div class="page-container page-enter">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg)">
        <button class="btn btn-ghost btn-sm" onclick="closeNoteEditor()">← वापस</button>
        <div style="display:flex;gap:var(--space-sm)">
          ${!isNew ? `<button class="btn btn-ghost btn-sm" style="color:var(--red-light)" onclick="deleteCurrentNote()">हटाएँ</button>` : ''}
          <button class="btn btn-primary btn-sm" onclick="saveCurrentNote()">सहेजें</button>
        </div>
      </div>

      <div class="note-editor">
        <input type="text" class="input-field" id="note-title" placeholder="शीर्षक..." 
          value="${Utils.escapeHtml(note.title || '')}"
          style="font-size:var(--fs-lg);font-weight:var(--fw-bold);margin-bottom:var(--space-md);font-family:var(--font-hindi)">
        
        <div class="form-group" style="margin-bottom:var(--space-sm)">
          <label class="input-label">विषय</label>
          <select class="input-field" id="note-subject" style="padding:10px 14px">
            <option value="">कोई विषय नहीं</option>
            ${CUET_UNITS.map(u => `<option value="${u.id}" ${note.subject === u.id ? 'selected' : ''}>${u.label}</option>`).join('')}
            ${Object.entries(GK_CAT_LABELS).map(([k, v]) => `<option value="${k}" ${note.subject === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        
        <textarea class="input-field" id="note-content" placeholder="अपने नोट्स यहाँ लिखें..." 
          style="min-height:300px;line-height:1.8;font-size:var(--fs-base)">${Utils.escapeHtml(note.content || '')}</textarea>
      </div>
    </div>
  `;
  
  // Focus title if new
  if (isNew) {
    setTimeout(() => document.getElementById('note-title')?.focus(), 100);
  }
}

async function createNewNote() {
  _editingNote = { title: '', content: '', subject: '' };
  await renderNotesPage();
}

async function editNote(id) {
  const notes = await Store.getNotes();
  _editingNote = { ...notes.find(n => n.id === id) };
  await renderNotesPage();
}

async function saveCurrentNote() {
  if (!_editingNote) return;
  
  const title = document.getElementById('note-title')?.value.trim() || '';
  const content = document.getElementById('note-content')?.value.trim() || '';
  const subject = document.getElementById('note-subject')?.value || '';
  
  if (!title && !content) {
    Components.showToast('कृपया शीर्षक या सामग्री लिखें', 'warning');
    return;
  }
  
  await Store.saveNote({
    ...(_editingNote.id ? { id: _editingNote.id } : {}),
    title: title || 'बिना शीर्षक',
    content,
    subject
  });
  
  Components.showToast('नोट सहेजा गया ✅', 'success');
  _editingNote = null;
  await renderNotesPage();
}

function deleteCurrentNote() {
  if (!_editingNote?.id) return;
  Components.showConfirm('नोट हटाएँ?', 'यह कार्य पूर्ववत नहीं किया जा सकता।', async () => {
    await Store.deleteNote(_editingNote.id);
    Components.showToast('नोट हटाया गया', 'info');
    _editingNote = null;
    await renderNotesPage();
  });
}

async function closeNoteEditor() {
  _editingNote = null;
  await renderNotesPage();
}
