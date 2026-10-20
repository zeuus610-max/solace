/* ============================================================
   SOLACE — solace.js
   Shared API client, Chart.js helpers, navigation, utilities
   ============================================================ */

(() => {
  'use strict';

  // ── Config ───────────────────────────────────────────────────
  const API_BASE = window.SOLACE_API_BASE || 'http://127.0.0.1:8001';
  const API = {
    health:    () => `${API_BASE}/api/v1/health`,
    scan:      () => `${API_BASE}/api/v1/scans`,
    scans:     (limit = 100) => `${API_BASE}/api/v1/scans?limit=${limit}`,
    clearScans:() => `${API_BASE}/api/v1/scans`,
    report:    () => `${API_BASE}/api/v1/reports`,
    model:     () => `${API_BASE}/api/v1/model`,
    summary:   () => `${API_BASE}/api/v1/analytics/summary`,
  };

  // ── API Client ───────────────────────────────────────────────
  async function apiRequest(url, options = {}) {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      if (e.name === 'TypeError' && e.message.includes('fetch')) {
        throw new Error('Cannot reach the SOLACE API. Is the backend running on port 8001?');
      }
      throw e;
    }
  }

  const api = {
    health:   () => apiRequest(API.health()),
    scan:     (url) => apiRequest(API.scan(), { method: 'POST', body: JSON.stringify({ url }) }),
    scans:    (limit) => apiRequest(API.scans(limit)),
    clear:    () => apiRequest(API.clearScans(), { method: 'DELETE' }),
    report:   (data) => apiRequest(API.report(), { method: 'POST', body: JSON.stringify(data) }),
    model:    () => apiRequest(API.model()),
    summary:  () => apiRequest(API.summary()),
  };

  // ── Chart.js Helpers ─────────────────────────────────────────
  const COLORS = {
    accent:  '#F97316',
    accentLight: '#FB923C',
    safe:    '#22C55E',
    warning: '#EAB308',
    danger:  '#EF4444',
    muted:   '#333333',
    bg:      '#111111',
    text:    '#A3A3A3',
    white:   '#FAFAFA',
  };

  // Default Chart.js options for SOLACE dark theme
  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1A1A1A',
        titleColor: '#FAFAFA',
        bodyColor: '#A3A3A3',
        borderColor: '#333',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
      },
    },
  };

  /**
   * Create a verdict doughnut chart (risk vs remaining)
   * @param {HTMLCanvasElement} canvas
   * @param {number} riskScore 0–100
   * @param {string} verdict SAFE|SUSPICIOUS|PHISHING
   * @returns {Chart}
   */
  function createVerdictRing(canvas, riskScore, verdict) {
    const color = verdict === 'PHISHING' ? COLORS.danger
               : verdict === 'SUSPICIOUS' ? COLORS.warning
               : COLORS.safe;
    const remaining = 100 - riskScore;

    return new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Risk', 'Remaining'],
        datasets: [{
          data: [riskScore, remaining],
          backgroundColor: [color, COLORS.muted],
          borderWidth: 0,
          cutout: '78%',
        }],
      },
      options: {
        ...chartDefaults,
        animation: {
          animateRotate: true,
          duration: 1200,
          easing: 'easeOutQuart',
        },
      },
    });
  }

  /**
   * Create the summary pie chart (safe / suspicious / phishing)
   * @param {HTMLCanvasElement} canvas
   * @param {{ safe: number, suspicious: number, phishing: number }} data
   * @returns {Chart}
   */
  function createSummaryPie(canvas, data) {
    return new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Safe', 'Suspicious', 'Phishing'],
        datasets: [{
          data: [data.safe, data.suspicious, data.phishing],
          backgroundColor: [COLORS.safe, COLORS.warning, COLORS.danger],
          borderWidth: 0,
          cutout: '65%',
        }],
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: COLORS.text,
              padding: 20,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { family: 'Inter', size: 13 },
            },
          },
        },
      },
    });
  }

  /**
   * Create a horizontal bar chart for feature importance
   * @param {HTMLCanvasElement} canvas
   * @param {Array<{name: string, importance: number}>} features
   * @param {number} [maxBars=8]
   * @returns {Chart}
   */
  function createFeatureChart(canvas, features, maxBars = 8) {
    const top = features.slice(0, maxBars);
    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels: top.map(f => f.name),
        datasets: [{
          data: top.map(f => +(f.importance * 100).toFixed(1)),
          backgroundColor: top.map((_, i) =>
            i === 0 ? COLORS.accent : `rgba(249, 115, 22, ${0.7 - i * 0.07})`
          ),
          borderRadius: 6,
          barThickness: 28,
        }],
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { color: COLORS.text, font: { family: 'Inter', size: 12 }, callback: v => v + '%' },
            max: Math.ceil(Math.max(...top.map(f => f.importance * 100)) * 1.15),
          },
          y: {
            grid: { display: false },
            ticks: { color: COLORS.white, font: { family: 'Inter', size: 13, weight: '500' }, padding: 8 },
          },
        },
      },
    });
  }

  /**
   * Create a bar chart for scan feature values
   * @param {HTMLCanvasElement} canvas
   * @param {Array<{name: string, value: string, status: string}>} featuresList
   * @param {number} [maxBars=7]
   * @returns {Chart}
   */
  function createScanFeaturesChart(canvas, featuresList, maxBars = 7) {
    // Sort by absolute numeric value, pick top ones
    const sorted = featuresList
      .map(f => ({ ...f, numVal: parseFloat(f.value) || 0 }))
      .filter(f => f.numVal > 0)
      .sort((a, b) => b.numVal - a.numVal)
      .slice(0, maxBars);

    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels: sorted.map(f => f.name),
        datasets: [{
          data: sorted.map(f => f.numVal),
          backgroundColor: sorted.map(f =>
            f.status === 'Critical' ? COLORS.danger
            : f.status === 'Warning' ? COLORS.warning
            : COLORS.accent
          ),
          borderRadius: 6,
          barThickness: 24,
        }],
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { color: COLORS.text, font: { family: 'Inter', size: 11 } },
          },
          y: {
            grid: { display: false },
            ticks: { color: COLORS.white, font: { family: 'Inter', size: 12, weight: '500' }, padding: 8 },
          },
        },
      },
    });
  }

  // ── Navigation ───────────────────────────────────────────────
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    // Scroll-aware background
    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Active link highlight
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('nav__link--active');
      }
    });

    // Mobile toggle
    const toggle = nav.querySelector('.nav__toggle');
    const links = nav.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('nav__links--open');
        toggle.setAttribute('aria-expanded', links.classList.contains('nav__links--open'));
      });
    }
  }

  // ── Animated Counter ─────────────────────────────────────────
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const duration = 2000;
      let start = null;

      function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = eased * target;
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      // Observe when element enters viewport
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(step);
          observer.disconnect();
        }
      }, { threshold: 0.3 });
      observer.observe(el);
    });
  }

  // ── Fade-in on Scroll ────────────────────────────────────────
  function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // ── Toast Notifications ──────────────────────────────────────
  function showToast(message, type = 'success', duration = 4000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('toast--visible'));
    });

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  // ── Verdict Helpers ──────────────────────────────────────────
  function verdictClass(verdict) {
    switch (verdict) {
      case 'SAFE':       return 'badge--safe';
      case 'SUSPICIOUS': return 'badge--suspicious';
      case 'PHISHING':   return 'badge--phishing';
      default:           return '';
    }
  }

  function verdictColor(verdict) {
    switch (verdict) {
      case 'SAFE':       return COLORS.safe;
      case 'SUSPICIOUS': return COLORS.warning;
      case 'PHISHING':   return COLORS.danger;
      default:           return COLORS.text;
    }
  }

  // ── Time formatter ───────────────────────────────────────────
  function formatTime(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  }

  // ── Escape HTML ──────────────────────────────────────────────
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    initNav();
    animateCounters();
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ───────────────────────────────────────────────
  window.Solace = {
    api,
    charts: { createVerdictRing, createSummaryPie, createFeatureChart, createScanFeaturesChart },
    ui: { showToast, verdictClass, verdictColor, formatTime, esc, animateCounters },
    COLORS,
  };

})();
