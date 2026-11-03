# SOLACE API reference

This page documents the Python FastAPI service in `backend/main.py`. Its local base URL is `http://127.0.0.1:8001`. The Netlify Function in `appdeploy-solace/` supports a smaller API subset described under [Netlify API differences](#netlify-api-differences).

The Python service parses and analyzes the supplied string; it does not make network requests to the URL's host.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/health` | Service and model readiness |
| `POST` | `/api/v1/scans` | Analyze and save a URL scan |
| `GET` | `/api/v1/scans?limit=100` | List recent scans; `limit` is clamped to 1–500 |
| `DELETE` | `/api/v1/scans` | Delete all saved scans |
| `POST` | `/api/v1/reports` | Analyze and save a community report with category and notes |
| `GET` | `/api/v1/analytics/summary` | Aggregate scan counts by verdict |
| `GET` | `/api/v1/model` | Model metadata, training source, metrics, and feature importance |
| `POST` | `/api/v1/model/retrain` | Retrain from `data/labeled_urls.csv` |

The endpoints that delete scan history or retrain the model do not have authentication in this implementation. Do not make this service publicly reachable without adding access controls.

## Analyze a URL

Request:

```http
POST /api/v1/scans
Content-Type: application/json
```

```json
{"url":"https://example.org/path?source=demo"}
```

`url` must be a non-empty string of at most 2,048 characters. If a scheme is omitted, SOLACE prefixes `https://`. Only `http` and `https` schemes are accepted. Whitespace, control characters, malformed hosts, and invalid ports are rejected.

Successful responses include:

| Field | Meaning |
|---|---|
| `id` | SQLite scan row ID |
| `rawUrl` | Normalized URL string used for analysis |
| `protocol`, `subdomain`, `rootDomain`, `tld`, `pathAndQuery` | Parsed URL parts; domain labels are split heuristically |
| `hasIpAddress`, `hasAtSymbol`, `hasHighRiskTld`, `isShortener` | Structural indicators |
| `finalRiskScore` | Random Forest phishing-class probability, rounded to 0–100 |
| `verdict` | Threshold label: `SAFE`, `SUSPICIOUS`, or `PHISHING` |
| `confidence` | Maximum class probability, formatted as a percentage |
| `latencyMs` | Measured analysis time in milliseconds (minimum reported value: 1) |
| `triggers` | Model notice and URL-structure observations |
| `featuresList` | The 14 model input values and descriptions |
| `model`, `createdAt` | Model source and UTC timestamp |

Example response excerpt (`featuresList` is omitted here; the API returns an array of 14 feature objects):

```json
{
  "id": 1,
  "rawUrl": "https://example.org/path?source=demo",
  "protocol": "https",
  "finalRiskScore": 12,
  "verdict": "SAFE",
  "confidence": "88.0% model confidence",
  "latencyMs": 2,
  "triggers": ["The trained Random Forest classifier assigned a lower phishing probability; this is not a safety guarantee."],
  "model": {"name": "Random Forest", "source": "synthetic starter dataset"},
  "createdAt": "2026-01-01T00:00:00+00:00"
}
```

Scores and example timestamps are illustrative. Actual results depend on the model artifact and runtime.

Invalid input returns HTTP `422` with a FastAPI `detail` message. Unexpected failures return the framework's error response.

## List, report, and analytics

`GET /api/v1/scans?limit=100` returns:

```json
{"items":[{"id":1,"url":"https://example.org/","category":"Live Scanner","riskScore":12,"verdict":"SAFE","notes":"","timestamp":"12:00:00","createdAt":"2026-01-01T00:00:00+00:00"}],"count":1}
```

`POST /api/v1/reports` accepts the same `url`, plus optional `category` (up to 80 characters) and `notes` (up to 1,000 characters). It returns scan details and saves the entry with the report metadata.

`GET /api/v1/analytics/summary` returns `total_scans`, `phishing`, `suspicious`, and `safe` counts from the SQLite database.

`DELETE /api/v1/scans` returns `{"deleted":true}` after clearing the scan table. This affects every scan in that database.

## Model information and retraining

`GET /api/v1/model` returns model name, training source and row count, held-out metrics, feature count, and ranked feature importances. Metrics from synthetic starter data are not evidence of real-world accuracy.

`POST /api/v1/model/retrain` reads `data/labeled_urls.csv`. The CSV must include `url,label` columns, where label `1` means phishing and `0` means legitimate. At least 100 valid rows and both classes are required. The resulting artifact is written to `backend/phishguard_model.joblib` and used by the running process.

## Netlify API differences

`appdeploy-solace/netlify/functions/api.ts` exposes same-origin routes for health, model metadata, scans, and reports. Scanning is stateless on the function: `GET /api/v1/scans` returns an empty list. The browser client saves recent results in its own `localStorage` (up to 200 items) and computes its dashboard summary from that local history. The function does not provide the Python API's SQLite history, aggregate endpoint, delete endpoint, or retraining endpoint.

The Netlify function returns an `error` field for input failures; the Python FastAPI service uses `detail` for validation errors.
