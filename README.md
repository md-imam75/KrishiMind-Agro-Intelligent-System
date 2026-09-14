# 🌾 KrishiMind

> AI-Powered Crop Intelligence & Farmer Decision Support Platform for Bangladesh

**KrishiMind** helps Bangladeshi farmers make smarter decisions by combining satellite weather data, Gemini AI vision, and agricultural expertise into a Bangla-first mobile web experience — and gives district officers a regional monitoring dashboard.

---

## 📁 Project Structure

```
E:\krishimind\
├── backend/          # FastAPI (Python 3.11) — B1 Auth + B2 Farm Profile
├── frontend/         # Next.js 14 (App Router) — F1–F4 Farmer Screens
├── nginx/            # Reverse proxy config
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Docker Compose)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone / open the project
```powershell
cd E:\krishimind
```

### 2. Configure environment variables
```powershell
# Backend .env is already created with dev defaults
# Optionally add your Gemini API key (needed for Phase 2):
notepad backend\.env
```

### 3. Start all services
```powershell
docker compose up --build
```

### 4. Run database migrations (first time only)
```powershell
docker compose run --rm migrate
```

### 5. Open the app
| Service | URL |
|---|---|
| 🌾 Farmer App | http://localhost:3000 |
| 🔧 API Docs (Swagger) | http://localhost:8000/docs |
| ❤️ Health Check | http://localhost:8000/health |
| 🔀 Nginx Proxy | http://localhost:80 |

---

## 🛠️ Local Development (Without Docker)

### Backend

**Requirements:** Python 3.11+, PostgreSQL 15+, Redis 7+

```powershell
cd E:\krishimind\backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up .env (already done — edit if needed)
copy .env.example .env

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend

**Requirements:** Node.js 20+

```powershell
cd E:\krishimind\frontend

# Install dependencies
npm install

# Set up env
copy .env.local.example .env.local

# Start dev server
npm run dev
```

App runs at **http://localhost:3000**

---

## 🔐 Authentication (Dev Mode)

OTP SMS is **skipped** in dev mode. Instead:

1. Enter any valid BD phone number (e.g. `01712345678`)
2. Click **Send Code**
3. Check the **backend console/logs** for the OTP:
   ```
   [DEV OTP] Phone: +8801712345678 | OTP: 847291
   ```
4. Enter that code to log in

---

## 📱 Phase 1 Screens

| Screen | Path | Description |
|---|---|---|
| **F1** Language & Onboarding | `/bn/onboarding` | Language selection + feature carousel |
| **F2** Sign Up / Login | `/bn/login` | Phone + OTP + farm profile setup |
| **F3** Home Dashboard | `/bn/dashboard` | Snapshot cards, risk banner, quick-access grid |
| **F4** My Farm & Crops | `/bn/farm` | Crop list, soil profile, crop history |

Switch to English: `/en/onboarding`

---

## 🏗️ Backend API

Base URL: `http://localhost:8000`

### Auth Endpoints (B1)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/otp/request` | Request OTP (returns OTP in dev mode) |
| `POST` | `/api/v1/auth/otp/verify` | Verify OTP → get JWT tokens |
| `POST` | `/api/v1/auth/officer/login` | Officer login (email + password) |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Revoke refresh token |

### Farmer Endpoints (B2)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/farmer/profile` | Get farmer profile |
| `PUT` | `/api/v1/farmer/profile` | Update profile (name, district, etc.) |
| `GET` | `/api/v1/farmer/profile/completeness` | Profile completeness check |
| `GET` | `/api/v1/farmer/plots` | List all plots |
| `POST` | `/api/v1/farmer/plots` | Create a plot |
| `PUT` | `/api/v1/farmer/plots/{id}` | Update a plot |
| `GET/POST` | `/api/v1/farmer/plots/{id}/crop` | Get / set active crop |
| `POST` | `/api/v1/farmer/plots/{id}/harvest` | Mark crop as harvested |
| `GET/POST` | `/api/v1/farmer/plots/{id}/history` | Crop history |

---

## 🗄️ Database Schema

```
farmers ──< farm_profiles ──< plots ──< active_crops
                                    └──< crop_history
farmers ──< refresh_tokens
otp_verifications
officers
```

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://...` | PostgreSQL connection |
| `REDIS_URL` | `redis://redis:6379/0` | Redis connection |
| `SECRET_KEY` | *(set in .env)* | JWT signing secret — **change in prod!** |
| `OTP_DEV_MODE` | `true` | Print OTP to console instead of SMS |
| `GEMINI_API_KEY` | *(empty)* | Needed for Phase 2 AI features |

### Frontend (`frontend/.env.local`)
| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend base URL |

---

## 📋 Development Phases

| Phase | Status | Features |
|---|---|---|
| **Phase 1** | ✅ Complete | Auth (B1), Farm Profile (B2), F1–F4 screens |
| **Phase 2** | 🔜 Next | Crop Rec (B3), Disease Scan (B4), Yield (B6), Weather (B7), F5–F10 |
| **Phase 3** | 📅 Planned | Risk (B5), Market (B8), Assistant (B9), Notifications, F11–F14 |
| **Phase 4** | 📅 Planned | Officer Dashboard (A1–A8) |
| **Phase 5** | 📅 Planned | Tests, CI/CD, production hardening |

---

## 🤝 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| i18n | next-intl (Bangla 🇧🇩 + English 🇬🇧) |
| State | Zustand + TanStack Query |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 16 + PostGIS |
| Cache | Redis 7 |
| AI/ML | Google Gemini API (Phase 2+) |
| Maps | Leaflet + OpenStreetMap (Phase 4) |
| Auth | JWT (python-jose) + Phone OTP |
| Container | Docker + Docker Compose |
| Proxy | Nginx |
