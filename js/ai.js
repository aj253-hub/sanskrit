/* ============================================================
   संस्कृत सेतु — Sanskrit Guru AI (Gemini Integration)
   ============================================================ */

const AI = {
  _history: [],

  // Set your API key here to test locally without a backend
  _apiKey: 'AQ.Ab8RN6LrP8wIqJl8VBJ2AUrZaTaVec_oiG1J-AWKboOs7hxWIw',

  // Direct Google Gemini API endpoint
  _apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',

  init() {
    this._renderChatWindow();

    // Add initial greeting if history is empty
    if (this._history.length === 0) {
      this._addMessage("नमो नमः! 🙏 मैं संस्कृत गुरु हूँ। आप मुझसे संस्कृत व्याकरण, साहित्य, या परीक्षा से सम्बंधित कोई भी प्रश्न पूछ सकते हैं।", 'bot');
    }
  },

  _renderChatWindow() {
    const container = document.createElement('div');
    container.id = 'ai-chatbot-container';
    container.innerHTML = `
      <div id="ai-chat-window" class="ai-chat-window hidden">
        <div class="ai-chat-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="ai-avatar">🕉️</div>
            <div>
              <div style="font-weight:bold; font-size:16px;">संस्कृत गुरु</div>
              <div style="font-size:12px; opacity:0.8;">AI Assistant</div>
            </div>
          </div>
          <button id="ai-close-btn" class="ai-close-btn">&times;</button>
        </div>
        <div id="ai-chat-body" class="ai-chat-body"></div>
        <div class="ai-chat-footer">
          <input type="text" id="ai-chat-input" placeholder="अपना प्रश्न पूछें..." autocomplete="off">
          <button id="ai-send-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      </div>
      <button id="ai-fab" class="ai-fab">
        <span class="ai-fab-icon">🤖</span>
      </button>
    `;
    document.body.appendChild(container);

    const fab = document.getElementById('ai-fab');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-close-btn');
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-chat-input');

    fab.onclick = () => {
      chatWindow.classList.toggle('hidden');
      if (!chatWindow.classList.contains('hidden')) {
        input.focus();
        this._scrollToBottom();
      }
    };

    closeBtn.onclick = () => {
      chatWindow.classList.add('hidden');
    };

    const sendMessage = () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      this._handleUserMessage(text);
    };

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };
  },

  async _handleUserMessage(text) {
    this._addMessage(text, 'user');
    const typingId = this._addTypingIndicator();

    try {
      const prompt = `You are "Sanskrit Guru", an expert AI assistant for "Sanskrit Setu", an exam prep platform. You are also an expert in Pāṇinian Sanskrit Grammar, similar to Shaabdabodha. 
When the user provides a śloka or asks for grammatical analysis, provide a complete traditional vyākaraṇa analysis with every step grounded in Pāṇinian sūtras and classical commentaries. Include the following sections if applicable:
1. पदच्छेदः — word separation
2. सन्धि-विग्रहः — sandhi breakdown with sūtra
3. समास-विग्रहः — compound resolution
4. शब्दरूप-विश्लेषणम् — nominal morphology with English meaning
5. धातुरूप-विश्लेषणम् — verbal morphology with Sanskrit + English meaning
6. कारक-विभक्ति-सम्बन्धः — kāraka theory
7. अन्वयः — prose ordering
8. श्लोकार्थः — meaning in Sanskrit, Hindi and English
9. छन्दः — metre 
10. अलङ्कारः — figures of speech

If the user asks a general question, answer primarily in Hindi (with Sanskrit terms where appropriate). Be accurate and encouraging.

Question: ${text}`;

      const response = await fetch(`${this._apiUrl}?key=${this._apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      this._removeMessage(typingId);

      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }

      const reply = data.candidates[0].content.parts[0].text;
      this._addMessage(reply, 'bot');
    } catch (e) {
      console.error("AI Error:", e);
      this._removeMessage(typingId);
      this._addMessage("क्षमा करें, मुझे इस समय आपसे जुड़ने में समस्या हो रही है। कृपया अपनी API Key की जाँच करें या थोड़ी देर बाद प्रयास करें।", 'bot');
    }
  },

  _addMessage(text, sender) {
    const id = 'msg-' + Date.now();
    this._history.push({ id, text, sender });
    this._renderMessage(id, text, sender);
    return id;
  },

  _renderMessage(id, text, sender) {
    const body = document.getElementById('ai-chat-body');
    const msgEl = document.createElement('div');
    msgEl.id = id;
    msgEl.className = `ai-msg ${sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`;

    // Parse basic markdown to HTML
    let parsedText = Utils.escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    msgEl.innerHTML = `<div class="ai-msg-bubble">${parsedText}</div>`;
    body.appendChild(msgEl);
    this._scrollToBottom();
  },

  _addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const body = document.getElementById('ai-chat-body');
    const msgEl = document.createElement('div');
    msgEl.id = id;
    msgEl.className = `ai-msg ai-msg-bot`;
    msgEl.innerHTML = `
      <div class="ai-msg-bubble ai-typing">
        <span></span><span></span><span></span>
      </div>
    `;
    body.appendChild(msgEl);
    this._scrollToBottom();
    return id;
  },

  _removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  _scrollToBottom() {
    const body = document.getElementById('ai-chat-body');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }
};
