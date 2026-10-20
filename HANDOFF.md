# PhishGuard — AI Handoff Note

> **Last updated by:** Antigravity (Google Gemini)
> **Timestamp:** 2026-10-20T08:48Z
> **Git commit:** `cc7184d` — "Add HANDOFF.md for cross-AI coordination"

---

## Project Summary

PhishGuard is a single-page URL phishing-analysis demo with:

- **Backend:** FastAPI (Python) at `127.0.0.1:8001` — scikit-learn Random Forest model, SQLite scan history, feature extraction from URL structure (never fetches the URL).
- **Frontend:** Static HTML/CSS/JS at `127.0.0.1:8000` — cinematic dark UI, calls the backend API.
- **Docker:** `compose.yaml` with separate backend/frontend containers.

## File Map

| File/Dir | Purpose |
|---|---|
| `backend/main.py` | All backend logic: FastAPI app, model training, feature extraction, DB, API routes |
| `backend/phishguard_model.joblib` | Trained model artifact (gitignored via binary) |
| `backend/phishguard.sqlite3` | Local SQLite scan history (gitignored via binary) |
| `index.html` | Active frontend (single-page app, ~40KB) |
| `index.orbit-dashboard.backup.html` | Original dashboard backup (~130KB, preserved) |
| `requirements.txt` | Python deps: fastapi, uvicorn, scikit-learn, numpy, joblib |
| `compose.yaml` | Docker Compose config (backend + frontend services) |
| `Dockerfile.backend` | Backend container image |
| `Dockerfile.frontend` | Frontend container (python http.server) |
| `start-backend.sh` | Local dev: creates venv, installs deps, runs uvicorn |
| `start-frontend.sh` | Local dev: python http.server on port 8000 |
| `assets/phishguard-logo.png` | Logo image |
| `data/README.md` | Instructions for labeled_urls.csv dataset |
| `README.md` | Project documentation |

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Service + model status |
| POST | `/api/v1/scans` | Analyze a URL `{ "url": "..." }` |
| GET | `/api/v1/scans?limit=200` | Scan history |
| DELETE | `/api/v1/scans` | Clear history |
| GET | `/api/v1/model` | Model metadata + feature importance |
| GET | `/api/v1/analytics/summary` | Aggregate verdict counts |
| POST | `/api/v1/reports` | Community report submission |
| POST | `/api/v1/model/retrain` | Retrain from `data/labeled_urls.csv` |

## What Antigravity Did This Session

1. **Explored the full project structure** — read every source file.
2. **Initialized git** — created `master` branch with initial commit `b17acca` containing all 14 tracked files.
3. **Created this `HANDOFF.md`** — for cross-AI coordination.

No code changes were made to any source file. The project is in its original, working state.

## Frontend Details

- **Report form:** The "Report" nav item opens a form that submits URL, category, and notes to `POST /api/v1/reports`. Reports are stored in local SQLite; this is not a Jira or external-tracker integration.
- **Header logo:** Static PNG at `assets/phishguard-logo.png`.
- **Hero background:** A muted looping video. JavaScript attempts to start and resume it on page load and when the tab regains focus. Safari may block autoplay in Low Power Mode.
- **Docker:** `Dockerfile.backend`, `Dockerfile.frontend`, and `compose.yaml` exist but have **not** been built or run in an environment with Docker installed.

## Current State / Known Issues

- **Not a git remote yet** — repo is local only. Push to GitHub for safer collaboration.
- **Model is synthetic** — trained on generated data, not real phishing URLs. Metrics are not real-world performance.
- **No authentication** — API is open; CORS locked to `127.0.0.1:8000` / `localhost:8000`.
- **No tests** — no test suite exists.
- **Frontend is a single monolithic HTML file** — ~40KB with inline CSS/JS.
- **Backend is a single `main.py`** — ~241 lines, no module splitting.

## What the Next AI Should Do

> ⚠️ **Update this section before starting work. Check the git log for any uncommitted changes first.**

**Pending task:** _(Fill in your next task here, e.g., "Add unit tests", "Split backend into modules", "Improve frontend UI", etc.)_

**Instructions for the next AI:**
1. Run `git status` and `git log --oneline -5` to verify clean state.
2. Create a feature branch: `git checkout -b <feature-name>`.
3. Make changes and commit frequently with descriptive messages.
4. Update this `HANDOFF.md` with:
   - What you changed and which files
   - Any remaining issues or next steps
   - Your last commit hash
5. Commit the updated `HANDOFF.md` last.

---

## Handoff Protocol

```
1. AI-A finishes work → commits → updates HANDOFF.md → commits HANDOFF.md
2. AI-B reads HANDOFF.md → runs git log/status → starts work
3. AI-B finishes → commits → updates HANDOFF.md → commits HANDOFF.md
4. Repeat
```

This avoids conflicts because only one AI edits at a time, and the handoff note carries full context.
