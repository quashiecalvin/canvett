# Canvett — Deployment Record

This document describes how Canvett is deployed. It replaces the original
pre-deployment brief (which targeted Render and predated the live system).

---

## What this project is

Canvett is an AI-powered resume ranking system: a two-sided web application in
which job seekers apply directly to advertised roles and recruiters receive a
ranked, explainable list of candidates. It runs locally for development and is
also **deployed and live**.

## Live architecture

| Layer | Technology | Host |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS v4 | **Vercel** (repo root, Vite build) |
| Backend | Python 3.11 + FastAPI + SQLAlchemy | **Fly.io** (Docker, `backend/`) |
| Database | PostgreSQL | **Neon** (serverless, `eu-central-1` / Frankfurt) |
| NLP | sentence-transformers (`all-MiniLM-L6-v2`) on PyTorch | in the backend image |

The backend runs on Fly.io in the **Frankfurt (`fra`)** region, deliberately
co-located with the Neon database (also Frankfurt) so queries do not cross
regions. One machine (`shared-cpu-1x`, 2 GB RAM) is kept always-on to avoid
cold starts. 2 GB comfortably fits PyTorch plus the MiniLM model, which is why
the project moved off Render's 512 MB free tier.

Live URLs:
- Frontend: `https://canvett.vercel.app`
- Backend: `https://canvett-backend.fly.dev`

---

## Configuration (environment-driven)

Three values that were once hardcoded to the local machine are read from the
environment, each falling back to a local default for development.

- `DATABASE_URL` — `backend/database/connection.py`. Falls back to a local
  Postgres URL. The Neon string requires SSL (`?sslmode=require`).
- `ALLOWED_ORIGINS` — `backend/main.py`. Comma-separated; set to the Vercel URL
  in production, defaults to `http://localhost:5173`.
- `VITE_API_URL` — `src/lib/api.js`. The frontend's API base; Vite inlines it at
  **build time**, so the frontend must be rebuilt after it changes. Set in Vercel.

### Fly.io secrets / env (backend)

- `DATABASE_URL` — the Neon connection string
- `ALLOWED_ORIGINS` — the Vercel URL
- `SECRET_KEY` — token-signing key, ≥32 bytes; the app refuses to start in
  production without it. Generate: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
- `APP_ENV=production` — enables the SECRET_KEY enforcement
- `GOOGLE_CLIENT_ID` — the Google OAuth client ID, used to verify Google sign-in tokens
- `HF_HOME=/app/.hf` — Hugging Face cache location inside the container
- `ENABLE_API_DOCS` — set `true` only to expose `/docs`, `/redoc`, `/openapi.json`

### Vercel environment variables (frontend)

- `VITE_API_URL` — `https://canvett-backend.fly.dev`
- `VITE_GOOGLE_CLIENT_ID` — the Google OAuth client ID

`vercel.json` at the repo root supplies the SPA rewrite so client-side routes
(e.g. `/dashboard`) resolve to `index.html` instead of 404-ing.

---

## Backend container (Fly.io)

Defined by `backend/Dockerfile` and `backend/fly.toml`.

- Base image `python:3.11-slim`; installs `requirements.txt`.
- The MiniLM model is **pre-downloaded into the image** at build time, so the
  first request after a deploy or restart does not wait on Hugging Face.
- Start command runs Uvicorn with `--proxy-headers --forwarded-allow-ips='*'`.
  This is required: Fly terminates TLS and forwards plain HTTP internally, and
  without it FastAPI's trailing-slash redirects emit `http://` Location headers
  that the HTTPS frontend blocks as mixed content.
- `torch` is pinned platform-conditionally in `requirements.txt`: the CPU-only
  wheel (`+cpu`) on Linux (small, fits the memory budget) and the plain wheel on
  macOS/Windows for local development.

### Deploy commands

```bash
# from the repo, backend directory
cd backend
flyctl deploy

# secrets (names shown; set once, or when they change)
flyctl secrets set DATABASE_URL="..." ALLOWED_ORIGINS="https://canvett.vercel.app" \
  SECRET_KEY="..." GOOGLE_CLIENT_ID="..." -a canvett-backend

# keep a single machine in Frankfurt
flyctl machines list -a canvett-backend
flyctl scale count 1 --region fra -a canvett-backend
```

---

## Database

The Neon database is initialised by the backend itself. On startup the app runs
`Base.metadata.create_all(bind=engine)` to create any missing tables, followed by
idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements that patch
columns added by later features onto pre-existing tables. `backend/reset_schema.py`
is a one-off that drops and recreates the whole schema from the current models,
for use only when the data is expendable:

```bash
flyctl ssh console -C "python reset_schema.py" -a canvett-backend
```

Connection pooling is tuned in `connection.py` (`pool_pre_ping`, `pool_recycle`,
TCP keepalives) so connections to Neon stay warm and validated between requests
instead of being rebuilt each time.

---

## Notes and known constraints

- **Uploaded files are ephemeral.** Original CV files written to
  `backend/uploads/` are lost on restart/redeploy. This does not break anything:
  the parsed `resume_text` is stored in the database and all scoring works from
  that text, not the original file.
- **First request after a restart** briefly warms the model in memory. With one
  always-on machine this is rare in normal use.
- **Do not deploy** `backend/venv/`, `node_modules/`, `backend/uploads/`, or any
  `.env` files. `.gitignore` and `.dockerignore` cover these.

---

## Redeploy checklist

1. Commit and push changes (frontend changes auto-deploy on Vercel).
2. For backend changes: `cd backend && flyctl deploy`.
3. If env/secrets changed, set them with `flyctl secrets set ...` (a secret
   change triggers a restart on its own).
4. Verify: sign in, load the dashboard, confirm data loads and Google sign-in works.
