# SOLACE

SOLACE is a URL risk analysis capstone project. It examines the URL string locally using structural features and a Random Forest model. It does not open or fetch the submitted URL.

## What is in this repository?

This repository contains two application implementations:

- **Python application:** `frontend/` plus the FastAPI service in `backend/main.py`. The service stores scan records in SQLite.
- **Netlify application:** `appdeploy-solace/`. It includes a Netlify Function and a bundled model. Scan history for this version is kept in the visitor's browser; the function does not persist scan history.

The two implementations share the product design and scoring approach, but their APIs and storage behavior differ. See [Deployment](docs/DEPLOYMENT.md), [API reference](docs/API.md), and [Scoring and limitations](docs/SCORING_AND_LIMITATIONS.md).

## Pages

Both applications provide the Home, Scanner, Dashboard, and About pages. In the Python version, the frontend is served at `http://127.0.0.1:8000/`; the other pages are available at `/scanner.html`, `/dashboard.html`, and `/about.html`.

## Run the Python application locally

Requirements: Python 3.10 or newer.

In one terminal, start the API:

```bash
./start-backend.sh
```

In another terminal, start the static frontend:

```bash
./start-frontend.sh
```

Open <http://127.0.0.1:8000>. The API is at <http://127.0.0.1:8001>; its interactive OpenAPI page is at <http://127.0.0.1:8001/docs>.

The backend script creates `.venv` if needed, installs `requirements.txt`, and starts Uvicorn. It binds to localhost for local development.

## Run with Docker Compose

With Docker available:

```bash
docker compose up --build
```

Open <http://127.0.0.1:8000>. The API is exposed locally on port `8001`; SQLite data is stored in the `phishguard-data` volume. Stop the stack with `Ctrl+C`, then run `docker compose down` if needed.

## Deployments

- The root `vercel.json` serves the static `frontend/` pages. It does **not** deploy the Python API.
- For the bundled Netlify implementation, set the Netlify base directory to `appdeploy-solace`; it builds with `npm run build` and publishes `dist`.
- The Kubernetes manifests are examples for the Python application. Review the API base URL and ingress behavior before using them in a cluster.

See [Deployment](docs/DEPLOYMENT.md) for the limitations and configuration details. Do not expose the Python API publicly without adding authentication and protection for its database-mutating endpoints.

## Team documentation

- [Jira backlog](docs/JIRA_SPRINT_BACKLOG.md)
- [Team workflow and screenshot evidence](docs/TEAM_WORKFLOW.md)
- [Architecture](docs/CONFLUENCE_ARCHITECTURE_SPEC.md)
- [Figma design system](docs/FIGMA_DESIGN_SYSTEM.md)

## Security and model notice

Risk scores are estimates from a starter model trained on synthetic examples. They are not a guarantee that a URL is safe or malicious. The Python API records submitted URLs, including their paths and query strings. Avoid submitting links that contain passwords, session IDs, access tokens, or other private data. Read [Scoring and limitations](docs/SCORING_AND_LIMITATIONS.md) before interpreting results.
