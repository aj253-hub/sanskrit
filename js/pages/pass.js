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

  try {
    Components.showToast('भुगतान आरंभ किया जा रहा है...', 'info');

    // 1. Create order on server
    const orderRes = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInRupees, receipt: `rcpt_${user.id}_${Date.now()}` })
    });
    
    if (!orderRes.ok) {
      throw new Error('Failed to create order');
    }
    
    const order = await orderRes.json();

    // 2. Open Razorpay Checkout
    const options = {
      key: 'rzp_test_placeholder', // MUST BE REPLACED WITH ACTUAL PUBLIC KEY IN PROD
      amount: order.amount,
      currency: order.currency,
      name: 'संस्कृत सेतु (Sanskrit Setu)',
      description: `Pro Pass (${tier})`,
      order_id: order.id,
      handler: async function (response) {
        try {
          Components.showToast('भुगतान का सत्यापन किया जा रहा है...', 'info');
          
          // 3. Verify on server
          const verifyRes = await fetch('/api/verify-razorpay-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_type: tier,
              user_id: user.id
            })
          });

          if (!verifyRes.ok) {
            throw new Error('Payment verification failed');
          }

          // Force refresh local user state
          await Store.updateProfile({}); 
          Components.showToast('पास सफलतापूर्वक सक्रिय हो गया! धन्यवाद।', 'success');
          
          Router.navigate('home');
        } catch (err) {
          console.error(err);
          Components.showToast('सत्यापन में त्रुटि। कृपया सपोर्ट से संपर्क करें।', 'error');
        }
      },
      prefill: {
        name: user.name,
        email: user.email
      },
      theme: {
        color: '#D4AF37' 
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response){
      Components.showToast('भुगतान विफल रहा: ' + response.error.description, 'error');
    });
    rzp.open();

  } catch (error) {
    console.error('Payment Error:', error);
    Components.showToast('भुगतान प्रणाली में त्रुटि। बाद में प्रयास करें।', 'error');
  }
}
