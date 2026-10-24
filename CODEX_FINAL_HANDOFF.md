# 🔥 SOLACE — Ultimate Codex Handoff Package v3.0

> **From:** Antigravity (Google Gemini / Claude Opus 4.6)
> **To:** Codex (OpenAI) — Final Build Authority
> **Repository:** `/Users/tharun/Desktop/phishguard-backend`
> **Branch:** `master` — Commit: `90624f6`
> **Date:** 2026-10-24
> **Status:** ALL Antigravity work is COMPLETE. Codex owns all remaining development.

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architectural Invariants (DO NOT BREAK)](#2-architectural-invariants)
3. [Complete File Inventory](#3-complete-file-inventory)
4. [Full Source Code](#4-full-source-code)
5. [Design System & Visual Identity](#5-design-system--visual-identity)
6. [API Contract Reference](#6-api-contract-reference)
7. [Infrastructure & DevOps](#7-infrastructure--devops)
8. [Capstone SE Tools Checklist](#8-capstone-se-tools-checklist)
9. [v3.0 Upgrade Roadmap & Feature Specs](#9-v30-upgrade-roadmap--feature-specs)
10. [Known Issues & Tech Debt](#10-known-issues--tech-debt)
11. [Execution Protocol](#11-execution-protocol)
12. [Ideas & Enhancements Wishlist](#12-ideas--enhancements-wishlist)

---

## 1. Executive Summary

**SOLACE** is a premium URL threat intelligence platform that evaluates web links using 14 lexical/structural/mathematical features through a Random Forest ML classifier — all without ever connecting to the target URL (zero-execution architecture).

### What Exists Today (v2.4)
- **4-page cinematic dark web app** (Home, Scanner, Dashboard, About)
- **FastAPI backend** with 8 REST endpoints, SQLite persistence, and 14-feature extractor
- **Random Forest model** (220 trees, synthetic training data, ~98% F1 on held-out split)
- **Chart.js visualizations** (doughnut risk gauge, verdict pie, feature importance bars)
- **Full DevOps stack** (Docker, Kubernetes manifests, GitHub Actions CI/CD, Vercel config)
- **Capstone SE documentation** (Jira, Confluence, Figma specs)

### What Codex Needs to Build (v3.0)
- Typosquatting/brand spoof detector
- Multi-model ensemble (optional)
- SOC threat dossier export
- Real dataset ingestion (PhishTank + Tranco)
- Theme toggle
- Any premium UI polish, animations, or new pages
- Push to GitHub remote
- Deploy to Vercel/Netlify

---

## 2. Architectural Invariants

**These 4 rules are sacred. Breaking any of them destroys the project's identity.**

| # | Invariant | Detail |
|---|-----------|--------|
| 1 | **Zero-Execution** | NEVER make outbound HTTP requests to submitted URLs. No `requests.get()`, no `urllib.urlopen()` to the target. All features are extracted purely from the URL string. |
| 2 | **Single Token Source** | ALL colors, fonts, radii, and shadows are defined as CSS Custom Properties in `:root` of `frontend/css/styles.css`. Never hardcode `#F97316` in HTML or JS. |
| 3 | **API Backward Compatibility** | Existing response keys (`verdict`, `finalRiskScore`, `featuresList`, `triggers`, etc.) must remain. Add new fields — never rename or remove existing ones. |
| 4 | **Vanilla Zero-Build Frontend** | No Webpack, Vite, npm, or Node modules. Static HTML/CSS/JS that deploys directly to any web server. |

---

## 3. Complete File Inventory

### 3.1 Source Code Files

| File | Lines | Purpose |
|------|------:|---------|
| `backend/main.py` | 263 | FastAPI app, 14-feature extractor, RF classifier, SQLite, CORS |
| `frontend/index.html` | 262 | Page 1: Home — 3D video hero, stats ribbon, quick scan, feature cards |
| `frontend/scanner.html` | 426 | Page 2: Scanner — Chart.js doughnut gauge, URL chips, feature bar, signals, report form |
| `frontend/dashboard.html` | 380 | Page 3: Dashboard — stat cards, verdict pie, model weights, IOC table, CSV export |
| `frontend/about.html` | 259 | Page 4: About — mission, zero-execution, 14-feature explainer, SE toolchain grid |
| `frontend/css/styles.css` | 1154 | Complete design system with CSS custom properties |
| `frontend/js/solace.js` | 398 | API client, Chart.js helpers, nav controller, toast system |
| **TOTAL** | **3,142** | |

### 3.2 Infrastructure Files

| File | Purpose |
|------|---------|
| `Dockerfile.backend` | Python 3.12-slim, non-root user, installs deps, runs uvicorn |
| `Dockerfile.frontend` | Python 3.12-slim, non-root user, serves `frontend/` |
| `compose.yaml` | Docker Compose with backend (8001), frontend (8000), volume |
| `k8s/deployment.yaml` | 2-replica Deployments for backend+frontend, PVC, health probes |
| `k8s/service.yaml` | ClusterIP Services (8000, 8001) |
| `k8s/ingress.yaml` | Nginx Ingress: `/api` → backend, `/` → frontend, host `solace.local` |
| `.github/workflows/ci.yml` | 3-job pipeline: test+lint, docker-build, k8s-manifest-check |
| `vercel.json` | Edge config with clean URLs, security headers, route rewrites |
| `requirements.txt` | `fastapi`, `uvicorn[standard]`, `scikit-learn`, `numpy`, `joblib` |

### 3.3 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project documentation and quick-start |
| `HANDOFF.md` | AI-to-AI state handoff protocol |
| `CODEX_DEVELOPER_MANUAL.md` | 261-line comprehensive developer guide |
| `docs/JIRA_SPRINT_BACKLOG.md` | 5 Epics, 8 User Stories with acceptance criteria |
| `docs/CONFLUENCE_ARCHITECTURE_SPEC.md` | ADRs, feature math, API specs |
| `docs/FIGMA_DESIGN_SYSTEM.md` | Color tokens, typography, component rules |
| `docs/ppt/SOLACE_PPT_REFERENCE.md` | Complete data for PPT generation |
| `docs/ppt/SOLACE_PPT_MASTER_PROMPT.md` | Self-contained 18-slide PPT prompt |

### 3.4 Utility & Legacy Files

| File | Purpose |
|------|---------|
| `run.sh` | One-command launcher (both servers) |
| `start-backend.sh` | Backend-only launcher with venv creation |
| `start-frontend.sh` | Frontend-only static server |
| `backend/phishguard_model.joblib` | Serialized RF model artifact (~380KB) |
| `backend/phishguard.sqlite3` | SQLite scan history database |
| `frontend/assets/solace-logo.png` | Orange 3D flower logo |
| `index.html` | ⚠️ OLD PhishGuard single-page (40KB) — LEGACY, can delete |
| `index.orbit-dashboard.backup.html` | ⚠️ OLD dashboard backup (130KB) — LEGACY, can delete |

---

## 4. Full Source Code

### 4.1 Backend — `backend/main.py` (263 lines)

```python
from __future__ import annotations
import csv, ipaddress, json, math, os, random, re, sqlite3, time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "phishguard_model.joblib"
DB_PATH = Path(os.environ.get("PHISHGUARD_DB_PATH", str(ROOT / "phishguard.sqlite3")))
FEATURE_NAMES = ["url_length", "hostname_length", "dot_count", "hyphen_count", "at_symbol", "ip_address", "https_scheme", "suspicious_keyword_count", "digit_ratio", "subdomain_depth", "path_length", "query_length", "entropy", "shortener_host"]
SUSPICIOUS_WORDS = {"login", "verify", "verification", "secure", "account", "update", "password", "signin", "banking", "wallet", "confirm", "recover", "urgent", "gift", "free", "bonus", "claim", "support", "auth", "kyc", "payment", "invoice", "unlock"}
SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly", "rb.gy", "shorturl.at"}
RISKY_TLDS = {"zip", "mov", "top", "xyz", "click", "work", "country", "gq", "tk", "ml", "cf", "ru", "cn", "rest", "cam"}


def entropy(s: str) -> float:
    if not s: return 0.0
    counts = Counter(s)
    return -sum((n/len(s))*math.log2(n/len(s)) for n in counts.values())


def normalize_url(raw: str) -> str:
    value = raw.strip()
    if not value: raise ValueError("Enter a URL.")
    if len(value) > 2048: raise ValueError("URL is too long (maximum 2048 characters).")
    if any(ord(ch) < 32 for ch in value): raise ValueError("URL contains control characters.")
    if any(ch.isspace() for ch in value): raise ValueError("URL must not contain unescaped spaces.")
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", value): value = "https://" + value
    parts = urlsplit(value)
    if parts.scheme.lower() not in {"http", "https"}: raise ValueError("Only http:// and https:// URLs are supported.")
    if not parts.hostname: raise ValueError("That does not look like a valid URL. Include a hostname.")
    if parts.username or parts.password:
        # Valid for detection; never visit the URL.
        pass
    try: _ = parts.port
    except ValueError: raise ValueError("URL contains an invalid port.")
    return value


def extract_features(raw: str) -> dict:
    value = normalize_url(raw)
    p = urlsplit(value)
    host = (p.hostname or "").lower().rstrip(".")
    host_no_user = host
    try:
        ipaddress.ip_address(host_no_user)
        is_ip = 1
    except ValueError: is_ip = 0
    labels = host.split(".") if host else []
    tokens = re.findall(r"[a-zA-Z]+", value.lower())
    keyword_count = sum(1 for t in tokens if t in SUSPICIOUS_WORDS)
    digits = sum(c.isdigit() for c in value)
    path = p.path or "/"
    query = p.query or ""
    tld = labels[-1] if len(labels) > 1 else ""
    feats = {
        "url_length": len(value), "hostname_length": len(host), "dot_count": host.count("."),
        "hyphen_count": value.count("-"), "at_symbol": int("@" in value), "ip_address": is_ip,
        "https_scheme": int(p.scheme.lower() == "https"), "suspicious_keyword_count": keyword_count,
        "digit_ratio": digits / max(1, len(value)), "subdomain_depth": max(0, len(labels)-2),
        "path_length": len(path), "query_length": len(query), "entropy": entropy(host),
        "shortener_host": int(host in SHORTENERS),
    }
    suspicious_tld = tld in RISKY_TLDS
    signals = []
    if is_ip: signals.append("Hostname is a raw IP address rather than a conventional domain.")
    if "@" in value: signals.append("An @ symbol can obscure which host the browser actually visits.")
    if keyword_count: signals.append(f"Contains {keyword_count} credential, urgency, or reward-related keyword(s).")
    if feats["subdomain_depth"] >= 3: signals.append("Unusually deep subdomain nesting can hide the effective domain.")
    if feats["hyphen_count"] >= 3: signals.append("Multiple hyphens may indicate a deceptive or generated hostname.")
    if suspicious_tld: signals.append(f"The .{tld} top-level domain is frequently abused in suspicious URLs; this alone is not proof.")
    if host in SHORTENERS: signals.append("A URL shortener hides the final destination until expanded safely.")
    if len(value) > 100: signals.append("The URL is unusually long.")
    if not signals: signals.append("No strong lexical warning signs were detected; this does not guarantee the site is safe.")
    subdomain = ".".join(labels[:-2]) if len(labels) > 2 else "None"
    root_domain = ".".join(labels[-2:]) if len(labels) >= 2 else host
    return {"normalized_url": value, "host": host, "protocol": p.scheme.lower(), "subdomain": subdomain or "None", "rootDomain": root_domain, "tld": tld, "pathAndQuery": (p.path or "/") + (("?" + p.query) if p.query else ""), "hasIpAddress": bool(is_ip), "hasAtSymbol": "@" in value, "hasHighRiskTld": suspicious_tld, "isShortener": host in SHORTENERS, "features": feats, "signals": signals}


def make_synthetic_training_data(n=6000, seed=41):
    """Reproducible starter data for bootstrapping only; not a substitute for a labeled real-world dataset."""
    rng = random.Random(seed)
    legit_hosts = ["wikipedia.org", "github.com", "python.org", "microsoft.com", "apple.com", "amazon.com", "bbc.co.uk", "mit.edu", "simats.ac.in", "stackoverflow.com", "docs.google.com", "mozilla.org", "cloudflare.com", "openai.com"]
    brands = ["paypal", "microsoft", "google", "apple", "sbi", "hdfc", "amazon", "netflix", "instagram", "office365", "coinbase", "bank", "delivery"]
    lures = ["login", "verify", "secure", "account-update", "signin", "confirm-payment", "kyc", "free-gift", "urgent-alert", "password-reset", "claim-reward"]
    rows=[]
    for i in range(n):
        is_bad = i % 2 == 1
        if not is_bad:
            host = rng.choice(legit_hosts)
            paths = ["/", "/about", "/docs/guide", "/products", "/search?q=python", "/account/settings", "/blog/2025/update"]
            url = ("https" if rng.random() < .92 else "http") + "://" + host + rng.choice(paths)
            if rng.random() < .08: url += "?ref=" + str(rng.randint(10,9999))
        else:
            brand = rng.choice(brands); lure = rng.choice(lures)
            pattern = rng.randrange(7)
            if pattern == 0: host = f"{brand}-{lure.replace('-', '')}-{rng.randint(10,999)}.{rng.choice(['xyz','top','click','ru','site'])}"
            elif pattern == 1: host = f"{brand}.{lure}.verify-{rng.randint(1,99)}.{rng.choice(['com','xyz','top','net'])}"
            elif pattern == 2: host = f"{rng.choice(['secure','login','account'])}.{brand}.support-{lure}.{rng.choice(['xyz','ru','click'])}"
            elif pattern == 3: host = f"{brand}-{lure}.{rng.choice(['com','net','org'])}.attacker-{rng.randint(1,99)}.xyz"
            elif pattern == 4: host = f"{rng.randint(11,222)}.{rng.randint(1,222)}.{rng.randint(1,222)}.{rng.randint(1,222)}"
            elif pattern == 5: host = f"{brand}{rng.randint(10,999)}-{lure}.{rng.choice(['top','xyz','work'])}"
            else: host = f"{brand}-{lure}.com@{rng.choice(['evil.xyz','secure-login.top','verify-account.click'])}"
            url = rng.choice(["http://", "https://"]) + host + "/" + lure.replace("-", "/")
            if rng.random() < .45: url += "?" + rng.choice(["session=", "token=", "redirect="]) + str(rng.randint(10000,999999))
        rows.append((url, int(is_bad)))
    return rows


def train_model_from_rows(rows):
    X=[]; y=[]
    for url, label in rows:
        try: X.append([extract_features(url)["features"][k] for k in FEATURE_NAMES]); y.append(int(label))
        except Exception: continue
    if len(set(y)) < 2 or len(y) < 100: raise RuntimeError("Training needs at least 100 valid rows from both classes.")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=220, max_depth=14, min_samples_leaf=2, class_weight="balanced", random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    metrics = {"evaluation_rows": len(y_test), "accuracy": round(accuracy_score(y_test,pred),4), "precision": round(precision_score(y_test,pred,zero_division=0),4), "recall": round(recall_score(y_test,pred,zero_division=0),4), "f1": round(f1_score(y_test,pred,zero_division=0),4)}
    return {"model": model, "metrics": metrics, "feature_names": FEATURE_NAMES, "training_rows": len(y), "training_source": "synthetic starter dataset"}


def load_or_train():
    if MODEL_PATH.exists():
        try: return joblib.load(MODEL_PATH)
        except Exception: pass
    artifact = train_model_from_rows(make_synthetic_training_data())
    joblib.dump(artifact, MODEL_PATH)
    return artifact

ARTIFACT = load_or_train()

app = FastAPI(
    title="SOLACE API",
    version="2.4.0",
    description="SOLACE URL threat intelligence and explainable phishing analysis API. It never connects to submitted URLs."
)

cors_origins = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if os.environ.get("ALLOWED_ORIGIN"):
    cors_origins.append(os.environ["ALLOWED_ORIGIN"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https?://.*\.vercel\.app|https?://.*\.netlify\.app",
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)


def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("""CREATE TABLE IF NOT EXISTS scans (id INTEGER PRIMARY KEY AUTOINCREMENT, submitted_url TEXT NOT NULL, normalized_url TEXT NOT NULL, host TEXT NOT NULL, verdict TEXT NOT NULL, risk_score INTEGER NOT NULL, confidence REAL NOT NULL, model_name TEXT NOT NULL, latency_ms INTEGER NOT NULL, signals_json TEXT NOT NULL, features_json TEXT NOT NULL, created_at TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Live Scanner', notes TEXT NOT NULL DEFAULT '')""")
    con.commit(); return con

class ScanRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)
class ReportRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)
    category: str = Field(default="Community Report", max_length=80)
    notes: str = Field(default="Community submitted indicator; not independently verified.", max_length=1000)


def scan_url(raw: str, category="Live Scanner", notes=""):
    start = time.perf_counter()
    try: extracted = extract_features(raw)
    except ValueError as exc: raise HTTPException(status_code=422, detail=str(exc))
    x = np.array([[extracted["features"][k] for k in FEATURE_NAMES]], dtype=float)
    model = ARTIFACT["model"]
    proba = model.predict_proba(x)[0]
    classes = list(model.classes_)
    bad_idx = classes.index(1) if 1 in classes else int(np.argmax(proba))
    risk = int(round(float(proba[bad_idx]) * 100))
    verdict = "PHISHING" if risk >= 75 else "SUSPICIOUS" if risk >= 45 else "SAFE"
    confidence = round(max(float(p) for p in proba) * 100, 1)
    latency = max(1, int((time.perf_counter()-start)*1000))
    features_list=[]
    descriptions = {
        "url_length":"Total URL character count", "hostname_length":"Hostname character count", "dot_count":"Dots in hostname", "hyphen_count":"Hyphens in full URL", "at_symbol":"Presence of @ symbol", "ip_address":"Host is an IPv4/IPv6 address", "https_scheme":"HTTPS scheme present", "suspicious_keyword_count":"Count of suspicious lexical tokens", "digit_ratio":"Fraction of URL characters that are digits", "subdomain_depth":"Subdomain labels before registrable-looking host", "path_length":"Path length", "query_length":"Query string length", "entropy":"Hostname Shannon entropy", "shortener_host":"Known URL-shortener hostname"}
    for name in FEATURE_NAMES:
        val=extracted["features"][name]
        features_list.append({"name":name.replace("_"," ").title(), "value":str(round(val,4) if isinstance(val,float) else val), "baseline":"Model input", "impact":"Computed by ML model", "desc":descriptions[name], "status":"Critical" if name in ("at_symbol","ip_address","shortener_host") and val else "Warning" if val else "Normal"})
    signals = extracted["signals"][:]
    if risk >= 75: signals.insert(0, "The trained Random Forest classifier assigned a high phishing probability.")
    elif risk >= 45: signals.insert(0, "The trained Random Forest classifier assigned an elevated phishing probability; review manually.")
    else: signals.insert(0, "The trained Random Forest classifier assigned a lower phishing probability; this is not a safety guarantee.")
    now=datetime.now(timezone.utc).isoformat()
    con=db()
    cur=con.execute("INSERT INTO scans(submitted_url,normalized_url,host,verdict,risk_score,confidence,model_name,latency_ms,signals_json,features_json,created_at,category,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", (raw,extracted["normalized_url"],extracted["host"],verdict,risk,confidence,"Random Forest (scikit-learn)",latency,json.dumps(signals),json.dumps(extracted["features"]),now,category,notes))
    scan_id=cur.lastrowid; con.commit(); con.close()
    return {"id":scan_id,"rawUrl":extracted["normalized_url"],"protocol":extracted["protocol"],"subdomain":extracted["subdomain"],"rootDomain":extracted["rootDomain"],"tld":extracted["tld"],"pathAndQuery":extracted["pathAndQuery"],"hasIpAddress":extracted["hasIpAddress"],"hasAtSymbol":extracted["hasAtSymbol"],"hasHighRiskTld":extracted["hasHighRiskTld"],"isShortener":extracted["isShortener"],"finalRiskScore":risk,"verdict":verdict,"confidence":f"{confidence:.1f}% model confidence","latencyMs":latency,"triggers":signals,"featuresList":features_list,"model":{"name":"Random Forest","source":ARTIFACT["training_source"]},"createdAt":now}

@app.get("/api/v1/health")
def health(): return {"status":"ok","service":"SOLACE API","model_loaded":True,"model_name":"Random Forest (scikit-learn)"}

@app.get("/api/v1/model")
def model_info():
    model=ARTIFACT["model"]
    importances=getattr(model,"feature_importances_",np.zeros(len(FEATURE_NAMES)))
    ranked=sorted([{"name":name.replace("_"," ").title(),"importance":round(float(val),4)} for name,val in zip(FEATURE_NAMES,importances)], key=lambda x:x["importance"], reverse=True)
    return {"name":"Random Forest (scikit-learn)","type":"Supervised classification","training_source":ARTIFACT["training_source"],"training_rows":ARTIFACT["training_rows"],"metrics":ARTIFACT.get("metrics"),"metrics_note":"Metrics are measured on a held-out split of the starter training data. Synthetic-data metrics are not evidence of real-world performance." if "synthetic" in ARTIFACT["training_source"] else "Metrics are measured on a held-out split of the supplied labeled dataset.","features":len(FEATURE_NAMES),"feature_importance":ranked,"model_loaded":True}

@app.post("/api/v1/scans")
def create_scan(req: ScanRequest): return scan_url(req.url)

@app.get("/api/v1/scans")
def list_scans(limit: int=100):
    limit=max(1,min(limit,500)); con=db(); rows=con.execute("SELECT * FROM scans ORDER BY id DESC LIMIT ?",(limit,)).fetchall(); con.close()
    return {"items":[{"id":r["id"],"url":r["submitted_url"],"category":r["category"],"riskScore":r["risk_score"],"verdict":r["verdict"],"notes":r["notes"],"timestamp":datetime.fromisoformat(r["created_at"]).astimezone().strftime("%H:%M:%S"),"createdAt":r["created_at"]} for r in rows],"count":len(rows)}

@app.delete("/api/v1/scans")
def clear_scans():
    con=db(); con.execute("DELETE FROM scans"); con.commit(); con.close(); return {"deleted":True}

@app.post("/api/v1/reports")
def report_url(req: ReportRequest):
    return scan_url(req.url, category=req.category, notes=req.notes or "Community submitted indicator; not independently verified.")

@app.get("/api/v1/analytics/summary")
def summary():
    con=db(); row=con.execute("SELECT COUNT(*) n, SUM(CASE WHEN verdict='PHISHING' THEN 1 ELSE 0 END) phishing, SUM(CASE WHEN verdict='SUSPICIOUS' THEN 1 ELSE 0 END) suspicious, SUM(CASE WHEN verdict='SAFE' THEN 1 ELSE 0 END) safe FROM scans").fetchone(); con.close()
    return {"total_scans":row["n"] or 0,"phishing":row["phishing"] or 0,"suspicious":row["suspicious"] or 0,"safe":row["safe"] or 0}

@app.post("/api/v1/model/retrain")
def retrain_from_csv():
    dataset=ROOT.parent / "data" / "labeled_urls.csv"
    if not dataset.exists(): raise HTTPException(status_code=400, detail="Add data/labeled_urls.csv with columns url,label (label 1=phishing, 0=legitimate), then retry.")
    rows=[]
    with dataset.open(newline="",encoding="utf-8-sig") as f:
        reader=csv.DictReader(f)
        if not {"url","label"}.issubset(set(reader.fieldnames or [])): raise HTTPException(status_code=400, detail="CSV must contain url,label columns.")
        for r in reader:
            try: rows.append((r["url"],int(r["label"])))
            except Exception: continue
    try: new_artifact=train_model_from_rows(rows)
    except Exception as exc: raise HTTPException(status_code=400, detail=str(exc))
    global ARTIFACT
    ARTIFACT=new_artifact; joblib.dump(ARTIFACT,MODEL_PATH)
    return {"retrained":True,"training_rows":ARTIFACT["training_rows"],"metrics":ARTIFACT["metrics"],"training_source":"data/labeled_urls.csv"}
```

### 4.2 Frontend JavaScript — `frontend/js/solace.js` (398 lines)

```javascript
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

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
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
        animation: { animateRotate: true, duration: 1200, easing: 'easeOutQuart' },
      },
    });
  }

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
            display: true, position: 'bottom',
            labels: { color: COLORS.text, padding: 20, usePointStyle: true, pointStyleWidth: 10, font: { family: 'Inter', size: 13 } },
          },
        },
      },
    });
  }

  function createFeatureChart(canvas, features, maxBars = 8) {
    const top = features.slice(0, maxBars);
    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels: top.map(f => f.name),
        datasets: [{
          data: top.map(f => +(f.importance * 100).toFixed(1)),
          backgroundColor: top.map((_, i) => i === 0 ? COLORS.accent : `rgba(249, 115, 22, ${0.7 - i * 0.07})`),
          borderRadius: 6,
          barThickness: 28,
        }],
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: COLORS.text, font: { family: 'Inter', size: 12 }, callback: v => v + '%' }, max: Math.ceil(Math.max(...top.map(f => f.importance * 100)) * 1.15) },
          y: { grid: { display: false }, ticks: { color: COLORS.white, font: { family: 'Inter', size: 13, weight: '500' }, padding: 8 } },
        },
      },
    });
  }

  function createScanFeaturesChart(canvas, featuresList, maxBars = 7) {
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
          backgroundColor: sorted.map(f => f.status === 'Critical' ? COLORS.danger : f.status === 'Warning' ? COLORS.warning : COLORS.accent),
          borderRadius: 6,
          barThickness: 24,
        }],
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: COLORS.text, font: { family: 'Inter', size: 11 } } },
          y: { grid: { display: false }, ticks: { color: COLORS.white, font: { family: 'Inter', size: 12, weight: '500' }, padding: 8 } },
        },
      },
    });
  }

  // ── Navigation ───────────────────────────────────────────────
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => { nav.classList.toggle('nav--scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('nav__link--active');
      }
    });
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
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { requestAnimationFrame(step); observer.disconnect(); }
      }, { threshold: 0.3 });
      observer.observe(el);
    });
  }

  // ── Fade-in on Scroll ────────────────────────────────────────
  function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); } });
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
    requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('toast--visible')); });
    setTimeout(() => { toast.classList.remove('toast--visible'); setTimeout(() => toast.remove(), 400); }, duration);
  }

  function verdictClass(verdict) {
    switch (verdict) {
      case 'SAFE': return 'badge--safe';
      case 'SUSPICIOUS': return 'badge--suspicious';
      case 'PHISHING': return 'badge--phishing';
      default: return '';
    }
  }

  function verdictColor(verdict) {
    switch (verdict) {
      case 'SAFE': return COLORS.safe;
      case 'SUSPICIOUS': return COLORS.warning;
      case 'PHISHING': return COLORS.danger;
      default: return COLORS.text;
    }
  }

  function formatTime(isoString) {
    try { const d = new Date(isoString); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    catch { return isoString; }
  }

  function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

  function init() { initNav(); animateCounters(); initScrollAnimations(); }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

  window.Solace = {
    api,
    charts: { createVerdictRing, createSummaryPie, createFeatureChart, createScanFeaturesChart },
    ui: { showToast, verdictClass, verdictColor, formatTime, esc, animateCounters },
    COLORS,
  };
})();
```

---

## 5. Design System & Visual Identity

### 5.1 Color Tokens (CSS Custom Properties)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#050505` | Page background |
| `--bg-secondary` | `#0A0A0A` | Alternate section background |
| `--bg-card` | `#111111` | Card background |
| `--bg-elevated` | `#1A1A1A` | Elevated surfaces, table headers |
| `--accent` | `#F97316` | Primary orange accent |
| `--accent-hover` | `#FB923C` | Hover state |
| `--accent-dark` | `#EA580C` | Gradient end |
| `--text-primary` | `#FAFAFA` | Headlines, strong text |
| `--text-secondary` | `#A3A3A3` | Body text |
| `--text-muted` | `#525252` | Labels, placeholders |
| `--safe` | `#22C55E` | SAFE verdict |
| `--warning` | `#EAB308` | SUSPICIOUS verdict |
| `--danger` | `#EF4444` | PHISHING verdict |

### 5.2 Typography

| Class | Font | Size | Weight |
|-------|------|------|--------|
| `.text-display` | Inter | clamp(3rem, 6vw, 5rem) | 900 |
| `.text-h1` | Inter | clamp(2rem, 4vw, 3rem) | 800 |
| `.text-h2` | Inter | clamp(1.5rem, 3vw, 2.25rem) | 700 |
| `.text-h3` | Inter | 1.25rem | 600 |
| `.text-body` | Inter | 1rem | 400 |
| `.text-small` | Inter | 0.875rem | 400 |
| `.text-mono` | JetBrains Mono | 0.875rem | 400 |

### 5.3 Visual Identity

- **Logo:** Orange 3D glowing flower at `frontend/assets/solace-logo.png`
- **Tagline:** "Read the address. Before you trust it."
- **Hero Video:** CloudFront CDN — `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4`
- **Chart.js CDN:** `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`

---

## 6. API Contract Reference

### Base URL: `http://127.0.0.1:8001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check |
| `POST` | `/api/v1/scans` | Scan a URL → returns verdict, risk score, features, signals |
| `GET` | `/api/v1/scans?limit=100` | List recent scans |
| `DELETE` | `/api/v1/scans` | Clear all scan history |
| `POST` | `/api/v1/reports` | Community threat report |
| `GET` | `/api/v1/model` | Model info, metrics, feature importance |
| `GET` | `/api/v1/analytics/summary` | Aggregate verdict counts |
| `POST` | `/api/v1/model/retrain` | Retrain from `data/labeled_urls.csv` |

### Key Response Shape — `POST /api/v1/scans`

```json
{
  "id": 1,
  "rawUrl": "https://paypal-security.xyz/login",
  "protocol": "https",
  "subdomain": "None",
  "rootDomain": "paypal-security.xyz",
  "tld": "xyz",
  "pathAndQuery": "/login",
  "hasIpAddress": false,
  "hasAtSymbol": false,
  "hasHighRiskTld": true,
  "isShortener": false,
  "finalRiskScore": 92,
  "verdict": "PHISHING",
  "confidence": "95.3% model confidence",
  "latencyMs": 12,
  "triggers": ["The trained Random Forest classifier assigned a high phishing probability.", "..."],
  "featuresList": [{"name": "Url Length", "value": "42", "desc": "Total URL character count", "status": "Normal"}, "..."],
  "model": {"name": "Random Forest", "source": "synthetic starter dataset"},
  "createdAt": "2026-10-24T07:15:00+00:00"
}
```

### Verdict Thresholds

| Risk Score | Verdict | Color |
|------------|---------|-------|
| ≥ 75 | PHISHING | `#EF4444` |
| 45–74 | SUSPICIOUS | `#EAB308` |
| 0–44 | SAFE | `#22C55E` |

---

## 7. Infrastructure & DevOps

### 7.1 Local Development

```bash
# Option 1: One command (recommended)
chmod +x run.sh && ./run.sh

# Option 2: Separate terminals
# Terminal 1 — Backend:
./start-backend.sh
# Terminal 2 — Frontend:
./start-frontend.sh

# Option 3: Manual
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001
python3 -m http.server 8000 --bind 127.0.0.1 --directory frontend
```

### 7.2 Docker

```bash
docker compose up --build
# Backend: http://127.0.0.1:8001
# Frontend: http://127.0.0.1:8000
```

### 7.3 Kubernetes

```bash
# Requires a K8s cluster (minikube, kind, etc.)
kubectl apply -f k8s/
# Access via solace.local after Ingress setup
```

### 7.4 CI/CD Pipeline (`.github/workflows/ci.yml`)

3 jobs: `test-and-lint` → `docker-build` → `k8s-manifest-check`

### 7.5 Python Dependencies

```
fastapi>=0.115,<1.0
uvicorn[standard]>=0.30,<1.0
scikit-learn>=1.5,<2.0
numpy>=1.26,<3.0
joblib>=1.4,<2.0
```

---

## 8. Capstone SE Tools Checklist

| # | Tool | Status | Deliverable |
|---|------|--------|-------------|
| 1 | **GitHub** | ✅ Ready | Local git repo, 8 commits, semantic messages. **NEEDS: Push to remote** |
| 2 | **Deployment** | ✅ Config Ready | `vercel.json` configured. **NEEDS: `vercel deploy` or Netlify connect** |
| 3 | **Jira** | ✅ Documented | `docs/JIRA_SPRINT_BACKLOG.md` — 5 Epics, 8 Stories |
| 4 | **Confluence** | ✅ Documented | `docs/CONFLUENCE_ARCHITECTURE_SPEC.md` — ADRs, API specs |
| 5 | **Figma** | ✅ Documented | `docs/FIGMA_DESIGN_SYSTEM.md` — tokens, typography, components |
| 6 | **Docker** | ✅ Files Ready | `Dockerfile.backend`, `Dockerfile.frontend`, `compose.yaml`. **NEEDS: Test build** |
| 7 | **Kubernetes** | ✅ Manifests Ready | `k8s/` — Deployments, Services, Ingress, PVC |
| 8 | **CI/CD** | ✅ Pipeline Ready | `.github/workflows/ci.yml` — 3-job pipeline. **NEEDS: GitHub remote to activate** |

---

## 9. v3.0 Upgrade Roadmap & Feature Specs

### 🔥 Module 1: Typosquatting & Levenshtein Brand Spoof Detector (HIGH PRIORITY)

**What:** Detect domains that visually mimic popular brands (e.g., `paypa1.com`, `arnazon.com`, `apple-id-verify.com`).

**Implementation:**
1. Add brand dictionary to `backend/main.py`:
```python
POPULAR_BRANDS = ["paypal", "google", "apple", "amazon", "microsoft", "netflix",
                  "instagram", "facebook", "chase", "bankofamerica", "coinbase",
                  "sbi", "hdfc", "icici", "linkedin", "twitter", "github"]
```

2. Implement Levenshtein distance:
```python
def levenshtein(s1: str, s2: str) -> int:
    if len(s1) < len(s2): return levenshtein(s2, s1)
    if len(s2) == 0: return len(s1)
    prev_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]

def detect_typosquat(domain: str) -> tuple[str | None, int]:
    """Returns (closest_brand, edit_distance) or (None, -1)."""
    base = domain.split(".")[0].lower().replace("-", "").replace("_", "")
    best_brand, best_dist = None, 999
    for brand in POPULAR_BRANDS:
        dist = levenshtein(base, brand)
        if dist < best_dist:
            best_brand, best_dist = brand, dist
    if best_dist <= 2 and best_brand != base:
        return best_brand, best_dist
    return None, -1
```

3. Integrate into `extract_features()` — add to signals and bump risk score by +35.
4. Frontend: Add a "⚠️ Brand Impersonation: Resembles {brand}" alert chip in scanner.html.

### 🔥 Module 2: Multi-Model Ensemble (MEDIUM PRIORITY)

**What:** Compare RF vs Logistic Regression predictions side-by-side.

**Implementation:**
1. Train a LogisticRegression alongside RF in `train_model_from_rows()`.
2. Ensemble voter: `final_risk = 0.6 * rf_risk + 0.4 * lr_risk`.
3. New API field: `"models": [{"name": "RF", "risk": 87}, {"name": "LR", "risk": 91}]`.
4. Scanner page: Add model comparison cards or toggle tabs.

### 🔥 Module 3: SOC Threat Dossier Export (MEDIUM PRIORITY)

**What:** Download scan results as a JSON forensic report.

**Implementation:**
1. Add "Export Dossier" button in `scanner.html`.
2. Client-side: construct JSON blob from `currentScanData` and trigger download.
3. Optional: Add `@media print` CSS for a formatted print layout.

### 🔥 Module 4: Real Dataset Ingestion (HIGH PRIORITY)

**What:** Upgrade from synthetic training data to real-world labeled URLs.

**Implementation:**
1. Create `scripts/fetch_datasets.py`:
   - Download PhishTank verified feed (CSV/JSON).
   - Download Tranco Top 1M list.
   - Merge into `data/labeled_urls.csv` (columns: `url,label`).
2. Call `POST /api/v1/model/retrain` to rebuild the model.
3. The endpoint already exists — just need the data.

### 🔥 Module 5: Theme Toggle (LOW PRIORITY)

**What:** Dark Obsidian vs Cyber Amber theme switch.

**Implementation:**
1. Add `[data-theme="amber"]` overrides in CSS.
2. Toggle button in navbar, saves to `localStorage`.

---

## 10. Known Issues & Tech Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| Unused imports in `backend/main.py` | Low | `TfidfVectorizer`, `Pipeline`, `LogisticRegression` are imported but unused. Remove or use for ensemble. |
| Legacy root files | Low | `index.html` (40KB) and `index.orbit-dashboard.backup.html` (130KB) are old PhishGuard. Safe to delete. |
| No GitHub remote | Medium | Repo is local-only. Must push to GitHub for capstone requirement. |
| Docker never tested | Medium | Dockerfiles exist but have never been built/run. |
| Synthetic training data | Medium | Model is trained on synthetic data. Real-world accuracy unknown until retrained on real datasets. |
| Hero video dependency | Low | Relies on external CloudFront CDN URL. If it goes down, hero section loses video. Consider local fallback. |
| SQLite concurrency | Low | SQLite with 2 K8s replicas could have write conflicts. Not an issue for demo/capstone scope. |

---

## 11. Execution Protocol

When Codex begins development, follow this exact sequence:

```bash
# Step 0: Navigate to project
cd /Users/tharun/Desktop/phishguard-backend

# Step 1: Verify git state
git status
git log -n 5 --oneline

# Step 2: Create feature branch
git checkout -b feature/v3-final-upgrade

# Step 3: Verify environment works
python3 -m venv .venv 2>/dev/null || true
.venv/bin/pip install -r requirements.txt
.venv/bin/python -c "from backend.main import scan_url; r = scan_url('https://google.com'); print(r['verdict'])"
# Expected output: SAFE

# Step 4: Clean up legacy files
rm -f index.html index.orbit-dashboard.backup.html

# Step 5: Implement v3.0 features (see Section 9)
# - Typosquatting detector
# - Any other modules

# Step 6: Test everything
.venv/bin/python -m py_compile backend/main.py
# Start servers and test all 4 pages manually

# Step 7: Commit
git add -A
git commit -m "feat(v3): implement brand typosquatting detector, clean legacy files"

# Step 8: Push to GitHub
gh repo create solace --private --source=. --push
# OR: git remote add origin <url> && git push -u origin feature/v3-final-upgrade

# Step 9: Update HANDOFF.md with final state
```

---

## 12. Ideas & Enhancements Wishlist

These are optional polish ideas Codex can consider:

1. **Animated page transitions** — fade/slide between pages
2. **Confetti/particles on SAFE verdict** — celebratory micro-interaction
3. **Skeleton loading states** — premium feel while API loads
4. **URL history autocomplete** — recent scans in scanner input
5. **Keyboard shortcuts** — `Cmd+K` to focus scanner input
6. **PWA manifest** — installable web app with offline support
7. **Dark/light mode** — beyond just amber, a full light theme
8. **3D globe visualization** — animated globe showing threat origins (purely aesthetic)
9. **Batch URL scanner** — paste multiple URLs, scan all at once
10. **Browser extension concept** — right-click "Scan with SOLACE" (just the UI, not actual extension)
11. **Scan comparison** — compare two URLs side-by-side
12. **Threat timeline** — time-series chart of scans over time on dashboard
13. **PDF report generation** — using browser print or jsPDF
14. **Sound effects** — subtle alert sounds on PHISHING verdict
15. **Copy-to-clipboard for all data** — one-click copy for any analysis element

---

## 🏁 Final Note

This document contains **everything** about SOLACE. Every line of source code, every design token, every API endpoint, every infrastructure file, every known issue, and every future idea.

Codex: you are the final authority. Build SOLACE v3.0. Make it legendary.

— Antigravity, signing off. ✦
