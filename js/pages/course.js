/* ============================================================
   संस्कृत सेतु — Course Dashboard Page
   ============================================================ */

async function renderCoursePage(params) {
  const container = document.getElementById('app-content');
  const courseTitle = params.title || 'UGC NET - सांख्यकारिका';
  
  // Hide bottom nav for an immersive experience
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.style.display = 'none';

  const user = await Store.getUser();
  const hasPass = user?.isPro || false;

  const DEFAULT_CURRICULUM = [
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

  const curriculum = (await Store.getCourses()) || DEFAULT_CURRICULUM;

  window.playCourseVideo = function(videoUrl, title, isFree) {
    if (!isFree && !hasPass) {
      Components.showConfirm('प्रो पास आवश्यक', 'यह पाठ केवल संस्कृत सेतु पास सदस्यों के लिए उपलब्ध है। क्या आप पास खरीदना चाहते हैं?', () => {
        Router.navigate('pass');
      });
      return;
    }
    
    document.getElementById('course-video-frame').src = videoUrl + '?autoplay=1';
    document.getElementById('current-video-title').innerText = title;
  };

  window.toggleCourseAccordion = function(index) {
    const el = document.getElementById('course-module-' + index);
    const content = el.querySelector('.accordion-content');
    if (el.classList.contains('active')) {
      el.classList.remove('active');
      content.style.maxHeight = '0';
    } else {
      el.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  };

  container.innerHTML = `
    <div class="page-container page-enter" style="padding-top:0;padding-bottom:100px;">
      
      <!-- Top Nav -->
      <div style="display:flex;align-items:center;padding:var(--space-md);background:var(--bg-elevated);position:sticky;top:0;z-index:100;border-bottom:1px solid var(--glass-border)">
        <button class="btn btn-ghost" style="padding:0;width:32px;height:32px;margin-right:12px;font-size:24px" onclick="Router.back()">←</button>
        <h2 style="font-size:var(--fs-md);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${courseTitle}</h2>
      </div>

      <!-- Video Player -->
      <div style="width:100%;background:#000;position:relative;padding-bottom:56.25%">
        <iframe id="course-video-frame" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" src="${curriculum[0].lessons[0].video}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>

      <div style="padding:var(--space-md)">
        <h3 id="current-video-title" style="font-size:var(--fs-lg);margin-bottom:8px">${curriculum[0].lessons[0].title}</h3>
        <div style="color:var(--text-secondary);font-size:var(--fs-sm);display:flex;align-items:center;gap:16px;margin-bottom:var(--space-lg)">
          <span>👨‍🏫 आचार्य शर्मा</span>
          <span>👁️ 1.2k Views</span>
        </div>

        <div class="tabs-container" style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-xl);border-bottom:1px solid var(--glass-border);padding-bottom:8px">
          <button style="background:transparent;border:none;color:var(--gold);font-weight:var(--fw-bold);font-size:var(--fs-md);border-bottom:2px solid var(--gold);padding:0 8px 8px">पाठ्यक्रम (Curriculum)</button>
          <button style="background:transparent;border:none;color:var(--text-secondary);font-weight:var(--fw-semi);font-size:var(--fs-md);padding:0 8px 8px">विवरण (Overview)</button>
          <button style="background:transparent;border:none;color:var(--text-secondary);font-weight:var(--fw-semi);font-size:var(--fs-md);padding:0 8px 8px">नोट्स (Notes)</button>
        </div>

        <!-- Curriculum List -->
        <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
          ${curriculum.map((module, mIdx) => `
            <div class="accordion ${mIdx === 0 ? 'active' : ''}" id="course-module-${mIdx}">
              <div class="accordion-header" onclick="toggleCourseAccordion(${mIdx})" style="background:var(--bg-elevated)">
                <div class="accordion-title" style="font-size:var(--fs-sm)">${module.module}</div>
                <div class="accordion-icon">▼</div>
              </div>
              <div class="accordion-content" style="${mIdx === 0 ? 'max-height:500px' : ''}">
                <div class="accordion-content-inner" style="padding:0">
                  ${module.lessons.map((lesson, lIdx) => `
                    <div style="padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--glass-border);cursor:pointer;transition:background 0.2s" onclick="playCourseVideo('${lesson.video}', '${lesson.title}', ${lesson.isFree})" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                      <div style="color:${lesson.isFree || hasPass ? 'var(--gold)' : 'var(--text-muted)'};font-size:20px">
                        ${lesson.isFree || hasPass ? '▶️' : '🔒'}
                      </div>
                      <div style="flex:1">
                        <div style="font-size:var(--fs-sm);font-weight:var(--fw-semi);color:${lesson.isFree || hasPass ? 'var(--text-primary)' : 'var(--text-muted)'}">${lIdx + 1}. ${lesson.title}</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">⏱️ ${lesson.duration} ${lesson.isFree && !hasPass ? '<span style="color:var(--green-light);margin-left:8px;padding:2px 6px;border-radius:4px;border:1px solid var(--green-light)">Free Demo</span>' : ''}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
