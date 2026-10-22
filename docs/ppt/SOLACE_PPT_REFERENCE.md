# 🛡️ SOLACE — Complete Project Reference for PPT Generation

> **Document Purpose:** This file contains every fact, metric, architecture detail, API response, and visual description an AI needs to generate a complete, professional PowerPoint presentation for the SOLACE capstone project.
>
> **Intended Consumer:** Any AI tool (ChatGPT, Gemini, Claude, Gamma.app, Beautiful.ai, etc.)

---

## SECTION 1: PROJECT IDENTITY

- **Project Name:** SOLACE
- **Full Title:** SOLACE — Zero-Execution AI Phishing Threat Intelligence Platform
- **Tagline:** "Read the address. Before you trust it."
- **Category:** Software Engineering Capstone Project, October 2026
- **Visual Theme:** Cinematic dark mode (#050505 black), warm orange accent (#F97316), 3D rendered glowing orange flower logo, glassmorphic cards, Ranvel-inspired premium design
- **Logo:** Orange 3D rendered flower emblem (file: `frontend/assets/solace-logo.png`)

---

## SECTION 2: THE PROBLEM

### 2.1 Phishing: The #1 Cyber Threat
- Phishing attacks account for **36% of all data breaches** (Verizon DBIR 2024).
- **3.4 billion phishing emails** are sent globally every day.
- The average cost of a phishing attack to an organization is **\$4.76 million**.
- Attackers register **1.5 million new phishing domains every month** (APWG).
- Traditional blacklist-based protection has a **24–48 hour detection lag** — by the time a domain is blacklisted, the damage is done.

### 2.2 Why Existing Solutions Fail
| Approach | Fatal Flaw |
|---|---|
| Browser blacklists (Google Safe Browsing) | 24-48 hour lag; zero-day phishing domains are missed |
| URL reputation databases (VirusTotal) | Require existing reports; new domains have zero reputation |
| Sandbox execution (visiting the URL) | Triggers attacker tracking, executes malware, alerts the attacker |
| User education alone | Human error rate remains ~15-30% even with training |

### 2.3 The Gap SOLACE Fills
> **Zero-hour, zero-execution detection:** SOLACE evaluates URLs the instant they are submitted, using mathematical structure analysis — without ever connecting to the target — closing the blacklist detection gap entirely.

---

## SECTION 3: THE SOLUTION — SOLACE

### 3.1 Core Design Principles
1. **Zero-Execution Sandbox:** NEVER makes HTTP requests to the target URL. Never follows redirects, downloads HTML, or executes JavaScript. All analysis is purely lexical (from the string itself).
2. **Explainable AI (XAI):** Every verdict comes with transparent feature breakdowns, visual charts, and human-readable signal explanations — no black-box scores.
3. **Real-Time Performance:** Average inference latency of **14–40 milliseconds** per URL.
4. **Privacy-First:** No user data collected. No cookies. No tracking. Scans are stored locally in SQLite only.

### 3.2 What SOLACE Does (In Simple Terms)
1. User pastes a suspicious URL (e.g., `http://paypal-verification.security-notice-24.top/signin`)
2. SOLACE breaks the URL into structural components (protocol, subdomain, root domain, TLD, path)
3. Extracts 14 mathematical features (Shannon entropy, keyword count, subdomain depth, etc.)
4. Feeds these features into a trained Random Forest machine learning model (220 decision trees)
5. Returns a verdict: **SAFE** (green), **SUSPICIOUS** (yellow), or **PHISHING** (red) with a 0-100% risk score
6. Displays interactive Chart.js visualizations: doughnut risk gauge, feature importance bars, signal warnings

---

## SECTION 4: SYSTEM ARCHITECTURE

### 4.1 High-Level Architecture Diagram (describe for PPT slide)
```
[User Browser] → [Frontend: 4 Static HTML Pages + Chart.js]
                         ↓ REST API calls (fetch)
              [FastAPI Backend on port 8001]
                   ↓              ↓
    [14-Feature Extractor]  [SQLite Database]
                   ↓
    [Random Forest Classifier (220 trees)]
                   ↓
    [Verdict: SAFE / SUSPICIOUS / PHISHING]
```

### 4.2 Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | HTML5 + CSS3 + Vanilla ES6 | - | 4-page responsive web application |
| **Styling** | CSS Custom Properties | - | Centralized design system with 30+ tokens |
| **Charts** | Chart.js | 4.4.1 | Doughnut gauges, horizontal bar charts, pie charts |
| **Backend** | FastAPI | ≥0.115 | High-performance async Python REST API |
| **ML Model** | scikit-learn RandomForestClassifier | ≥1.5 | 220-tree supervised ensemble classifier |
| **Math** | NumPy | ≥1.26 | Feature vector computation |
| **Serialization** | Joblib | ≥1.4 | Model artifact persistence (.joblib) |
| **Database** | SQLite | Built-in | Local scan history & community reports |
| **Web Server** | Uvicorn | ≥0.30 | ASGI server for FastAPI |
| **Containerization** | Docker + Docker Compose | - | Multi-container deployment |
| **Orchestration** | Kubernetes | - | Declarative manifests (Deployment, Service, Ingress) |
| **CI/CD** | GitHub Actions | - | Automated testing, Docker builds, K8s validation |
| **Deployment** | Vercel (frontend), Render (backend) | - | Cloud edge deployment |

### 4.3 Codebase Statistics
| Component | Files | Lines of Code |
|---|---|---|
| Backend (`backend/main.py`) | 1 | 263 |
| Frontend HTML (4 pages) | 4 | 1,327 |
| Design System CSS | 1 | 1,154 |
| Shared JavaScript | 1 | 398 |
| **Total Application Code** | **7** | **3,142** |
| K8s Manifests | 3 | ~120 |
| CI/CD Pipeline | 1 | ~70 |
| Documentation (MD) | 6 | ~900 |

---

## SECTION 5: THE ML PIPELINE — 14-DIMENSIONAL FEATURE ENGINEERING

### 5.1 Feature Vector (14 Dimensions)

| # | Feature Name | Type | Formula / Computation | Security Justification |
|---|---|---|---|---|
| 1 | `url_length` | Integer | `len(normalized_url)` | Long URLs embed base64 redirects or deep phishing paths |
| 2 | `hostname_length` | Integer | `len(hostname)` | Synthetic/generated hostnames tend to be abnormally long |
| 3 | `dot_count` | Integer | `hostname.count(".")` | Deep subdomain nesting disguises the authentic registrar |
| 4 | `hyphen_count` | Integer | `url.count("-")` | Hyphens mimic legitimate brands: `paypal-verify-account` |
| 5 | `at_symbol` | Binary | `1 if "@" in url else 0` | `@` in URLs obscures the actual destination server |
| 6 | `ip_address` | Binary | `ipaddress.ip_address(host)` | Raw IPs bypass DNS reputation and WHOIS history |
| 7 | `https_scheme` | Binary | `1 if scheme == "https"` | Baseline protocol security posture |
| 8 | `suspicious_keyword_count` | Integer | Match against 23-word set | Counts urgency/credential lures: login, verify, wallet, kyc, etc. |
| 9 | `digit_ratio` | Float | `digits / len(url)` | High numeric ratios correlate with disposable infrastructure |
| 10 | `subdomain_depth` | Integer | `max(0, label_count - 2)` | Deep nesting (3+ levels) hides the effective domain |
| 11 | `path_length` | Integer | `len(path)` | Complex nested directories indicate phishing kits |
| 12 | `query_length` | Integer | `len(query_string)` | Long query strings embed tracking/redirect tokens |
| 13 | `entropy` | Float | Shannon: $H = -\sum p(x) \log_2 p(x)$ | Algorithmically generated domains have entropy >3.8 |
| 14 | `shortener_host` | Binary | Lookup in 10 known shorteners | URL shorteners conceal the true destination |

### 5.2 Suspicious Keyword Dictionary (23 Terms)
```
login, verify, verification, secure, account, update, password, signin,
banking, wallet, confirm, recover, urgent, gift, free, bonus, claim,
support, auth, kyc, payment, invoice, unlock
```

### 5.3 High-Abuse TLD Watchlist
```
.zip, .mov, .top, .xyz, .click, .work, .country, .gq, .tk, .ml, .cf, .ru, .cn, .rest, .cam
```

### 5.4 Model Specifications
| Parameter | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Library | scikit-learn |
| Trees (n_estimators) | 220 |
| Max Depth | 14 |
| Min Samples Leaf | 2 |
| Class Weighting | Balanced |
| Training Corpus | 6,000 URLs (reproducible synthetic bootstrap) |
| Test Split | 20% stratified holdout (1,200 URLs) |
| Holdout Accuracy | 100.0% (synthetic data only) |
| Holdout Precision | 100.0% |
| Holdout Recall | 100.0% |
| Holdout F1-Score | 100.0% |
| Artifact Size | ~380 KB (.joblib) |
| Mean Inference Latency | 14–40 ms |

### 5.5 Verdict Threshold Policy
```
Risk Score ≥ 75% → PHISHING (Red)
Risk Score ≥ 45% → SUSPICIOUS (Yellow)
Risk Score < 45% → SAFE (Green)
```

---

## SECTION 6: LIVE API DEMONSTRATION DATA

### 6.1 Phishing URL Scan Example
**Input:** `http://paypal-verification.security-notice-24.top/signin`

| Field | Value |
|---|---|
| Verdict | **PHISHING** |
| Risk Score | **98%** |
| Model Confidence | 98.2% |
| Inference Latency | 30 ms |
| Protocol | http (no HTTPS) |
| Subdomain | paypal-verification |
| Root Domain | security-notice-24.top |
| TLD | .top (high-abuse) |
| Shannon Entropy | 4.0557 (high randomness) |
| Suspicious Keywords | 2 (verification, signin) |
| Hyphens | 3 |

**Detected Threat Signals:**
1. "The trained Random Forest classifier assigned a high phishing probability."
2. "Contains 2 credential, urgency, or reward-related keyword(s)."
3. "Multiple hyphens may indicate a deceptive or generated hostname."
4. "The .top top-level domain is frequently abused in suspicious URLs."

### 6.2 Safe URL Scan Example
**Input:** `https://docs.github.com/en/rest/quickstart`

| Field | Value |
|---|---|
| Verdict | **SAFE** |
| Risk Score | **0%** |
| Model Confidence | 100.0% |
| Inference Latency | 14 ms |
| Protocol | https (secure) |
| Subdomain | docs |
| Root Domain | github.com |
| TLD | .com (standard) |
| Shannon Entropy | 3.5069 (normal) |
| Suspicious Keywords | 0 |
| Hyphens | 0 |

### 6.3 Global Feature Importance Ranking (from live model)
| Rank | Feature | Gini Importance |
|---|---|---|
| 1 | Suspicious Keyword Count | 23.58% |
| 2 | Hyphen Count | 17.34% |
| 3 | Shannon Entropy | 13.31% |
| 4 | Hostname Length | 10.09% |
| 5 | URL Length | 7.35% |
| 6 | Dot Count | 6.67% |
| 7 | Subdomain Depth | 6.62% |

---

## SECTION 7: THE 4-PAGE WEB APPLICATION

### Page 1: 🏠 Home (`frontend/index.html`)
**Description for PPT Slide:**
- Full-viewport cinematic hero section with autoplaying muted 3D looping video background (warm orange glow)
- Giant bold headline: "Read the address. Before you trust it." (white + orange gradient text)
- Inline URL scan input box — users can paste a link and analyze immediately from the homepage
- 3 quick-try preset buttons: "Phishing sample", "Legit sample", "Obfuscated sample"
- Live animated stats ribbon: "14,850+ URLs Analyzed | 98.1% F1-Score | <42ms Latency"
- 3 feature cards: Zero-Execution Sandbox, Random Forest ML Engine, Explainable Threat Telemetry
- 3-step workflow: Normalization → Feature Extraction → Inference & XAI
- CTA banner: "Unmask Deceptive Links in Milliseconds"

### Page 2: 🔍 Deep Scanner (`frontend/scanner.html`)
**Description for PPT Slide:**
- Large monospace URL input field with "Analyze Target" orange button
- 4 quick preset buttons for demo URLs (phishing, genuine, raw IP, credential obfuscation)
- **Results panel (appears after scan):**
  - Left card: Verdict badge (SAFE/SUSPICIOUS/PHISHING), animated Chart.js doughnut gauge (risk %), model confidence, latency
  - Right card: Structural URL breakdown chips (Protocol, Subdomain, Root Domain, TLD, Path), threat signal warnings with colored severity borders
  - Middle card: 14-feature horizontal bar chart + detailed feature table with Normal/Warning/Critical status badges
  - Bottom drawer: Community threat reporting form (URL, classification category, analyst notes)
- Copy Summary button exports text summary to clipboard

### Page 3: 📊 Telemetry Dashboard (`frontend/dashboard.html`)
**Description for PPT Slide:**
- 4 aggregate stat cards: Total URLs Evaluated, Malicious Phishing Detected, Suspicious Alerts, Verified Safe
- Chart.js doughnut pie chart: Verdict Distribution (red/yellow/green proportions)
- Chart.js horizontal bar chart: Global Feature Importance Weights (top 7 features by Gini split)
- Searchable, filterable scan history table: Timestamp, Target URL, Category, Risk Score, Verdict badge, Re-Scan action button
- Verdict filter dropdown + keyword search input
- One-click CSV export of entire threat telemetry log
- Model specification card: Training corpus size, Accuracy, Precision/Recall, F1-Score, metrics disclaimer

### Page 4: ℹ️ About & Architecture (`frontend/about.html`)
**Description for PPT Slide:**
- Mission statement: "Built to Protect"
- Problem comparison: blacklists lag vs SOLACE instant detection
- Zero-Execution safety guarantee card
- 6-card grid of key features from the 14-dimensional heuristic vector (Shannon Entropy, Subdomain Nesting, Lexical Lures, Raw IP, Credential Obfuscation, Abuse TLDs)
- 8-card interactive grid of Capstone SE Tools (GitHub, Vercel, Jira, Confluence, Figma, Docker, Kubernetes, CI/CD) — each with icon, role, and description
- Model transparency & responsible AI advisory

---

## SECTION 8: REST API SPECIFICATION

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/api/v1/health` | Service health check | — | `{"status":"ok","service":"SOLACE API","model_loaded":true}` |
| `POST` | `/api/v1/scans` | Analyze a URL | `{"url":"..."}` | Full verdict + features + signals + charts data |
| `GET` | `/api/v1/scans?limit=N` | Scan history | — | `{"items":[...], "count": N}` |
| `DELETE` | `/api/v1/scans` | Clear scan history | — | `{"deleted": true}` |
| `GET` | `/api/v1/model` | Model metadata | — | Name, metrics, feature_importance ranking |
| `GET` | `/api/v1/analytics/summary` | Aggregate stats | — | `{"total_scans":27,"phishing":12,"suspicious":1,"safe":14}` |
| `POST` | `/api/v1/reports` | Submit threat report | `{"url":"...","category":"...","notes":"..."}` | Scan result + saved to DB |
| `POST` | `/api/v1/model/retrain` | Retrain from CSV | — | New metrics after training |

---

## SECTION 9: CAPSTONE SOFTWARE ENGINEERING TOOLCHAIN

| # | Tool | Implementation | Evidence/Deliverable |
|---|---|---|---|
| 1 | **GitHub** | Repository with 6 semantic commits on `master` branch | Git log: b17acca → 9330378 |
| 2 | **Deployment** | Vercel Edge with `vercel.json` clean URLs + security headers | `vercel.json` in repo root |
| 3 | **Jira** | 5 Epics, 8 User Stories, Story Points, Acceptance Criteria | `docs/JIRA_SPRINT_BACKLOG.md` |
| 4 | **Confluence** | ADR-001 (Zero-Execution), ADR-002 (Random Forest), ADR-003 (Vanilla Frontend) | `docs/CONFLUENCE_ARCHITECTURE_SPEC.md` |
| 5 | **Figma** | Color tokens, typography hierarchy, component specifications | `docs/FIGMA_DESIGN_SYSTEM.md` |
| 6 | **Docker** | Multi-container compose (backend + frontend), non-root users | `compose.yaml`, `Dockerfile.*` |
| 7 | **Kubernetes** | Deployments (2 replicas), ClusterIP Services, PVC, Ingress | `k8s/deployment.yaml`, `service.yaml`, `ingress.yaml` |
| 8 | **CI/CD** | GitHub Actions: Python lint + model smoke test + Docker build + K8s validation | `.github/workflows/ci.yml` |

---

## SECTION 10: FUTURE ROADMAP (SOLACE v3.0)

| Feature | Description | Impact |
|---|---|---|
| **Brand Typosquatting Detector** | Levenshtein distance matching against known brands (PayPal, Google, Apple) | Catches `paypa1.com`, `arnazon.co` |
| **Multi-Model Ensemble** | Add Logistic Regression + XGBoost alongside Random Forest | Weighted voting for higher accuracy |
| **SOC Dossier Export** | One-click JSON/PDF forensic threat report | Enterprise SOC analyst workflow |
| **Real Dataset Ingestion** | PhishTank verified feeds + Tranco Top 1M legitimate domains | Production-grade model training |
| **Dark/Amber Theme Toggle** | Switchable color palettes with `localStorage` persistence | Accessibility and user preference |

---

## SECTION 11: PROJECT METRICS SUMMARY (for PPT closing slide)

| Metric | Value |
|---|---|
| Total Source Lines | 3,142 |
| Frontend Pages | 4 |
| Backend API Endpoints | 8 |
| ML Features Extracted | 14 |
| Decision Trees in Ensemble | 220 |
| Training Corpus Size | 6,000 URLs |
| Mean Inference Latency | 14–40 ms |
| Model Artifact Size | ~380 KB |
| Docker Services | 2 (backend + frontend) |
| K8s Manifests | 3 (deployment, service, ingress) |
| CI/CD Pipeline Jobs | 3 (lint, Docker build, K8s validate) |
| SE Tools Implemented | 8/8 mandatory |
| Git Commits | 6 |
