/* ============================================================
   संस्कृत सेतु — Utilities
   Helpers for dates, shuffling, chart drawing, formatting
   ============================================================ */

const Utils = {
  // Generate unique ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  // Fisher-Yates shuffle
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Format date to Hindi-friendly string
  formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const months = ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्तू', 'नव', 'दिस'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'अभी';
    if (mins < 60) return `${mins} मिनट पहले`;
    if (hours < 24) return `${hours} घंटे पहले`;
    if (days < 7) return `${days} दिन पहले`;
    return Utils.formatDate(ts);
  },

  // Clamp value
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  // Percentage
  pct(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  },

  // Create SVG progress ring HTML
  progressRing(pct, size = 44, strokeWidth = 4) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    const color = pct >= 80 ? 'var(--green-light)' : pct >= 50 ? 'var(--gold)' : 'var(--red-light)';
    
    return `
      <div class="progress-ring" style="width:${size}px;height:${size}px">
        <svg width="${size}" height="${size}">
          <circle class="ring-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"/>
          <circle class="ring-fill" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"
            stroke="${color}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            style="--circumference:${circumference};--target-offset:${offset}"/>
        </svg>
        <span class="ring-label" style="font-size:${Math.max(10, size/4)}px">${pct}%</span>
      </div>
    `;
  },

  // Draw bar chart on canvas
  drawBarChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const padding = { top: 10, right: 10, bottom: 35, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barWidth = Math.min(30, (chartW / data.length) * 0.6);
    const gap = (chartW - barWidth * data.length) / (data.length + 1);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (chartH * i / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      
      // Y-axis labels
      ctx.fillStyle = 'rgba(184, 168, 138, 0.6)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal * i / 4), padding.left - 6, y + 3);
    }
    
    // Bars
    data.forEach((d, i) => {
      const x = padding.left + gap + i * (barWidth + gap);
      const barH = (d.value / maxVal) * chartH;
      const y = padding.top + chartH - barH;
      
      // Bar gradient
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      const color = d.color || options.color || '#C9A227';
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '66');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();
      
      // Label
      ctx.fillStyle = 'rgba(184, 168, 138, 0.8)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barWidth / 2, h - padding.bottom + 14);
    });
  },

  // Draw line chart on canvas
  drawLineChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const padding = { top: 10, right: 10, bottom: 35, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    
    if (data.length < 2) return;
    
    const maxVal = Math.max(...data.map(d => d.value), 100);
    const stepX = chartW / (data.length - 1);
    
    // Grid
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (chartH * i / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(184, 168, 138, 0.6)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal * i / 4) + '%', padding.left - 6, y + 3);
    }
    
    // Area fill
    const color = options.color || '#C9A227';
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (d.value / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const lastX = padding.left + (data.length - 1) * stepX;
    ctx.lineTo(lastX, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padding.top, 0, h);
    grad.addColorStop(0, color + '30');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Line
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (d.value / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Dots
    data.forEach((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (d.value / maxVal) * chartH;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0f1729';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Label
      ctx.fillStyle = 'rgba(184, 168, 138, 0.8)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x, h - padding.bottom + 14);
    });
  },

  // Draw donut chart
  drawDonutChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 10;
    const innerRadius = radius * 0.65;
    
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let startAngle = -Math.PI / 2;
    
    data.forEach(d => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sliceAngle;
    });
    
    // Center text
    if (options.centerText) {
      ctx.fillStyle = 'var(--text-primary)';
      ctx.font = `bold ${radius * 0.35}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#F3E9D2';
      ctx.fillText(options.centerText, cx, cy);
    }
  },

  // Escape HTML
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Debounce
  debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  // Get initials from name
  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },

  // Hindi numerals
  toHindiNumeral(num) {
    const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(num).replace(/\d/g, d => digits[d]);
  }
};
