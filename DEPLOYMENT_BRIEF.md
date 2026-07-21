# Canvett — Deployment Brief

Hand this to Claude Code as context before starting the deployment.

---

## What this project is

Canvett is an AI-powered resume ranking system. It is currently a **recruiter-facing** web application: a recruiter creates job postings, uploads candidate CVs, and receives a ranked, explainable list of candidates.

It runs correctly on localhost. It has **never been deployed**. The goal is to get it live.

## Current stack

| Layer | Technology | Location in repo |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS v4 | repo root (`src/`) |
| Backend | Python 3.13 + FastAPI + SQLAlchemy | `backend/` |
| Database | PostgreSQL | local Postgres, database named `canvett` |
| NLP | sentence-transformers (`all-MiniLM-L6-v2`) | `backend/services/` |

The repo root contains the frontend. The backend lives in a `backend/` subdirectory with its own `requirements.txt` and a `venv/` that must **not** be deployed.

## Target deployment architecture

- **Frontend → Vercel** (repo root, Vite build)
- **Backend → Render** (free web service, root directory `backend`)
- **Database → Neon** (free tier serverless Postgres — chosen deliberately because Render's free Postgres expires after 30 days and deletes the data)

---

## Changes required before deployment

Three values are hardcoded to the local machine and will break in production. All three must become environment variables.

### 1. Database connection

**File:** `backend/database/connection.py`

Currently hardcoded to a local Postgres instance using the developer's macOS username, something like:

```python
DATABASE_URL = "postgresql://kayhunter@localhost:5432/canvett"
```

Must read from an environment variable, falling back to the local value for development:

```python
import os
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kayhunter@localhost:5432/canvett")
```

**Note:** Neon connection strings begin with `postgresql://` and require SSL. If SQLAlchemy raises an SSL error, append `?sslmode=require` to the URL.

### 2. CORS origins

**File:** `backend/main.py`

Currently:

```python
allow_origins=["http://localhost:5173"]
```

Must include the deployed Vercel URL. Read from an environment variable so the URL is not committed:

```python
import os
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
```

This is a chicken-and-egg problem: the Vercel URL does not exist until the frontend is deployed. Deploy the backend first with a placeholder, then update the environment variable once the Vercel URL is known, then redeploy the backend.

### 3. Frontend API base URL

**File:** `src/lib/api.js`

Currently:

```javascript
const BASE_URL = "http://localhost:8000"
```

Vite exposes environment variables prefixed with `VITE_`:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
```

Set `VITE_API_URL` in Vercel's environment variables to the Render backend URL. Vite inlines these at **build time**, so the frontend must be rebuilt after changing it.

---

## Render configuration

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

The `--host 0.0.0.0` is required — binding to localhost will make the service unreachable. Render supplies the port via the `$PORT` environment variable.

**Environment variables to set on Render:**
- `DATABASE_URL` — the Neon connection string
- `ALLOWED_ORIGINS` — the Vercel URL (set after the frontend is deployed)

---

## Database initialisation

The Neon database will be **empty**. Tables must be created before the app will work.

The SQLAlchemy models are complete and current — they include every column added during development (`experience_requirement`, `education_requirement`, `duration_verified`, `created_at`, `recruiter_name`, `recruiter_role`). A single `Base.metadata.create_all(bind=engine)` against the Neon database will produce the correct schema.

Models to import before calling `create_all`:
- `database.models_job`
- `database.models_candidate`
- `database.models_activity`
- `database.models_settings`

The `settings` table also needs one default row. The settings router creates it automatically on first access, so no manual seeding is required.

---

## Known constraints and likely failure points

### Memory — the most likely problem

Render's free web service provides **512 MB RAM and 0.1 CPU**. The backend must load PyTorch plus the 90 MB `all-MiniLM-L6-v2` model into that. This may not fit.

`backend/requirements.txt` already specifies the CPU-only PyTorch build via:

```
--extra-index-url https://download.pytorch.org/whl/cpu
```

This is essential — the default PyTorch wheel includes CUDA and is roughly 2 GB, which will exhaust both the build and the memory limit. Do not remove this line.

If the service still runs out of memory, the realistic options are a paid Render tier, or a different host with more free memory.

### Cold starts

Free Render services spin down after 15 minutes of inactivity and take 30–60 seconds to restart. The model reload adds to this. The first request after a quiet period will be slow. This is expected behaviour, not a bug.

### Model download on first boot

`sentence-transformers` downloads the model from Hugging Face on first use. On Render this happens during the first request after each cold start unless the model is pre-downloaded during the build step. Pre-downloading in the build command will make cold starts faster but increases build time.

### Ephemeral filesystem

Render's filesystem does not persist. Uploaded CV files are written to `backend/uploads/` and **will be lost** on every restart or redeploy.

This does not break the application: the parsed `resume_text` is stored in the database, and all scoring and re-ranking operates on that text rather than the original file. Only the original uploaded document is lost. Acceptable for a prototype; worth noting.

### Do not deploy these

- `backend/venv/` — the virtual environment
- `node_modules/`
- `backend/uploads/` — contains test CVs
- Any `.env` files

Confirm `.gitignore` covers these before pushing.

---

## Git remotes

The repository has two remotes:

- `origin` — a university DMS server that intermittently rejects pushes with an object integrity error
- `backup` — GitHub (`github.com/quashiecalvin/canvett`, private), which is reliable

**Deploy from the GitHub remote.** Pushing to `origin` may fail; this is a known server-side issue and is not a problem with the repository.

---

## Recommended order of operations

1. Make the three code changes above, verify the app still runs locally, and commit.
2. Create the Neon project and database. Record the connection string.
3. Run `create_all` against Neon to create the schema.
4. Deploy the backend to Render with `DATABASE_URL` set. Verify `/docs` loads.
5. Deploy the frontend to Vercel with `VITE_API_URL` set to the Render URL.
6. Set `ALLOWED_ORIGINS` on Render to the Vercel URL and redeploy the backend.
7. Test the full flow end to end: create a job, upload a CV, view the ranking.

Step 4 is the one most likely to fail, for the memory reasons above. Verify the backend is genuinely working before moving on to the frontend.
