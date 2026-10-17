# PRISMA — TPB Cyberbullying Intervention System

> A psychoeducational web platform grounded in the **Theory of Planned Behavior (TPB)** to assess, prevent, and mitigate cyberbullying among university students through tailored behavioral interventions.

---

## ⚡ Tech Stack

- **Backend:** FastAPI (Python 3.11+), SQLAlchemy 2.0, SQLite, JWT (HS256)
- **Frontend:** React 19, Vite, React Router, Lucide Icons, CSS Design Tokens
- **AI / Scenarios:** Dynamic contextual synthesizer with optional OpenAI (gpt-4o-mini) support

---

## ✨ Key Features

- **TPB Assessment:** Pre- and post-intervention evaluations measuring Attitude (AT), Subjective Norm (SN), and Perceived Behavioral Control (PBC) on a 0–100 scale.
- **Automated Interventions:** Dynamic module assignment targeting weak constructs (scores < 60).
- **Interactive Learning:** Formative micro-lessons, quizzes, and dilemma-based scenarios.
- **Student Dashboard:** Real-time visual progress gauges, pre-vs-post deltas, and reflective feedback.
- **Secure Authentication:** Role-based access with bcrypt password hashing and JWT sessions.

---

## 🚀 Getting Started

### Prerequisites
- **Python** 3.11+
- **Node.js** 18+ & **npm**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Rakshanda-Mehboob/Prisma.git
cd Prisma
```

### 2. Backend Setup (FastAPI)
```bash
cd server
python -m venv .venv

# Activate virtual environment:
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install dependencies & initialize database
pip install -r requirements.txt
python seed.py

# Run API server
uvicorn main:app --reload --port 8000
```
- API endpoint: `http://localhost:8000`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`

> **Demo Student Account:**
> - **Email:** `demo@riphah.edu.pk`
> - **Password:** `Demo1234!`

### 3. Frontend Setup (React + Vite)
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
- Application runs at `http://localhost:5173`

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` (or configure `server/.env` and `client/.env`):

| Variable | Default | Purpose |
|---|---|---|
| `SECRET_KEY` | `tpb-fyp-super-secret-key-...` | Secret key for JWT signature |
| `DATABASE_URL` | `sqlite:///./app.db` | SQLite database connection string |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed client origins |
| `OPENAI_API_KEY` | _(Optional)_ | OpenAI API key (falls back to local synthesizer if unset) |
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL for client |

---

## 📡 Key API Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new student account |
| `POST` | `/auth/login` | Authenticate and obtain JWT token |
| `GET` | `/assessment/status` | Current assessment state & unlocked tests |
| `POST` | `/assessment/pre` | Submit pre-assessment & auto-assign modules |
| `POST` | `/assessment/post` | Submit post-assessment responses |
| `GET` | `/interventions/my` | Retrieve assigned learning modules |
| `POST` | `/interventions/{id}/complete` | Mark a module completed |
| `GET` | `/dashboard` | Student scores, progress, and feedback |

---

## 📄 License & Academic Citation

Developed as a Senior Capstone Project at the Faculty of Computing, Riphah International University, applying Icek Ajzen's (1991) Theory of Planned Behavior.
