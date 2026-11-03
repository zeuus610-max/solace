# SOLACE deployment guide

This repository contains two deployable versions. Choose one and use its frontend and API together; their data behavior is different.

## Python application: local development

Requires Python 3.10 or newer.

1. Start the backend in a terminal:

   ```bash
   ./start-backend.sh
   ```

2. Start the static frontend in a second terminal:

   ```bash
   ./start-frontend.sh
   ```

3. Open <http://127.0.0.1:8000>. Check API health at <http://127.0.0.1:8001/api/v1/health>.

`start-backend.sh` creates `.venv`, installs `requirements.txt`, then starts Uvicorn. By default, SQLite is stored at `backend/phishguard.sqlite3`; set `PHISHGUARD_DB_PATH` to change that path. A model is loaded from `backend/phishguard_model.joblib` when present, or trained from the bundled synthetic starter data and saved there.

The static frontend defaults to `http://127.0.0.1:8001` for API calls. For another API host, define `window.SOLACE_API_BASE` before `frontend/js/solace.js` loads and allow the frontend origin in the backend CORS configuration. The backend reads one explicit extra origin from `ALLOWED_ORIGIN`; it also currently allows localhost and Vercel/Netlify subdomains through an origin regex.

## Python application: Docker Compose

```bash
docker compose up --build
```

The frontend is served on `127.0.0.1:8000` and the API on `127.0.0.1:8001`. Compose mounts the `phishguard-data` volume at `/data` for SQLite persistence. Stop with `Ctrl+C`; use `docker compose down` to remove the containers while keeping the named data volume.

## Static frontend on Vercel

The root `vercel.json` maps clean page paths to files in `frontend/`. It deploys only static assets; it does not package or host `backend/main.py`. A production site using this frontend therefore needs a separately hosted Python API and a configured `window.SOLACE_API_BASE`.

The repository does not include a production API URL or an automated setting for that value. Configure it in the frontend before deploying and set the API's CORS origin to the exact production site. Do not use `localhost` as the public API base.

## Netlify application

The self-contained Netlify implementation is under `appdeploy-solace/`.

| Netlify setting | Value |
|---|---|
| Base directory | `appdeploy-solace` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` (configured in `netlify.toml`) |

The build copies the four HTML pages, styles, resources, and JavaScript into `dist`. The Netlify Function runs the bundled TypeScript model on the same site origin. No separate `API_BASE` setting is required for this version.

This version has no server-side scan history: its function returns an empty scan list, while the browser stores up to 200 recent results in `localStorage`. Clearing browser data or changing browsers removes that local history. It does not share history between team members.

## Kubernetes manifests

The `k8s/` directory contains sample manifests for the Python backend and static frontend. Review the ingress controller, host name, TLS configuration, API URL used by the frontend, CORS origins, secrets, resource settings, and persistent storage before using them. The sample ingress does not configure TLS, and the frontend's default API base is localhost; the manifests are not a turnkey public deployment.

## Public deployment security

The Python API has no authentication or rate limiting. In particular, any reachable caller could clear the scan database or retrain the model. Scan records include the submitted URL and its query string. Before public exposure, add authentication and rate limiting, restrict CORS to trusted origins, define retention and backup rules, and avoid logging or retaining secrets embedded in URLs.

The Netlify implementation avoids server-side scan persistence, but it also does not offer the Python API's history, delete, or retraining features. Browser-local storage is not a shared or durable data store.
