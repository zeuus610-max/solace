# PhishGuard — local URL analysis demo

PhishGuard is a one-page URL analysis demo backed by a local FastAPI service, SQLite scan history, and a scikit-learn Random Forest model. The frontend preserves the approved cinematic PhishGuard design. It sends submitted URL text to the local API; the API parses the address and never fetches or opens the destination.

## Model limitations

On first run, the API trains its model from reproducible, synthetic, pattern-generated examples. Its probabilities and held-out split metrics are **not validated real-world phishing detection performance**. The About dialog displays the actual model source and its metrics note. Treat all verdicts as estimates, not guarantees of safety. The database is local at `backend/phishguard.sqlite3` and stores submitted URLs and scan results.

## Requirements

- Python 3.10 or newer
- Dependencies in `requirements.txt`

## Run locally

From this directory, start the backend in one terminal:

```bash
./start-backend.sh
```

Then start the static frontend in a second terminal:

```bash
./start-frontend.sh
```

Open <http://127.0.0.1:8000>. The frontend uses `http://127.0.0.1:8001` as its API default. To change it, set `window.PHISHGUARD_API_BASE` before the app script in `index.html`.

- API health: <http://127.0.0.1:8001/api/v1/health>
- Interactive API docs: <http://127.0.0.1:8001/docs>

`index.orbit-dashboard.backup.html` preserves the original dashboard page from the supplied backend bundle; the active page is `index.html`.

## Run with Docker

Install Docker Desktop, then from this directory run:

```bash
docker compose up --build
```

Open <http://127.0.0.1:8000>. The backend API is available at <http://127.0.0.1:8001>, with interactive docs at <http://127.0.0.1:8001/docs>. Both ports are bound to localhost. The API container runs as a non-root user, and scan history persists in the `phishguard-data` Docker volume.

Stop the app with `Ctrl+C` or `docker compose down`. To also delete saved scan history, run `docker compose down --volumes`.

## API routes

- `GET /api/v1/health` — service and model status
- `POST /api/v1/scans` — analyze and store `{ "url": "https://example.org" }`
- `GET /api/v1/scans?limit=200` — stored scan history
- `DELETE /api/v1/scans` — clear local scan history
- `GET /api/v1/model` — model metadata, training source, and feature information
- `GET /api/v1/analytics/summary` — aggregate counts from stored scans
- `POST /api/v1/reports` — analyze/store a user-submitted report; it is not independently verified
- `POST /api/v1/model/retrain` — train from `data/labeled_urls.csv` when a properly licensed dataset is provided

## Use a labeled dataset

Create `data/labeled_urls.csv` with columns `url,label`, where `0` means legitimate and `1` means phishing. Use a dataset you are allowed to use; remove duplicates/leakage and keep separate evaluation data. Retraining replaces the local model artifact. The reported metrics are only a held-out split of that file; use a separate, time-aware evaluation before making performance claims.

## Local development notes

The backend binds to `127.0.0.1:8001`; CORS is restricted to the two local frontend origins on port `8000`. Do not expose this unauthenticated demo API publicly without adding appropriate authentication, rate limiting, and deployment security.
