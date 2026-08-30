# CareerMirror

CV analysis platform that gives you feedback the way an actual recruiter would — not a generic ATS keyword scanner. Upload a resume or paste the text, pick a persona, choose your tone, and get back skill-fit, career-fit, and CV health scores with a full breakdown.

[![React](https://img.shields.io/badge/React-18-2563eb?style=flat-square)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-2563eb?style=flat-square)](https://expressjs.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-2563eb?style=flat-square)](https://tailwindcss.com)
[![Author](https://img.shields.io/badge/Author-Shreyalien%20(Shreya)-8B7BFF?style=flat-square&logo=github)](https://github.com/Shreyalien)

### [Live Demo](https://careermirror-0rwk.onrender.com/)

---

## Author & Credits

Created and maintained by **[Shreyalien (Shreya)](https://github.com/Shreyalien)**.

---

## Overview

Most resume tools stop at keyword matching. CareerMirror goes further — it evaluates structure, clarity, and how well your experience actually maps to a target role, then delivers that as feedback shaped by a persona and a tone you choose.

Two modes:

| Mode | What you get |
|---|---|
| **Coach** | Constructive, structured feedback — what's working, what to fix, and how |
| **Roast** | Blunt, no-cushion feedback — closer to what a recruiter actually thinks after a 6-second skim |

## Features

- **Persona-based review** — feedback framed from the perspective of a specific type of recruiter/hiring manager
- **Real-Time ATS Score Checker** — weighted scoring across Impact, Action Verbs, ATS Structure, and Keyword coverage
- **Split-Pane Live CV Editor & 1-Click Auto-Fixer** — edit live, upgrade passive phrases to power verbs, purge buzzwords, and standardize headers
- **Dream Job Skill Gap Suggestion Box & ATS Booster** — custom dream job benchmarks, missing skills diagnosis, project blueprints, and 1-click CV skill injection
- **Job Matches & Where to Apply Navigator** — matching role titles with market salaries and 1-click direct search links across LinkedIn, Wellfound, Indeed, and RemoteOK
- **Skill-fit scoring** — compares extracted skills against a target role's expected skill set
- **Career-fit scoring** — flags inconsistent trajectory, unexplained gaps, mismatched seniority signals
- **CV health score** — formatting, length, structure, and clarity checks independent of role
- **Dual input** — upload a PDF/DOCX directly or paste raw text
- **Visual breakdown** — score charts and category breakdowns via Recharts, not just a wall of text
- **Works with or without an API key** — falls back to a deterministic local scoring engine when no key is set, so the app is never fully dependent on an external service

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| Backend | Node.js, Express |
| CV parsing | PDF.js / Mammoth (client-side preview), pdf-parse (server-side, source of truth) |
| Analysis engine | Claude API (when configured) with a rule-based fallback (`heuristics.js`) |

The parsing is intentionally duplicated — client-side gives an instant preview, server-side is what actually gets analyzed, so the two never need to trust each other's output.

## Project structure

```
careermirror/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
├── backend/
│   ├── server.js       Express app + routes
│   ├── heuristics.js    fallback scoring engine
│   └── skillsMap.js     skill taxonomy used by the scoring logic
└── .gitignore
```

## Running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

`.env`:

```env
ANTHROPIC_API_KEY=   # optional — leave empty to run on the local engine
PORT=5000
```

Confirm it's up: `http://localhost:5000/api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Serves on `http://localhost:5173`, pointing at the backend via:

```env
VITE_API_URL=http://localhost:5000
```

## Deployment

Two Render services from the same repo.

**Backend — Web Service**
- Root: `backend`
- Build: `npm install`
- Start: `npm start`
- Env: `ANTHROPIC_API_KEY`

**Frontend — Static Site**
- Root: `frontend`
- Build: `npm install && npm run build`
- Publish dir: `dist`
- Env: `VITE_API_URL` → backend's deployed URL

Redeploy the frontend after changing `VITE_API_URL` — Vite bakes it in at build time, not runtime.

## Security notes

- `ANTHROPIC_API_KEY` is read server-side only and never exposed to the frontend build.
- `VITE_API_URL` is safe to expose publicly — it's a routing address, not a credential.
- No key configured, no problem — the local heuristics engine keeps the app fully functional.

## License

All rights reserved. This code is shared for viewing purposes only — not licensed for reuse, modification, or redistribution.
