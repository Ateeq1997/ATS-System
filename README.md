# AI Resume Analyzer & ATS Scoring Platform

A full-stack app that scores a resume against an ATS (Applicant Tracking
System), highlights missing keywords/skills against a target job description,
and produces AI-generated feedback (strengths, weaknesses, suggestions,
rewrite tips) via Google's Gemini API. Built to run entirely on Vercel's free
tier: a static React frontend plus a Python FastAPI backend as a single
serverless function.

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, Framer Motion, Recharts, React Router
**Backend:** FastAPI, Pydantic, PyPDF2, Google Generative AI (Gemini) — keyword/TF-IDF matching is pure Python, no compiled ML dependencies
**Storage:** JSON file (`resume_history.json`) — no database required
**Deployment:** Vercel (`buildCommand`/`outputDirectory` for the frontend + zero-config `/api` Python function)

## Project Structure

```
.
├── api/                        # FastAPI serverless backend
│   ├── index.py                # App entrypoint (single Vercel function)
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── services/
│   │   ├── pdf_parser.py       # PyPDF2 text extraction
│   │   ├── ats_scorer.py       # Keyword/skill matching + TF-IDF match score
│   │   └── gemini_service.py   # Gemini AI analysis (+ heuristic fallback)
│   ├── storage/
│   │   └── json_storage.py     # JSON-file-backed resume history
│   └── utils/
│       ├── text_processing.py  # Tokenization (spaCy, with regex fallback)
│       └── skills_db.py        # Static skills taxonomy
├── frontend/                   # React + TypeScript + Tailwind app
│   └── src/
│       ├── components/         # Reusable UI (upload, charts, panels)
│       ├── pages/               # Route-level pages
│       ├── context/            # Theme (dark/light) context
│       ├── services/            # Typed API client
│       └── types/               # Shared TypeScript types
├── requirements.txt             # Python dependencies (used by Vercel)
├── vercel.json                  # Vercel build & routing config
└── .env.example
```

## Features

1. **Resume Upload** — drag & drop or click-to-browse PDF upload with server-side text extraction.
2. **ATS Score** — overall score blending job-match percentage, keyword coverage, and formatting checks.
3. **AI Analysis** — Gemini-powered strengths, weaknesses, improvement suggestions, and rewrite tips (falls back to a rule-based analysis if no API key is set).
4. **Job Description Comparison** — paste a JD to see matched vs. missing skills/keywords.
5. **Skills Visualization** — radar chart (resume vs. JD) and a category-based skill distribution chart.
6. **Resume History** — every analysis is saved to `resume_history.json`, with search/sort on the History page.
7. **Dashboard** — upload count, average/highest/lowest score, score trend over time, recent analyses.
8. **Resume Comparison** — upload up to 4 resumes and rank them against one job description side by side.
9. **Cover Letter Generator** — Gemini-powered cover letter drawn only from the analyzed resume (heuristic fallback without an API key).
10. **Resume Chat** — ask follow-up questions about a specific analysis; stateless per-request (no server-side session).
11. **PDF Export** — download any analysis as a PDF report, generated entirely client-side (no backend involved).
12. **Responsive, dark/light mode UI** with animated transitions, toast notifications, and skeleton loading states.

## Local Development

### Backend

```bash
cd api
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements-dev.txt
uvicorn index:app --reload --port 8000
```

Tokenization uses a built-in regex fallback by default. If you want spaCy-based
lemmatization locally, `pip install spacy` and
`python -m spacy download en_core_web_sm` — `text_processing.py` will pick it
up automatically if present. It's intentionally left out of
`requirements.txt` so it never affects the Vercel deployment (see below).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://127.0.0.1:8000` (see
`frontend/vite.config.ts`), so the two run side by side during development.

Copy `.env.example` to `.env` in the project root (for the API) and set
`GEMINI_API_KEY` if you want live AI analysis; otherwise the app automatically
falls back to a heuristic analysis derived from the ATS score.

## Deploying (two options)

### Option A: Split hosting — Cloudflare Pages + Render (recommended)

Each platform does one simple, well-supported job instead of one platform
juggling both a static site and a Python serverless function.

**Backend (Render):**
1. Push this repo to GitHub.
2. In Render, "New +" → "Blueprint" → select this repo. Render reads
   `render.yaml` at the repo root automatically (root dir `api`, install via
   `requirements-dev.txt`, start via `uvicorn index:app`).
3. Set the `GEMINI_API_KEY` environment variable in the Render dashboard
   (left blank in `render.yaml` on purpose — it's a secret).
4. Deploy. Note the resulting URL, e.g. `https://ats-system-api.onrender.com`.
   Render's free tier spins down after ~15 minutes of inactivity — the first
   request after idling takes 30-50s to cold-start; fine for a portfolio demo.

**Frontend (Cloudflare Pages):**
1. In Cloudflare Pages, create a project from the same GitHub repo.
2. Framework preset: **Vite**. Root directory: `frontend`. Build command:
   `npm run build`. Build output directory: `dist`.
3. Add environment variable `VITE_API_BASE_URL` = your Render URL + `/api`
   (e.g. `https://ats-system-api.onrender.com/api`).
4. Deploy. `frontend/public/_redirects` (copied into the build output
   automatically by Vite) tells Cloudflare Pages to serve `index.html` for
   any path, so React Router's client-side routes work correctly.

With frontend and backend on different domains, CORS matters: `render.yaml`
sets `CORS_ORIGINS=*` by default so this works out of the box; restrict it to
your exact Cloudflare Pages URL once you have it if you want tighter CORS.

### Option B: Single domain on Vercel

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. In the project's **Settings → Build and Deployment**, make sure Build
   Command / Output Directory / Install Command **Override toggles are OFF**
   — otherwise dashboard settings silently take priority over `vercel.json`.
4. Set the environment variable `GEMINI_API_KEY` (and optionally
   `GEMINI_MODEL`, `CORS_ORIGINS`) in the Vercel project settings.
5. Deploy — `vercel.json`'s `buildCommand`/`outputDirectory` build `frontend/`
   as a static site, `api/index.py` is auto-detected as a Python serverless
   function, and `rewrites` route `/api/*` to it with everything else falling
   back to the SPA.

### Notes & constraints

- Resume history is stored in `/tmp` on Vercel, which is **ephemeral per
  function instance** — fine for a demo/portfolio project, but not durable
  storage. For persistence across deploys/cold starts, swap `json_storage.py`
  for a real database (e.g. Vercel Postgres, Supabase, or a KV store).
- `spaCy` is intentionally **not** in `requirements.txt` — it's a large
  compiled package whose exact-pinned wheels aren't guaranteed to be available
  for whatever Python version/platform Vercel's build image resolves against,
  which can break `uv`'s dependency resolution during deploy. `text_processing.py`
  detects its absence and transparently falls back to a regex-based tokenizer,
  so the app works identically either way — see "Local Development" above if
  you want it locally.
- `scikit-learn` is also intentionally **not** a dependency — its compiled
  wheels link against OpenMP (`libgomp`), which the minimal Linux runtime
  Vercel's Python functions run on doesn't ship by default, causing an
  `ImportError` on every single invocation. The TF-IDF cosine-similarity used
  for job-match scoring is implemented in pure Python instead
  (`ats_scorer.py`), so there's no compiled ML dependency in the deploy at all.
- Uploaded PDFs are processed in-memory only and are never written to disk.
- The Python runtime version is pinned via `.python-version` at the repo root.

### Keeping the API warm

Vercel serverless functions don't sleep permanently like some other free
tiers — they're always reachable — but an idle function does pay a "cold
start" (roughly 1-2s) on the next request after a period of inactivity.

`vercel.json` includes a Vercel Cron Job that pings `/api/health` once a day:

```json
"crons": [{ "path": "/api/health", "schedule": "0 0 * * *" }]
```

**This is a hard Vercel Hobby (free) plan limit** — cron jobs on Hobby can run
no more frequently than once every 24 hours, so this alone won't prevent
cold starts between real user requests during the day. To actually keep the
function warm during active hours, add a free external uptime monitor (not
subject to Vercel's cron limits since it's just an ordinary HTTP request from
outside) pointed at `https://<your-deployment>.vercel.app/api/health`:

- [UptimeRobot](https://uptimerobot.com) — free tier supports 5-minute intervals.
- [cron-job.org](https://cron-job.org) — free, supports 1-minute intervals.

Set either to hit `/api/health` every 5 minutes and cold starts effectively
disappear during that window. If you outgrow the Hobby plan's cron
limitation, Vercel Pro allows crons to run as often as once per minute.

## API Endpoints

| Method | Path                  | Description                          |
|--------|-----------------------|---------------------------------------|
| GET    | `/api/health`          | Health check                          |
| POST   | `/api/upload`          | Upload a PDF, returns extracted text  |
| POST   | `/api/analyze`         | Run ATS scoring + AI analysis         |
| POST   | `/api/compare`         | Compare up to 4 resumes against one job description |
| POST   | `/api/cover-letter`    | Generate a tailored cover letter      |
| POST   | `/api/chat`            | Ask a question about a resume (stateless, pass full message history) |
| GET    | `/api/history`         | List saved analyses                   |
| GET    | `/api/history/{id}`    | Get one full analysis                 |
| DELETE | `/api/history/{id}`    | Delete one analysis                   |
| GET    | `/api/dashboard`       | Aggregate dashboard stats             |
