<div align="center">

# CareerMirror

**Turn your CV into signal, not guesswork.**

Upload a resume, pick who's reading it, and get back the kind of feedback a recruiter would give you in a hallway — not a generic checklist.

[![status](https://img.shields.io/badge/status-live-2563eb?style=flat-square)](https://careermirror-backend.onrender.com/)
[![React](https://img.shields.io/badge/React-18-2563eb?style=flat-square)](https://react.dev)
[![Node](https://img.shields.io/badge/Node.js-Express-2563eb?style=flat-square)](https://expressjs.com)
[![License](https://img.shields.io/badge/license-MIT-2563eb?style=flat-square)](#license)

### [🔗 Live Demo](https://careermirror-backend.onrender.com/)

</div>

---

## What it does

Most resume checkers count keywords and call it a day. CareerMirror tries to actually *read* your CV the way a human reviewer would — through the lens of a persona you pick — and hands back three things:

- **Skill-fit** — how well your listed skills line up with the role you're targeting
- **Career-fit** — whether your trajectory reads as coherent or scattered
- **CV health** — the structural stuff: formatting, gaps, clarity, length

You choose the tone: **Coach mode** gives constructive, encouraging feedback. **Roast mode** doesn't hold back — useful when you want the version a tired recruiter would actually think, not the polite version.

If an Anthropic API key is configured, analysis runs on Claude. If not, a local rule-based engine takes over automatically — no external calls required to use the app.

---

## How it's built

| Layer | Choices |
|---|---|
| Frontend | React 18, Vite, Tailwind, Framer Motion for the motion layer, Recharts for the fit/health visuals |
| Backend | Node.js + Express, plain REST |
| CV parsing | PDF.js and Mammoth in-browser for instant preview; pdf-parse server-side for the actual extraction |
| Analysis | Anthropic API when a key is present, deterministic heuristics engine otherwise |

The split matters: parsing happens twice on purpose — once client-side for a fast preview, once server-side as the source of truth for analysis.

---

## Project layout

```
careermirror/
├── frontend/          React + Vite app
│   ├── src/
│   └── public/
├── backend/
│   ├── server.js       Express entrypoint
│   ├── heuristics.js    fallback analysis engine
│   └── skillsMap.js     skill taxonomy used by both engines
└── .gitignore
```

---

## Getting it running

**Backend**

```bash
cd backend
npm install
cp .env.example .env    # add your own values, see note below
npm start
```

`.env` needs:

```env
ANTHROPIC_API_KEY=   # optional — leave blank to use the local engine
PORT=5000
```

Sanity check: `http://localhost:5000/api/health` should respond.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` by default, pointed at the backend via:

```env
VITE_API_URL=http://localhost:5000
```

> **On `.env.example` files:** committing one is fine and expected — it should only ever hold placeholder keys or blank values, never real secrets. The actual `.env` (with your real API key) stays out of git via `.gitignore`. If you ever *did* commit a real key by mistake, rotating it on Anthropic's console is the fix, not just removing the file — git history still holds it.

---

## Deploying

Two independent services, same repo:

**Backend** — Web Service
- Root: `backend`
- Build: `npm install`
- Start: `npm start`
- Env: `ANTHROPIC_API_KEY`

**Frontend** — Static Site
- Root: `frontend`
- Build: `npm install && npm run build`
- Publish dir: `dist`
- Env: `VITE_API_URL` → your backend's deployed URL

Redeploy the frontend whenever `VITE_API_URL` changes — Vite bakes env vars in at build time, not runtime.

---

## A few things worth knowing

- The Anthropic key never touches the frontend build — it's read server-side only.
- `VITE_API_URL` is safe to expose; it's just a routing address, not a credential.
- No key configured, no problem — the app is fully usable on the local engine alone.

---

## License

MIT — use it, fork it, break it, learn from it.

