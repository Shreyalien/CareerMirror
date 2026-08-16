# CareerMirror

CareerMirror is a full-stack CV analysis application that lets users upload or provide CV text, choose a recruiter persona, and receive structured feedback in Coach or Roast mode. It also provides skill-fit, career-fit, and CV health indicators.

## Stack

- Frontend: React 18 + Vite + Tailwind CSS + Framer Motion + Recharts
- Backend: Node.js + Express
- CV parsing: PDF.js / Mammoth on the client and pdf-parse on the server
- AI analysis: Anthropic Claude API (optional)
- Fallback analysis: local rule-based analysis when no API key is configured

## Project Structure

```text
careermirror/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── server.js
│   ├── heuristics.js
│   ├── skillsMap.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Run Locally

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
```

The API key is optional. Without it, the application uses the local analysis engine.

Start the backend:

```bash
npm start
```

Health check:

```text
http://localhost:5000/api/health
```

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

For local development, `frontend/.env.example` uses:

```env
VITE_API_URL=http://localhost:5000
```

## Deploying to Render

Deploy the backend and frontend as two separate Render services from the same GitHub repository.

### Backend — Web Service

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variable: `ANTHROPIC_API_KEY`

Render provides the `PORT` environment variable automatically.

After deployment, verify:

```text
https://YOUR-BACKEND.onrender.com/api/health
```

### Frontend — Static Site

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable:

```env
VITE_API_URL=https://YOUR-BACKEND.onrender.com
```

Redeploy the frontend after changing the environment variable.

## GitHub

Do not commit `.env` files, API keys, `node_modules`, or build output. The repository `.gitignore` already excludes these files and folders.

Typical first push:

```bash
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Notes

- The Anthropic API key must remain on the backend. Do not put it in the Vite frontend environment.
- `VITE_API_URL` is safe for the frontend because it contains the public backend URL, not a secret.
- The local analysis engine allows the application to run without an external AI API.
