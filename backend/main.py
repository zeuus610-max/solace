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
    # Labels are model predictions; the verdict thresholds are product policy, not a provider verdict.
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
