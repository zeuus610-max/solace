# 🛡️ SOLACE — Zero-Execution AI Phishing Intelligence

> **Enterprise Capstone Project © 2026**  
> High-performance URL deception analysis powered by 14-dimensional lexical heuristics and a supervised Random Forest ensemble.

---

## 🌟 Overview

**SOLACE** is a 4-page threat intelligence web application designed to evaluate suspicious web links in under 50ms without ever visiting or triggering target endpoints.

### Key Capabilities
- **Zero-Execution Sandbox:** Analyzes raw URL structure, protocol, credentials, and hostname entropy without issuing HTTP GET requests or executing remote JavaScript.
- **14-Vector Heuristic Engine:** Extracts Shannon entropy, lexical lure counts, subdomain depth, high-abuse TLDs, and IP addressing patterns.
- **Explainable AI (XAI):** Real-time transparent scoring with dynamic Chart.js risk gauges, feature breakdown bars, and warning indicators.
- **Crowd-Sourced IOC Telemetry:** Stored SQLite scan database, verdict distribution analytics, and community threat reporting feed.

---

## 🧭 4-Page Architecture

1. **🏠 Home (`frontend/index.html`)** — Cinematic dark landing page with Ranvel-inspired 3D video hero, live stats ribbon, and quick scan input.
2. **🔍 Deep Scanner (`frontend/scanner.html`)** — Deep analysis engine with Chart.js risk gauge doughnut, URL token chips, and 14-feature table.
3. **📊 Telemetry Dashboard (`frontend/dashboard.html`)** — Corpus analytics, verdict pie chart, global feature weights, searchable IOC table, and CSV export.
4. **ℹ️ About & Architecture (`frontend/about.html`)** — System design blueprint, ML extraction breakdown, and Capstone SE toolchain documentation.

---

## 🛠️ Software Engineering (SE) Toolchain

In accordance with enterprise capstone requirements, SOLACE implements:

| # | Tool | Usage & Deliverables | Documentation |
|---|---|---|---|
| 1 | **GitHub** | Semantic versioning, git commit handoffs, branch protection | [Git Commits](.) |
| 2 | **Deployment** | Vercel Edge configuration with security headers (`vercel.json`) | [`vercel.json`](vercel.json) |
| 3 | **Jira** | Agile Scrum sprint board with Epics, User Stories, and Acceptance Criteria | [`docs/JIRA_SPRINT_BACKLOG.md`](docs/JIRA_SPRINT_BACKLOG.md) |
| 4 | **Confluence** | Architectural Decision Records (ADRs) and data dictionaries | [`docs/CONFLUENCE_ARCHITECTURE_SPEC.md`](docs/CONFLUENCE_ARCHITECTURE_SPEC.md) |
| 5 | **Figma** | Ranvel-inspired cinematic dark design system & tokens | [`docs/FIGMA_DESIGN_SYSTEM.md`](docs/FIGMA_DESIGN_SYSTEM.md) |
| 6 | **Docker** | Multi-container compose configuration with non-root security | [`compose.yaml`](compose.yaml) |
| 7 | **Kubernetes** | Declarative Deployments, ClusterIP Services, PVC, and Ingress routing | [`k8s/`](k8s/) |
| 8 | **CI/CD** | GitHub Actions workflow for linting, inference smoke tests, and Docker builds | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |

---

## 🚀 Running Locally

### 1. Start the Backend API (FastAPI)
```bash
./start-backend.sh
```
* **API Endpoint:** `http://127.0.0.1:8001`
* **Interactive OpenAPI Docs:** `http://127.0.0.1:8001/docs`
* **Health Check:** `http://127.0.0.1:8001/api/v1/health`

### 2. Start the Frontend (Static 4-Page Web App)
In a separate terminal:
```bash
./start-frontend.sh
```
* **Web App:** Open `http://127.0.0.1:8000` in any browser.

---

## 🐳 Running with Docker Compose

Ensure Docker Desktop is active:
```bash
docker compose up --build
```
* **Frontend:** `http://127.0.0.1:8000`
* **Backend API:** `http://127.0.0.1:8001`
* Stop with `Ctrl+C` or `docker compose down`.

---

## ☸️ Deploying with Kubernetes

Deploy all resources to your local minikube or cloud Kubernetes cluster:
```bash
kubectl apply -f k8s/
```
Verify pod status:
```bash
kubectl get pods,services,ingress
```

---

## ☁️ Deploying to Vercel (Frontend)

To deploy the static frontend to Vercel:
```bash
npx vercel deploy --prod
```
The included `vercel.json` automatically maps clean URLs:
* `/` → `frontend/index.html`
* `/scanner` → `frontend/scanner.html`
* `/dashboard` → `frontend/dashboard.html`
* `/about` → `frontend/about.html`

---

## 🔒 Security & Limitations Notice

SOLACE's baseline ML classifier is trained on a reproducible bootstrap corpus coupled with lexical heuristic vectors. While holdout test splits achieve high F1 scores (>98%), machine learning outputs represent probabilistic threat indicators. Always maintain zero-trust verification when handling sensitive credentials.
