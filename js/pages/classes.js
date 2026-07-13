/* ============================================================
   संस्कृत सेतु — Live Classes / SuperCoaching Page
   ============================================================ */

function renderClassesPage() {
  const container = document.getElementById('app-content');
  
  // Show header/nav
  const header = document.getElementById('app-header');
  const nav = document.getElementById('bottom-nav');
  if (header) header.style.display = '';
  if (nav) nav.style.display = '';

  const liveClasses = [
    { title: 'UGC NET - सांख्यकारिका', faculty: 'आचार्य शर्मा', time: 'LIVE NOW', viewers: 540, tag: 'UGC NET' },
    { title: 'CUET-PG - व्याकरण महाभाष्य', faculty: 'डॉ. त्रिपाठी', time: 'LIVE NOW', viewers: 320, tag: 'CUET-PG' },
    { title: 'UP TGT संस्कृत - मेघदूतम्', faculty: 'विद्वान शास्त्री', time: 'आज, 5:00 PM', tag: 'State TET' }
  ];

  const recordedCourses = [
    { title: 'UGC NET / JRF संस्कृत (Code 25/73) सम्पूर्ण कोर्स', faculty: 'आचार्य शर्मा', lessons: 120, duration: '80 घंटे', tag: 'UGC NET', img: 'assets/images/course4.jpg' },
    { title: 'शास्त्री प्रवेश - साहित्य एवं व्याकरण', faculty: 'डॉ. वेदव्रत', lessons: 60, duration: '35 घंटे', tag: 'CUET-UG', img: 'assets/images/course1.jpg' },
    { title: 'UPMSSP उत्तर मध्यमा एवं शास्त्री', faculty: 'आचार्य शर्मा', lessons: 45, duration: '20 घंटे', tag: 'Traditional', img: 'assets/images/course2.jpg' },
    { title: 'सामान्य ज्ञान (दर्शन एवं उपनिषद)', faculty: 'डॉ. त्रिपाठी', lessons: 30, duration: '15 घंटे', tag: 'GK', img: 'assets/images/course3.jpg' }
  ];

  container.innerHTML = `
    <div class="page-container page-enter">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-lg)">
        <h2 style="font-size:var(--fs-2xl);color:var(--text-primary);font-family:var(--font-hindi)">आचार्य कक्षाएँ</h2>
        <span class="badge" style="background:var(--maroon-deep);color:white">SuperCoaching</span>
      </div>

      ${Components.sectionTitle('लाइव एवं आगामी कक्षाएँ', '<span class="pulsing-dot" style="color:var(--red-light)">● Live</span>')}
      
      <div class="horizontal-scroll" style="margin-bottom:var(--space-xl)">
        ${liveClasses.map(c => `
          <div class="glass-card class-card ${c.time === 'LIVE NOW' ? 'live' : ''}" onclick="Router.navigate('course', {title: '${c.title}'})" style="cursor:pointer">
            <div class="class-thumbnail" style="background:linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%);height:120px;border-radius:var(--radius-md);margin-bottom:var(--space-sm);position:relative;display:flex;align-items:center;justify-content:center">
              <div style="font-size:40px;opacity:0.5">▶️</div>
              <span class="badge" style="position:absolute;top:8px;left:8px;background:${c.time === 'LIVE NOW' ? 'var(--red)' : 'var(--blue)'};color:white">${c.time}</span>
              ${c.viewers ? `<span class="badge" style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);color:white">👁️ ${c.viewers}</span>` : ''}
            </div>
            <div class="badge badge-gold" style="margin-bottom:4px;display:inline-block">${c.tag}</div>
            <h4 style="font-size:var(--fs-md);margin-bottom:4px;line-height:1.3">${c.title}</h4>
            <div style="color:var(--text-secondary);font-size:var(--fs-sm);display:flex;align-items:center;gap:4px">
              <span>👨‍🏫</span> ${c.faculty}
            </div>
            <button class="btn ${c.time === 'LIVE NOW' ? 'btn-primary' : 'btn-outline'}" style="width:100%;margin-top:var(--space-md);padding:8px">
              ${c.time === 'LIVE NOW' ? 'अभी जुड़ें' : 'अनुस्मारक सेट करें'}
            </button>
          </div>
        `).join('')}
      </div>

      ${Components.sectionTitle('संपूर्ण वीडियो कोर्स')}
      
      <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-md);padding-bottom:var(--space-2xl)">
        ${recordedCourses.map(course => `
          <div class="glass-card course-list-card" style="display:flex;gap:var(--space-md);padding:var(--space-sm);cursor:pointer" onclick="Router.navigate('course', {title: '${course.title}'})">
            <div style="width:100px;height:100px;border-radius:var(--radius-md);background:var(--bg-elevated);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:32px">
               📚
            </div>
            <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
              <div class="badge badge-gold" style="align-self:flex-start;margin-bottom:4px">${course.tag}</div>
              <h4 style="font-size:var(--fs-md);margin-bottom:4px;line-height:1.3">${course.title}</h4>
              <div style="color:var(--text-secondary);font-size:var(--fs-xs);margin-bottom:8px">
                👨‍🏫 ${course.faculty} · ⏱️ ${course.duration}
              </div>
              <div style="font-size:var(--fs-xs);color:var(--text-muted)">${course.lessons} वीडियो पाठ</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
