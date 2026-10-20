# 📋 SOLACE — Jira Project & Sprint Backlog

> **Project Key:** `SOL`  
> **Project Name:** SOLACE Phishing Threat Intelligence Platform  
> **Methodology:** Agile Scrum (2-Week Sprints)  
> **Project Lead:** Capstone Engineering Team  

---

## 🎯 Epics Overview

| Epic Key | Epic Name | Description | Status |
|---|---|---|---|
| `SOL-EP1` | **Zero-Execution ML Engine** | Scikit-learn Random Forest model, 14-feature lexical extractor, SQLite telemetry DB. | Done |
| `SOL-EP2` | **Cinematic UI/UX & Data Visuals** | 4-page Ranvel-inspired frontend (Home, Scanner, Dashboard, About), Chart.js gauges and feature bars. | Done |
| `SOL-EP3` | **DevOps, Docker & Kubernetes** | Containerization, multi-pod K8s deployment manifests, volume persistence, Ingress routing. | Done |
| `SOL-EP4` | **CI/CD & Cloud Deployment** | GitHub Actions automation, Vercel frontend edge deployment, API health checks. | In Progress |
| `SOL-EP5` | **Security, Governance & Testing** | Zero-execution verification, synthetic data evaluation, responsible AI disclosures. | Done |

---

## 🏃 Sprint 1: Zero-Execution Pipeline & Engine

### Story `SOL-101`: 14-Dimensional Lexical Feature Extractor
- **Type:** Story | **Story Points:** 5 | **Priority:** High | **Status:** Closed
- **Description:** As a security engineer, I need to extract structural properties (Shannon entropy, subdomain depth, keyword tokens, IP address, and high-risk TLDs) from submitted URLs without issuing network requests.
- **Acceptance Criteria:**
  - [x] Input URLs normalized with RFC 3986 compliance.
  - [x] Shannon entropy calculated over the hostname.
  - [x] Keyword matches checked against `SUSPICIOUS_WORDS`.
  - [x] Feature extraction executes in < 5ms.

### Story `SOL-102`: Random Forest Model Inference & SQLite Telemetry
- **Type:** Story | **Story Points:** 5 | **Priority:** High | **Status:** Closed
- **Description:** As an analyst, I want a trained 220-tree Random Forest classifier returning risk probability (0–100%) and verdicts (`SAFE`, `SUSPICIOUS`, `PHISHING`), with telemetry saved to SQLite.
- **Acceptance Criteria:**
  - [x] Model loaded from `phishguard_model.joblib` or trained on bootstrap rows.
  - [x] SQLite schema `scans` logs URL, verdict, risk score, confidence, signals, and latency.
  - [x] API endpoint `POST /api/v1/scans` returns structured JSON response.

---

## 🏃 Sprint 2: 4-Page Cinematic Web Interface & Visualizations

### Story `SOL-201`: Home Page with 3D Video Hero & Quick Scanner
- **Type:** Story | **Story Points:** 3 | **Priority:** High | **Status:** Closed
- **Description:** As a user, I want a dark cinematic landing page featuring an animated 3D video hero, live stats ribbon, and an immediate URL scan input.
- **Acceptance Criteria:**
  - [x] Autoplaying muted video hero with warm radial glow overlays.
  - [x] Live stats counters animating on scroll.
  - [x] URL scan box redirects to `scanner.html?url=...` with prefilled target.

### Story `SOL-202`: Interactive Deep Scanner with Chart.js Doughnut Gauge
- **Type:** Story | **Story Points:** 5 | **Priority:** High | **Status:** Closed
- **Description:** As a user, I want to scan any target URL and view an interactive risk gauge doughnut chart, structural domain chips, and feature importance bars.
- **Acceptance Criteria:**
  - [x] Dynamic Chart.js doughnut chart rendering risk percentage vs safe buffer.
  - [x] Subdomain, Root, TLD, and Protocol broken down into styled pill chips.
  - [x] 14-feature horizontal bar chart with status badges (Normal / Warning / Critical).
  - [x] Community threat reporting form submitting to `POST /api/v1/reports`.

### Story `SOL-203`: Live Telemetry Dashboard & Global Model Weights
- **Type:** Story | **Story Points:** 5 | **Priority:** High | **Status:** Closed
- **Description:** As an administrator, I want to see aggregate scan counts, verdict distribution pie charts, global feature weights, and a searchable IOC log with CSV export.
- **Acceptance Criteria:**
  - [x] Live counters for Total, Phishing, Suspicious, and Safe evaluations.
  - [x] Global feature importance chart from `GET /api/v1/model`.
  - [x] Searchable, filterable scan history table with instant "Re-Scan" action.
  - [x] One-click CSV telemetry export.

---

## 🏃 Sprint 3: Containerization, Kubernetes & CI/CD

### Story `SOL-301`: Multi-Stage Docker Containerization
- **Type:** Task | **Story Points:** 3 | **Priority:** Medium | **Status:** Closed
- **Description:** As a DevOps engineer, I want non-root Dockerfiles for both frontend and backend, orchestrated via `compose.yaml`.
- **Acceptance Criteria:**
  - [x] `Dockerfile.backend` runs FastAPI on non-root user `10001`.
  - [x] `Dockerfile.frontend` serves the 4-page static site.
  - [x] Persistent volume mounts SQLite scan database.

### Story `SOL-302`: Kubernetes Declarative Manifests
- **Type:** Task | **Story Points:** 5 | **Priority:** Medium | **Status:** Closed
- **Description:** As a cloud architect, I want K8s manifests defining Deployments, ClusterIP Services, PVCs, and Ingress routing for scalable cluster deployment.
- **Acceptance Criteria:**
  - [x] `k8s/deployment.yaml` with replicas=2, resource limits, and health probes.
  - [x] `k8s/service.yaml` exposing internal cluster ports 8000 and 8001.
  - [x] `k8s/ingress.yaml` routing `/api` to backend and `/` to frontend.

### Story `SOL-303`: GitHub Actions CI/CD Pipeline
- **Type:** Task | **Story Points:** 5 | **Priority:** High | **Status:** Closed
- **Description:** As a release engineer, I want automated CI/CD triggering on push/PR to test model inference, build Docker images, and validate Kubernetes manifests.
- **Acceptance Criteria:**
  - [x] Syntax and py_compile check on `backend/main.py`.
  - [x] Unit test verifying 14-feature extraction and model inference.
  - [x] Docker build execution on both backend and frontend images.
  - [x] K8s dry-run validation using `kubectl apply --dry-run=client`.
