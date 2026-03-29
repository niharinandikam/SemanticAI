# SemanticAI

SemanticAI is a React frontend with a Flask backend. It provides an AI-assisted plagiarism detection workflow with authentication, PDF or text input, sentence-level analysis, history tracking, and optional Gemini-based insights.

## Tech stack

Frontend: React + Material UI + React Router + Recharts (frontend)

Backend: Python + Flask + JWT + MongoDB (backend)

AI/NLP: SentenceTransformers + scikit-learn + NLTK + optional Gemini API

Dev tooling: npm (frontend), pip/venv (backend)

## Repository structure

.
|- ai/            # legacy prototype Flask app (not main runtime)
|- backend/       # main API, auth, analysis, history
|- frontend/      # React application
|- README.md
`- .gitignore

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Python 3.10+
- MongoDB (local or cloud)

## Getting started (Windows / PowerShell)

### Clone repository

```powershell
git clone https://github.com/niharinandikam/SemanticAI.git
cd SemanticAI\Hackathon\Hackathon
```

### Backend setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend: http://127.0.0.1:5000

### Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
npm start
```

Frontend: http://localhost:3000

If you prefer separate backend run with production server locally:

```powershell
cd backend
gunicorn app:app
```

## Environment variables

Create backend/.env:

```env
MONGO_URI=mongodb://127.0.0.1:27017/plagiarism_detection
JWT_SECRET=replace-with-a-strong-secret
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
# Optional
# GEMINI_API_KEY=your_key_here
# NLTK_DATA_PATH=backend/nltk_data
```

Frontend runtime API target is configured in frontend/src/config.js:

- localhost/127.0.0.1 -> http://127.0.0.1:5000
- non-localhost -> configured proxy URL

## Available scripts and commands

Backend (backend):

- python app.py -> start Flask API on port 5000
- gunicorn app:app -> production-style server entry

Frontend (frontend):

- npm start -> React development server
- npm run build -> production build

## API quick test

GET http://127.0.0.1:5000/
-> {"status":"server running"}

POST http://127.0.0.1:5000/register
-> creates account

POST http://127.0.0.1:5000/login
-> returns access token

POST http://127.0.0.1:5000/analyze (Authorization: Bearer <token>)
-> returns percentage, analysis, extracted_text, ai_insight

GET http://127.0.0.1:5000/history (Authorization: Bearer <token>)
-> returns scan history for user

GET/PUT http://127.0.0.1:5000/profile (Authorization: Bearer <token>)
-> fetch/update user profile

## Build and deploy

Build frontend:

```powershell
cd frontend
npm run build
```

Deploy approach A (separate services):

- Deploy frontend build to static hosting (Vercel/Netlify/Azure Static Web Apps)
- Deploy backend Flask API separately (VM, container, or PaaS)

Deploy approach B (single backend domain):

- Serve frontend build from web server/reverse proxy
- Route API requests to Flask backend

Before production deployment:

- Set strong JWT_SECRET
- Restrict CORS_ORIGINS to your domain only
- Store GEMINI_API_KEY only in environment/secret manager

## Troubleshooting

Backend not starting:

- Verify Python version and virtual environment activation
- Ensure all packages from requirements.txt are installed

MongoDB connection error:

- Check MONGO_URI in backend/.env
- Ensure MongoDB service is running

401 unauthorized on protected routes:

- Confirm token is present and sent as Bearer token
- Re-login if token expired

Frontend cannot reach backend:

- Ensure backend runs on 127.0.0.1:5000
- Verify CORS_ORIGINS includes frontend URL

Slow first analysis request:

- SentenceTransformer model preloading can take time on first run

## Security notes

- Never hardcode API keys in source files
- Keep .env out of git
- Rotate and revoke exposed keys immediately

## License

MIT (recommended). Add a LICENSE file before public redistribution.
