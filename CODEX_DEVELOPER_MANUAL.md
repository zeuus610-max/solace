# 📘 SOLACE Developer Manual & Architecture Reference
## Complete Technical Blueprint for Codex — Building SOLACE v3.0

> **Target Audience:** Codex & Autonomous AI Pair Programmers  
> **Repository:** `/Users/tharun/Desktop/phishguard-backend`  
> **Current Version:** SOLACE v2.4  
> **Target Version:** SOLACE v3.0 (Next Upgrade)  
> **Date:** October 2026  

---

## 📑 Table of Contents
1. [Executive Overview & Design Invariants](#1-executive-overview--design-invariants)
2. [All-File Resource Inventory & File Breakdown](#2-all-file-resource-inventory--file-breakdown)
3. [Deep Dive: Backend Architecture & Feature Engineering](#3-deep-dive-backend-architecture--feature-engineering)
4. [Deep Dive: Frontend Architecture & Chart.js Visuals](#4-deep-dive-frontend-architecture--chartjs-visuals)
5. [Software Engineering (SE) Toolchain Specifications](#5-software-engineering-se-toolchain-specifications)
6. [Next Upgrade Roadmap (SOLACE v3.0 Feature Specs)](#6-next-upgrade-roadmap-solace-v30-feature-specs)
7. [Step-by-Step Execution Protocol for Codex](#7-step-by-step-execution-protocol-for-codex)

---

## 1. Executive Overview & Design Invariants

### 1.1 What is SOLACE?
**SOLACE** is a high-performance URL threat intelligence platform. It assesses web links using 14 lexical, structural, and mathematical heuristics evaluated by a supervised Random Forest ensemble in <50ms.

### 1.2 Core Architectural Invariants (DO NOT BREAK)
1. **Zero-Execution Rule:** Never make an outbound HTTP GET/POST to the untrusted target URL. We never follow redirects, download HTML, execute JavaScript, or trigger attacker tracking pixels. All features are extracted *purely from the address string* (lexical, entropy, token, and domain structure).
2. **Single Design Token Source:** All colors, radii, shadows, and fonts are defined as CSS Custom Properties in `frontend/css/styles.css`. Never hardcode colors in HTML or JS.
3. **API Contract Compatibility:** The backend routes (`/api/v1/health`, `/api/v1/scans`, `/api/v1/reports`, `/api/v1/model`, `/api/v1/analytics/summary`) must maintain existing response keys so frontend consumers never crash.
4. **Vanilla Zero-Build Frontend:** Keep the frontend free of heavy bundlers (Webpack, Vite, Node modules). Static files must deploy directly to Vercel, Netlify, or standard web servers.

---

## 2. All-File Resource Inventory & File Breakdown

### Root Directory
| File | Language/Format | Purpose | Key Details |
|---|---|---|---|
| `README.md` | Markdown | Primary project documentation | Setup commands, API routes, K8s, Docker, and Capstone matrix. |
| `HANDOFF.md` | Markdown | Active state handoff protocol | Read this first before any code edits; commit updates last. |
| `CODEX_DEVELOPER_MANUAL.md` | Markdown | This document | Comprehensive technical guide for Codex v3.0 development. |
| `compose.yaml` | YAML | Multi-container Docker Compose | Services: `backend` (port 8001), `frontend` (port 8000), volume: `phishguard-data`. |
| `Dockerfile.backend` | Dockerfile | Backend container build | Python 3.12-slim, non-root user `app (10001)`, installs `requirements.txt`. |
| `Dockerfile.frontend` | Dockerfile | Frontend container build | Python 3.12-slim, non-root user `web (10001)`, serves `frontend/` directory. |
| `start-backend.sh` | Shell (sh) | Local backend launcher | Creates `.venv` if missing, installs deps, runs Uvicorn on `127.0.0.1:8001`. |
| `start-frontend.sh` | Shell (sh) | Local frontend launcher | Serves `frontend/` directory with `python3 -m http.server 8000 --bind 127.0.0.1`. |
| `requirements.txt` | Pip deps | Python dependencies | `fastapi`, `uvicorn[standard]`, `scikit-learn`, `numpy`, `joblib`. |
| `vercel.json` | JSON | Vercel Edge deployment config | Clean URL rewrites (`/scanner`, `/dashboard`, `/about`) + security headers. |

### `frontend/` Directory (The 4-Page Web App)
| File | Purpose & Architecture | Functions / Exports |
|---|---|---|
| `frontend/index.html` | **Page 1: Home**<br>Ranvel-style landing page with looping 3D video hero, quick-scan launcher, live stats counters, feature cards, and detection workflow. | `setHeroSample(url)`<br>`handleHeroSubmit(event)` → redirects to `scanner.html?url=...` |
| `frontend/scanner.html` | **Page 2: Deep Scanner**<br>Interactive analysis engine. Shows Chart.js doughnut gauge (Risk vs Safe), structural chips, 14-feature horizontal bar chart, signal warnings, and threat report drawer. | `runAnalysis(url)`<br>`renderScanResults(data)`<br>`handleReportSubmit(e)`<br>`copyAnalysisSummary()` |
| `frontend/dashboard.html` | **Page 3: Threat Dashboard**<br>Corpus telemetry. 4 aggregate stat cards, Chart.js verdict distribution pie, model feature importance bar chart, searchable IOC table, and CSV exporter. | `fetchDashboardData()`<br>`applyFilters()`<br>`exportTableToCSV()`<br>`confirmClearHistory()` |
| `frontend/about.html` | **Page 4: About & Architecture**<br>Mission statement, zero-execution rationale, 14-dimensional heuristic visualizer, and Capstone SE toolchain grid (GitHub, Vercel, Jira, Confluence, Figma, Docker, K8s, CI/CD). | Static responsive layout linking into the shared design system. |
| `frontend/css/styles.css` | **Shared Design System**<br>1000+ lines. Tokens (`--bg-primary`, `--accent`, `--safe`, `--warning`, `--danger`), glassmorphism cards, buttons, responsive breakpoints (<1024px, <768px, <480px). | Centralized tokens, video background styling, chip pills, signal badges, tool grid. |
| `frontend/js/solace.js` | **Shared Core Library**<br>API client, Chart.js constructors, nav scroll watcher, counter animations, toast notification system. | `window.Solace.api.*`<br>`window.Solace.charts.*`<br>`window.Solace.ui.*` |
| `frontend/assets/solace-logo.png` | **Visual Identity Asset**<br>Orange 3D glowing flower emblem. | Displayed across navbars, hero, and footers. |

### `backend/` Directory
| File | Key Components | Endpoints / Exports |
|---|---|---|
| `backend/main.py` | Complete backend service in FastAPI. Includes normalization, 14-feature extractor, synthetic bootstrapper, Random Forest classifier, and SQLite persistence. | `GET /api/v1/health`<br>`POST /api/v1/scans`<br>`GET /api/v1/scans`<br>`DELETE /api/v1/scans`<br>`GET /api/v1/model`<br>`GET /api/v1/analytics/summary`<br>`POST /api/v1/reports`<br>`POST /api/v1/model/retrain` |
| `backend/phishguard_model.joblib` | Persisted model artifact | Scikit-learn dictionary containing `model` (RandomForestClassifier), `metrics`, and `training_source`. |
| `backend/phishguard.sqlite3` | SQLite database | Table `scans` (id, submitted_url, normalized_url, host, verdict, risk_score, confidence, latency_ms, signals_json, features_json, category, notes, created_at). |

### `k8s/` Directory (Kubernetes Orchestration)
| File | K8s Kinds | Description |
|---|---|---|
| `k8s/deployment.yaml` | `Deployment`, `PersistentVolumeClaim` | 2 replicas for backend, 2 replicas for frontend, liveness/readiness probes, PVC for SQLite data. |
| `k8s/service.yaml` | `Service` | ClusterIP service for backend (8001) and frontend (8000). |
| `k8s/ingress.yaml` | `Ingress` | Nginx Ingress routing `/api` to backend and `/` to frontend with host `solace.local`. |

### `.github/workflows/`
| File | Pipeline Jobs | Description |
|---|---|---|
| `ci.yml` | `test-and-lint`, `docker-build`, `k8s-manifest-check` | Automated GitHub Actions CI/CD checking syntax, running ML smoke tests, building Docker containers, and dry-run testing K8s manifests. |

### `docs/` Directory (Capstone SE Documents)
| File | SE Tool | Contents |
|---|---|---|
| `docs/JIRA_SPRINT_BACKLOG.md` | **Jira** | 5 Epics, 8 User Stories, story points, task breakdowns, acceptance criteria. |
| `docs/CONFLUENCE_ARCHITECTURE_SPEC.md` | **Confluence** | Architectural Decision Records (ADR-001, ADR-002, ADR-003), 14-feature math formulas, API specs. |
| `docs/FIGMA_DESIGN_SYSTEM.md` | **Figma** | Color tokens, typography scales, spacing rules, and UI component specifications. |

---

## 3. Deep Dive: Backend Architecture & Feature Engineering

### 3.1 The 14 Extracted Features (`FEATURE_NAMES` in `backend/main.py`)

```python
FEATURE_NAMES = [
    "url_length",                # int: len(normalized_url)
    "hostname_length",           # int: len(host)
    "dot_count",                 # int: host.count(".")
    "hyphen_count",              # int: url.count("-")
    "at_symbol",                 # int (0 or 1): int("@" in url)
    "ip_address",                # int (0 or 1): 1 if host is valid IPv4/IPv6
    "https_scheme",              # int (0 or 1): 1 if scheme == "https"
    "suspicious_keyword_count",  # int: count of matches against SUSPICIOUS_WORDS
    "digit_ratio",               # float: count(digits) / max(1, len(url))
    "subdomain_depth",           # int: max(0, len(labels) - 2)
    "path_length",               # int: len(path)
    "query_length",              # int: len(query)
    "entropy",                   # float: Shannon entropy of host string
    "shortener_host"             # int (0 or 1): 1 if host in SHORTENERS
]
```

### 3.2 Shannon Entropy Calculation
```python
def entropy(s: str) -> float:
    if not s: return 0.0
    counts = Counter(s)
    return -sum((n/len(s)) * math.log2(n/len(s)) for n in counts.values())
```
*Normal genuine domains (e.g. `google.com`)* have entropy between 2.1 and 3.2.  
*Phishing / DGA algorithmically generated domains (e.g. `x7q9k2-secure-login.xyz`)* have entropy > 3.8.

### 3.3 Classification & Threshold Policy
```python
proba = model.predict_proba(x)[0]
risk = int(round(float(proba[bad_idx]) * 100))

# Product policy thresholds:
verdict = "PHISHING" if risk >= 75 else "SUSPICIOUS" if risk >= 45 else "SAFE"
```

---

## 4. Deep Dive: Frontend Architecture & Chart.js Visuals

All Chart.js visualizations are instantiated through helper methods in `frontend/js/solace.js`:

### 4.1 Verdict Ring Gauge
```javascript
window.Solace.charts.createVerdictRing(canvas, riskScore, verdict)
```
- Doughnut chart with `cutout: '78%'`.
- Color dynamically adapts: `#22C55E` (Safe), `#EAB308` (Suspicious), `#EF4444` (Phishing).
- Centered typography renders the numeric score and `RISK SCORE` label.

### 4.2 Summary Pie Chart
```javascript
window.Solace.charts.createSummaryPie(canvas, { safe, suspicious, phishing })
```
- Doughnut chart with `cutout: '65%'` and bottom legend.
- Consumes real-time counts from `GET /api/v1/analytics/summary`.

### 4.3 Feature Importance Bar Chart
```javascript
window.Solace.charts.createFeatureChart(canvas, featuresList, maxBars)
```
- Horizontal bar chart (`indexAxis: 'y'`).
- Renders Gini split weights from `GET /api/v1/model`.

---

## 5. Software Engineering (SE) Toolchain Specifications

Codex should be aware of how the project satisfies capstone evaluation:
1. **GitHub:** Git tracking with semantic commits (`feat`, `docs`, `fix`, `refactor`).
2. **Vercel / Netlify:** Configured via `vercel.json` routing rules with HTTP security headers (`nosniff`, `DENY` frames).
3. **Jira:** 5 Epics tracked in `docs/JIRA_SPRINT_BACKLOG.md`:
   - `SOL-EP1`: Zero-Execution ML Engine
   - `SOL-EP2`: Cinematic UI/UX & Data Visuals
   - `SOL-EP3`: DevOps, Docker & Kubernetes
   - `SOL-EP4`: CI/CD & Cloud Deployment
   - `SOL-EP5`: Security, Governance & Testing
4. **Confluence:** Full technical spec in `docs/CONFLUENCE_ARCHITECTURE_SPEC.md` with ADR-001, ADR-002, ADR-003.
5. **Figma:** Color tokens and typography guidelines in `docs/FIGMA_DESIGN_SYSTEM.md`.
6. **Docker:** `Dockerfile.backend` + `Dockerfile.frontend` + `compose.yaml`.
7. **Kubernetes:** Manifests in `k8s/` (`deployment.yaml`, `service.yaml`, `ingress.yaml`).
8. **CI/CD:** Automated workflow in `.github/workflows/ci.yml`.

---

## 6. Next Upgrade Roadmap (SOLACE v3.0 Feature Specs)

Codex can implement any or all of the following modules for SOLACE v3.0:

### 🌟 Module 3.1: Typosquatting & Levenshtein Brand Spoof Detector
* **Objective:** Detect visual brand imitation such as `paypa1.com`, `arnazon.com`, `apple-id-verify.com`.
* **Implementation Plan:**
  1. Add a brand anchor dictionary: `POPULAR_BRANDS = ["paypal", "google", "apple", "amazon", "microsoft", "netflix", "instagram", "facebook", "chase", "bankofamerica"]`.
  2. Implement Levenshtein edit distance in `backend/main.py`:
     ```python
     def min_brand_distance(domain: str) -> tuple[str, int]:
         # Returns closest brand name and edit distance
     ```
  3. If edit distance is 1 or 2 (and not the exact authentic domain), raise a **Critical Typosquatting Trigger** and increment risk score by +35.
  4. Display a "Brand Impersonation Detected" alert chip in `frontend/scanner.html`.

### 🌟 Module 3.2: Multi-Model Ensemble Voting (XGBoost + Random Forest + Heuristic)
* **Objective:** Allow users on the Scanner and Dashboard to compare predictions across multiple models (like the old prototype, but in the premium Ranvel UI).
* **Implementation Plan:**
  1. Add XGBoost or Logistic Regression alongside Random Forest in `backend/main.py`.
  2. Add an ensemble voter: `final_risk = 0.6 * rf_risk + 0.4 * lr_risk`.
  3. On `frontend/scanner.html`, add a tab toggle: `[ Ensemble v2.4 (Active) | Random Forest | Logistic Regression ]`.
  4. Show comparison cards for model confidence and inference latency.

### 🌟 Module 3.3: One-Click SOC Threat Dossier Export (PDF / JSON)
* **Objective:** Allow security analysts to download a complete forensic PDF or JSON dossier from any scan result.
* **Implementation Plan:**
  1. In `frontend/scanner.html`, add an "Export Threat Dossier" button.
  2. Implement client-side JSON export containing: Target URL, Normalized URL, Verdict, Risk Score, Latency, Timestamp, All 14 Feature Values, and Detected Triggers.
  3. Add a printable `@media print` CSS stylesheet in `frontend/css/styles.css` formatted as an enterprise security report.

### 🌟 Module 3.4: Dataset Ingestion Suite (PhishTank & Tranco Top 1M)
* **Objective:** Transition from synthetic starter data to authenticated real-world datasets.
* **Implementation Plan:**
  1. Create a script `scripts/fetch_datasets.py`.
  2. Fetch verified active phishing links from PhishTank JSON/CSV feed.
  3. Fetch top legitimate domains from Tranco / Cisco Umbrella Top 1M list.
  4. Format as `data/labeled_urls.csv` (`url,label`).
  5. Trigger `POST /api/v1/model/retrain` to serialize an upgraded model artifact.

### 🌟 Module 3.5: Cyber Amber / Dark Mode Palette Toggle
* **Objective:** Add an optional high-contrast theme switch (e.g. "Solace Dark Obsidian" vs "Solace Cyber Amber").
* **Implementation Plan:**
  1. In `frontend/css/styles.css`, define `[data-theme="amber"]` overriding `--accent: #F59E0B; --accent-glow: rgba(245, 158, 11, 0.2);`.
  2. Add a toggle button in `frontend/index.html` navbar saving preference to `localStorage`.

---

## 7. Step-by-Step Execution Protocol for Codex

When Codex begins editing the codebase, follow this strict protocol:

```
Step 1: Check Git Status
  git status
  git log -n 3 --oneline

Step 2: Create a Feature Branch
  git checkout -b feature/v3-upgrade

Step 3: Test Environment First
  .venv/bin/python -c "from backend.main import scan_url; print(scan_url('https://google.com')['verdict'])"

Step 4: Implement Chosen v3.0 Feature
  (Edit backend or frontend following the single-token and zero-execution invariants)

Step 5: Verify & Smoke Test
  .venv/bin/python -m py_compile backend/main.py
  (Check that index.html, scanner.html, dashboard.html, about.html load cleanly)

Step 6: Update Documentation & Handoff
  Update HANDOFF.md with changes made, new commit hash, and remaining tasks.

Step 7: Commit Changes
  git add -A
  git commit -m "feat(v3): describe upgrade changes"
```

---
*Generated by Antigravity for Codex Pair-Programming Collaboration.*
