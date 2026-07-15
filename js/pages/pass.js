/* ============================================================
   संस्कृत सेतु — Setu Pass (Subscription) Page
   ============================================================ */

const DEFAULT_PASSES = [
  { id: 'monthly', title: 'मासिक पास', validity: '30 दिन की वैधता', price: 49, oldPrice: 99, recommended: false },
  { id: 'quarterly', title: 'त्रैमासिक पास', validity: '90 दिन की वैधता', price: 129, oldPrice: 299, recommended: false },
  { id: 'half-yearly', title: 'अर्धवार्षिक पास', validity: '180 दिन की वैधता', price: 199, oldPrice: 599, recommended: false },
  { id: 'yearly', title: 'वार्षिक पास', validity: '365 दिन की वैधता', price: 299, oldPrice: 1196, recommended: true, discount: '75% छूट', features: ['500+ CUET/Shastri/Acharya मॉक टेस्ट', 'पिछले 5 वर्षों के हल प्रश्न पत्र', 'विस्तृत अखिल भारतीय रैंक (AIR) विश्लेषण', 'ऑफ़लाइन देखने के लिए PDF नोट्स डाउनलोड'] }
];

async function renderPassPage() {
  const container = document.getElementById('app-content');
  const user = await Store.getUser();
  const hasPass = user?.isPro || false;

  // Fetch passes from Store or use defaults
  const passes = (await Store.getPasses()) || DEFAULT_PASSES;

  // Show header/nav
  const header = document.getElementById('app-header');
  const nav = document.getElementById('bottom-nav');
  if (header) header.style.display = '';
  if (nav) nav.style.display = '';

  // Check URL parameters for payment status return (Keep this just in case they land back, but we don't need it as much now)
  const urlParams = new URLSearchParams(window.location.href.split('?')[1] || '');

  let passesHTML = passes.map(p => {
    if (p.recommended) {
      return `
        <!-- Recommended Pass -->
        <div class="glass-card pricing-card recommended" style="border-color:var(--gold);box-shadow:var(--shadow-glow);position:relative">
          <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--bg-deep);padding:4px 12px;border-radius:var(--radius-pill);font-size:var(--fs-xs);font-weight:var(--fw-bold)">
            सबसे लोकप्रिय
          </div>
          <div class="pricing-header">
            <div>
              <h3 style="font-size:var(--fs-xl);color:var(--gold)">${p.title}</h3>
              <div style="color:var(--text-muted);font-size:var(--fs-sm)">${p.validity}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);color:var(--gold)">₹${p.price}</div>
              <div style="color:var(--green-light);font-size:var(--fs-sm);font-weight:var(--fw-bold)">${p.discount || ''}</div>
            </div>
          </div>
          ${p.features && p.features.length > 0 ? `
          <ul class="pricing-features">
            ${p.features.map(f => `<li><span class="icon">✅</span> ${f}</li>`).join('')}
          </ul>` : ''}
          <button class="btn btn-primary" style="width:100%;margin-top:var(--space-lg)" onclick="handleBuyPass('${p.id}', ${p.price})">
            ${hasPass ? 'अपग्रेड करें' : p.title + ' खरीदें'}
          </button>
        </div>
      `;
    } else {
      return `
        <!-- Standard Pass -->
        <div class="glass-card pricing-card">
          <div class="pricing-header">
            <div>
              <h3 style="font-size:var(--fs-xl);color:var(--text-primary)">${p.title}</h3>
              <div style="color:var(--text-muted);font-size:var(--fs-sm)">${p.validity}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);color:var(--gold)">₹${p.price}</div>
              ${p.oldPrice ? `<div style="text-decoration:line-through;color:var(--text-muted);font-size:var(--fs-sm)">₹${p.oldPrice}</div>` : ''}
            </div>
          </div>
          <button class="btn btn-outline" style="width:100%;margin-top:var(--space-lg);border-color:var(--gold);color:var(--gold)" onclick="handleBuyPass('${p.id}', ${p.price})">
            ${hasPass ? 'अपग्रेड करें' : p.title + ' खरीदें'}
          </button>
        </div>
      `;
    }
  }).join('');

  container.innerHTML = `
    <div class="page-container page-enter">
      <div style="text-align:center;margin-bottom:var(--space-2xl);padding-top:var(--space-xl)">
        <div style="display:inline-block;padding:4px 12px;background:var(--gold-glow);color:var(--gold);border-radius:var(--radius-pill);font-size:var(--fs-xs);font-weight:var(--fw-bold);margin-bottom:var(--space-md);border:1px solid var(--gold)">
          PRO MEMBERSHIP
        </div>
        <h2 style="font-size:var(--fs-3xl);margin-bottom:var(--space-sm);font-family:var(--font-hindi);color:var(--gold)">
          संस्कृत सेतु <span style="color:var(--text-primary)">पास</span>
        </h2>
        <p style="color:var(--text-secondary);font-size:var(--fs-md);max-width:400px;margin:0 auto">
          सभी 500+ मॉक टेस्ट, पिछले वर्ष के प्रश्न पत्र और विस्तृत विश्लेषण तक पहुँच प्राप्त करें।
        </p>
      </div>

      <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-md)">
        ${passesHTML}
      </div>
      
      <div style="margin-top:var(--space-2xl);text-align:center;padding-bottom:var(--space-2xl)">
        <h4 style="margin-bottom:var(--space-lg)">पास के लाभ</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);text-align:left">
          <div class="glass-card" style="padding:var(--space-md)">
            <div style="font-size:24px;margin-bottom:8px">🎯</div>
            <div style="font-weight:var(--fw-bold);font-size:var(--fs-sm)">असीमित अभ्यास</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px">सभी परीक्षाओं के लिए 500+ मॉक टेस्ट अनलॉक करें</div>
          </div>
          <div class="glass-card" style="padding:var(--space-md)">
            <div style="font-size:24px;margin-bottom:8px">📊</div>
            <div style="font-weight:var(--fw-bold);font-size:var(--fs-sm)">गहन विश्लेषण</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px">कमजोर क्षेत्रों की पहचान करें और सुधारें</div>
          </div>
          <div class="glass-card" style="padding:var(--space-md)">
            <div style="font-size:24px;margin-bottom:8px">📝</div>
            <div style="font-weight:var(--fw-bold);font-size:var(--fs-sm)">पिछले वर्ष के पेपर</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px">CUET, शास्त्री और आचार्य के असली पेपर</div>
          </div>
          <div class="glass-card" style="padding:var(--space-md)">
            <div style="font-size:24px;margin-bottom:8px">📱</div>
            <div style="font-weight:var(--fw-bold);font-size:var(--fs-sm)">ऑफ़लाइन मोड</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-top:4px">PDF डाउनलोड करें और बिना इंटरनेट के पढ़ें</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function handleBuyPass(tier, amountInRupees) {
  const user = await Store.getUser();
  if (!user) {
    Components.showToast('पास खरीदने के लिए पहले लॉगिन करें!', 'error');
    Router.navigate('login');
    return;
  }
  
  if (user.isPro) {
    Components.showToast('आप पहले से ही प्रो सदस्य हैं!', 'info');
    return;
  }

  // Check if they already have a pending payment
  const pendingPayments = await Store.getPendingPayments();
  const pending = pendingPayments.find(p => p.userId === user.id && p.status === 'pending');
  if (pending) {
    const waNumber = "919162040951"; 
    const waText = `नमस्ते Admin, मैंने Sanskrit Setu Pass (${pending.passTier}) के लिए भुगतान किया है।\n\nName: ${user.name}\nEmail: ${user.email}\nAmount: ₹${pending.amount}\nUTR Number: ${pending.utr}`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    
    const pendingModalId = 'pending-modal-' + Date.now();
    const pendingModalHtml = `
      <div id="${pendingModalId}" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:var(--space-md)">
        <div class="modal-content" style="background:var(--bg-elevated);width:100%;max-width:400px;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-glow);padding:var(--space-xl);text-align:center">
          <div style="font-size:48px;margin-bottom:16px">⏳</div>
          <h3 style="color:var(--gold);margin-bottom:var(--space-sm);font-size:var(--fs-xl)">सत्यापन की प्रतीक्षा है</h3>
          <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-md)">
            आपका पिछला भुगतान (UTR: <strong style="color:var(--text-primary)">${pending.utr}</strong>) अभी सत्यापन के लिए लंबित है।
          </p>
          <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-lg)">
            यदि आपने अभी तक एडमिन को WhatsApp पर मैसेज नहीं किया है, तो नीचे दिए गए बटन पर क्लिक करें:
          </p>
          <a href="${waUrl}" target="_blank" class="btn btn-primary" style="display:block;width:100%;background:#25D366;border-color:#25D366;color:white;margin-bottom:var(--space-sm);text-decoration:none;font-weight:bold;">
            WhatsApp पर फिर से भेजें
          </a>
          <button class="btn btn-outline" style="width:100%" onclick="document.getElementById('${pendingModalId}').remove()">बंद करें</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', pendingModalHtml);
    return;
  }

  const adminUpi = "9162040951@ybl";
  const upiUrl = `upi://pay?pa=${adminUpi}&pn=Sanskrit%20Setu&am=${amountInRupees}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const modalId = 'payment-modal-' + Date.now();
  const modalHtml = `
    <div id="${modalId}" class="modal-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:var(--space-md)">
      <div class="modal-content" style="background:var(--bg-elevated);width:100%;max-width:400px;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-glow);padding:var(--space-xl);text-align:center">
        <h3 style="color:var(--gold);margin-bottom:var(--space-sm);font-size:var(--fs-xl)">सुरक्षित भुगतान</h3>
        <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-md)">
          कृपया नीचे दिए गए QR कोड को स्कैन करें और <strong>₹${amountInRupees}</strong> का भुगतान करें।
        </p>
        
        <div style="background:white;padding:10px;border-radius:8px;display:inline-block;margin-bottom:var(--space-md)">
          <img src="${qrUrl}" alt="Payment QR Code" style="width:200px;height:200px">
        </div>
        
        <div style="font-size:var(--fs-md);margin-bottom:var(--space-md);font-family:var(--font-mono)">
          UPI ID: <strong style="color:var(--text-primary)">${adminUpi}</strong>
        </div>

        <div style="text-align:left;margin-bottom:var(--space-lg)">
          <label style="display:block;margin-bottom:8px;font-size:var(--fs-sm);color:var(--text-secondary)">भुगतान के बाद UTR/Transaction ID दर्ज करें:</label>
          <input type="text" id="utr-input-${modalId}" class="form-control" placeholder="12-digit UTR number" style="width:100%;padding:10px;font-family:var(--font-mono)">
        </div>

        <div style="display:flex;gap:var(--space-sm)">
          <button class="btn btn-outline" style="flex:1" onclick="document.getElementById('${modalId}').remove()">रद्द करें</button>
          <button class="btn btn-primary" style="flex:1" id="submit-payment-${modalId}">सबमिट करें</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById(`submit-payment-${modalId}`).onclick = async () => {
    const utr = document.getElementById(`utr-input-${modalId}`).value.trim();
    if (!utr || utr.length < 8) {
      Components.showToast('कृपया सही UTR/Transaction ID दर्ज करें!', 'error');
      return;
    }

    await Store.savePendingPayment({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      passTier: tier,
      amount: amountInRupees,
      utr: utr
    });

    const waNumber = "919162040951"; 
    const waText = `नमस्ते Admin, मैंने Sanskrit Setu Pass (${tier}) के लिए भुगतान किया है।\n\nName: ${user.name}\nEmail: ${user.email}\nAmount: ₹${amountInRupees}\nUTR Number: ${utr}`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

    // Show success screen with explicit WhatsApp button to bypass popup blockers
    const modalContent = document.querySelector(`#${modalId} .modal-content`);
    modalContent.innerHTML = `
      <div style="font-size:48px;margin-bottom:16px">✅</div>
      <h3 style="color:var(--green);margin-bottom:var(--space-sm);font-size:var(--fs-xl)">भुगतान विवरण सुरक्षित!</h3>
      <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--space-lg)">
        आपका UTR सुरक्षित कर लिया गया है। पास तुरंत चालू करने के लिए एडमिन को WhatsApp पर मेसेज भेजें।
      </p>
      <a href="${waUrl}" target="_blank" class="btn btn-primary" style="display:block;width:100%;background:#25D366;border-color:#25D366;color:white;margin-bottom:var(--space-sm);text-decoration:none;font-weight:bold;">
        WhatsApp पर भेजें
      </a>
      <button class="btn btn-outline" style="width:100%" onclick="document.getElementById('${modalId}').remove()">बंद करें</button>
    `;
    
    Components.showToast('आपका भुगतान विवरण सुरक्षित रूप से भेज दिया गया है।', 'success');
  };
}
