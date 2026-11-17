/* ============================================================
   SOLACE — solace.js
   Shared API client, Chart.js helpers, navigation, utilities
   ============================================================ */

(() => {
  'use strict';

  // Opening the HTML files directly gives the page an opaque `null` origin,
  // which the API correctly rejects. Use the local frontend server instead.
  if (window.location.protocol === 'file:') {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const destination = new URL(`/${page}${window.location.search}${window.location.hash}`, 'http://127.0.0.1:8000');
    window.location.replace(destination.href);
    return;
  }

  // ── Config ───────────────────────────────────────────────────
  const API = {
    health: '/api/v1/health',
    scan: '/api/v1/scans',
    scans: '/api/v1/scans',
    report: '/api/v1/reports',
    model: '/api/v1/model',
  };

  const HISTORY_KEY = 'solace.localScanHistory.v1';

  function readLocalHistory() {
    try {
      const value = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeLocalScan(data) {
    const item = {
      id: `local-${crypto.randomUUID()}`,
      url: data.rawUrl,
      category: data.category || 'Live Scanner',
      notes: data.notes || '',
      riskScore: data.finalRiskScore,
      verdict: data.verdict,
      timestamp: new Date().toLocaleTimeString(),
      createdAt: data.createdAt,
    };
    try {
      const history = [item, ...readLocalHistory()].slice(0, 200);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // A private or full browser storage area must not prevent a scan result.
    }
  }

  function summarize(items) {
    return items.reduce((summary, item) => {
      summary.total_scans += 1;
      if (item.verdict === 'PHISHING') summary.phishing += 1;
      else if (item.verdict === 'SUSPICIOUS') summary.suspicious += 1;
      else summary.safe += 1;
      return summary;
    }, { total_scans: 0, phishing: 0, suspicious: 0, safe: 0 });
  }

  async function request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...options.headers,
      },
    });
    let data = {};
    try {
      data = await response.json();
    } catch {
      // Keep the HTTP status as the useful error if the server returned no JSON.
    }
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status}).`);
    }
    return data;
  }

  const api = {
    health: async () => request(API.health),
    scan: async (url) => {
      const data = await request(API.scan, { method: 'POST', body: JSON.stringify({ url }) });
      writeLocalScan(data);
      return data;
    },
    scans: async (limit = 100) => {
      const query = new URLSearchParams({ limit: String(limit) });
      const data = await request(`${API.scans}?${query}`);
      const items = [...readLocalHistory(), ...(data.items || [])]
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, limit);
      return { items, count: items.length };
    },
    clear: async () => {
      window.localStorage.removeItem(HISTORY_KEY);
      return { deleted: true };
    },
    report: async (data) => {
      const result = await request(API.report, { method: 'POST', body: JSON.stringify(data) });
      writeLocalScan(result);
      return result;
    },
    model: async () => request(API.model),
    summary: async () => summarize((await api.scans(500)).items),
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

  // ── Interactive software engineering toolchain ─────────────
  function initToolchain() {
    const explorer = document.querySelector('[data-toolchain]');
    if (!explorer) return;

    const tools = {
      github: {
        category: 'Source & collaboration', title: 'GitHub', status: 'PROJECT SOURCE', color: '#a78bfa', glow: 'rgba(167,139,250,.17)',
        summary: 'The public repository holds the two app implementations, service code, deployment files, and project documentation.',
        evidence: 'Python frontend and FastAPI backend sit alongside the separate Netlify app, its function, and bundled model. The README explains how the two versions differ.',
        artifact: 'frontend/ · backend/ · appdeploy-solace/ · docs/',
        href: 'https://github.com/zeuus610-max/solace', link: 'Open GitHub work',
      },
      netlify: {
        category: 'Build & hosting', title: 'Netlify', status: 'LIVE · ACTIVE', color: '#35d4c3', glow: 'rgba(53,212,195,.17)',
        summary: 'The public SOLACE site is built from appdeploy-solace and served from Netlify.',
        evidence: 'The Netlify build copies the four app pages, styles, assets, and JavaScript into dist. A same-origin Netlify Function handles scan requests; recent scan history stays in each visitor’s browser.',
        artifact: 'appdeploy-solace/netlify.toml · build.mjs · netlify/functions/api.ts',
        href: null, link: '',
      },
      jira: {
        category: 'Planning & tracking', title: 'Jira', status: 'TEAM BACKLOG', color: '#579dff', glow: 'rgba(87,157,255,.17)',
        summary: 'The team backlog gives project work a place to be tracked and reviewed.',
        evidence: 'The supplied Jira reference opens issue SCRUM-22 in the team backlog. This page links to that record as planning evidence; it does not read Jira status live.',
        artifact: 'SCRUM-22 · team backlog',
        href: 'https://zeuus610.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog?selectedIssue=SCRUM-22&atlOrigin=eyJpIjoiM2JjZjY2YzE2NWUwNDJlNjkzNDE5Zjc5Zjg1ODdkNDAiLCJwIjoiaiJ9', link: 'Open Jira work',
      },
      confluence: {
        category: 'Knowledge & architecture', title: 'Confluence', status: 'TEAM WALKTHROUGH', color: '#62a8ff', glow: 'rgba(98,168,255,.17)',
        summary: 'The backend walkthrough documents how the Python service is organized and how a URL scan moves through it.',
        evidence: 'The repository also keeps architecture, API, deployment, and scoring notes, which make the implementation easier to trace alongside the team walkthrough.',
        artifact: 'SOLACE Backend Python Code Walkthrough',
        href: 'https://zeuus610.atlassian.net/wiki/spaces/SD/pages/131074/SOLACE+Backend+Python+Code+Walkthrough', link: 'Open Confluence work',
      },
      figma: {
        category: 'Product design', title: 'Figma', status: 'DESIGN FILE', color: '#f078b4', glow: 'rgba(240,120,180,.17)',
        summary: 'The PhishGuard design file is the visual reference for the SOLACE interface and its component language.',
        evidence: 'The checked-in design specification defines the dark surfaces, orange accent, typography, verdict gauge, URL chips, and chart treatments used across the application.',
        artifact: 'docs/FIGMA_DESIGN_SYSTEM.md · dark theme · orange accent',
        href: 'https://www.figma.com/design/htcTe24SyDBTiC0z6hhfXF/PhishGuard?node-id=0-1&p=f&t=4wZqe38dkw2RA3lk-0', link: 'Open Figma work',
      },
      docker: {
        category: 'Local development', title: 'Docker', status: 'COMPOSE CONFIGURED', color: '#54b6ff', glow: 'rgba(84,182,255,.17)',
        summary: 'Docker Compose runs the updated SOLACE site and its Python scanning API as separate local containers.',
        evidence: 'The Nginx site serves the built pages and assets, then forwards /api requests to the API container. Compose waits for API health and keeps SQLite data in a named volume.',
        artifact: 'appdeploy-solace/compose.yaml · Dockerfile · nginx.conf · Dockerfile.backend',
        href: 'https://github.com/zeuus610-max/solace/blob/master/appdeploy-solace/compose.yaml', link: 'Open Docker work',
      },
      kubernetes: {
        category: 'Container orchestration', title: 'Kubernetes', status: 'LOCAL CLUSTER READY', color: '#8c82ff', glow: 'rgba(140,130,255,.18)',
        summary: 'The SOLACE site and scanning API run as separate workloads in the local Docker Desktop Kubernetes cluster.',
        evidence: 'The solace-local namespace has site and API Deployments, health probes, ClusterIP and NodePort Services, and a persistent volume claim for SQLite scan history.',
        artifact: 'appdeploy-solace/k8s/local.yaml · namespace solace-local · 1 GiB data volume',
        href: 'https://github.com/zeuus610-max/solace/blob/master/appdeploy-solace/k8s/local.yaml', link: 'Open Kubernetes work',
      },
      actions: {
        category: 'Continuous integration', title: 'GitHub Actions', status: 'CI WORKFLOW', color: '#79dda4', glow: 'rgba(121,221,164,.16)',
        summary: 'A workflow checks the Python implementation and validates the container and Kubernetes setup on pushes and pull requests.',
        evidence: 'The workflow compiles the API, runs a model and 14-feature smoke check, builds both Docker images, and dry-run validates the Kubernetes manifests. It does not publish a deployment.',
        artifact: '.github/workflows/ci.yml',
        href: 'https://github.com/zeuus610-max/solace/blob/master/.github/workflows/ci.yml', link: 'Open Actions work',
      },
    };

    const fields = {
      category: explorer.querySelector('[data-tool-category]'),
      step: explorer.querySelector('[data-tool-step]'),
      title: explorer.querySelector('[data-tool-title]'),
      summary: explorer.querySelector('[data-tool-summary]'),
      status: explorer.querySelector('[data-tool-status]'),
      evidence: explorer.querySelector('[data-tool-evidence]'),
      artifact: explorer.querySelector('[data-tool-artifact]'),
      link: explorer.querySelector('[data-tool-link]'),
      linkLabel: explorer.querySelector('[data-tool-link-label]'),
    };
    const nodes = [...explorer.querySelectorAll('.se-node[data-tool]')];

    nodes.forEach((node, index) => {
      node.addEventListener('click', () => {
        const item = tools[node.dataset.tool];
        if (!item) return;
        nodes.forEach((entry) => {
          const active = entry === node;
          entry.classList.toggle('is-active', active);
          entry.setAttribute('aria-pressed', String(active));
        });
        fields.category.textContent = item.category;
        fields.step.textContent = `${String(index + 1).padStart(2, '0')} / 08`;
        fields.title.textContent = item.title;
        fields.summary.textContent = item.summary;
        fields.status.textContent = item.status;
        fields.evidence.textContent = item.evidence;
        fields.artifact.textContent = item.artifact;
        fields.linkLabel.textContent = item.link;
        if (item.href) {
          fields.link.href = item.href;
          fields.link.hidden = false;
        } else {
          fields.link.removeAttribute('href');
          fields.link.hidden = true;
        }
        explorer.dataset.activeTool = node.dataset.tool;
        explorer.style.setProperty('--tool-color', item.color);
        explorer.style.setProperty('--tool-glow', item.glow);
      });
    });
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
    initToolchain();
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
