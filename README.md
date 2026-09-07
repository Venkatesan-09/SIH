# SkillTwin

> AI-Powered Competency Intelligence & Personalized Learning Platform for government statistical-system employees.

**"Know your skills. Discover your gaps. Master what matters."**

---

## Architecture

```
skilltwin/
├── apps/
│   ├── web/    React + Vite + TypeScript  (port 5173)
│   ├── api/    Express + TypeScript + Prisma  (port 4000)
│   └── ai/     FastAPI + Python  (port 8000)
├── packages/
│   ├── types/  Shared DTOs & enums (consumed by web + api)
│   └── config/ Shared ESLint + tsconfig bases
├── prisma/     Schema + migrations + seed
└── docs/       Technical specification
```

## Quick Start (Development)

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9
- Python ≥ 3.11 (via `py` launcher on Windows)
- Docker + Docker Compose

### 1. Clone and install
```bash
git clone <repo>
cd skilltwin
pnpm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values (JWT secrets at minimum)
```

### 3. Start the database
```bash
docker-compose up postgres -d
```

### 4. Run migrations & seed data
```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start all services
```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Web
pnpm dev:web

# Terminal 3 — AI service
cd apps/ai && py -m uvicorn app.main:app --reload --port 8000
```

### Demo credentials (after seed)
| Role | Email | Password |
|---|---|---|
| Employee | demo@skilltwin.gov.in | Demo@12345 |
| Admin | admin@skilltwin.gov.in | Admin@12345 |

## Running Tests
```bash
pnpm test:api    # Vitest (backend unit + integration)
pnpm test:web    # Vitest + React Testing Library
cd apps/ai && py -m pytest  # pytest (AI service)
```

## Key Design Decisions
- Competency scores are computed **server-side only** (deterministic formula, never AI-written)
- AI (MockAIProvider) produces explanations, recommendations, and draft quiz questions only
- iGOT integration is **mocked** — a DEMO/MOCK badge appears wherever iGOT data renders
- Role-based access control is enforced on the API — frontend nav hiding is UX only

## Phase Progress
- [x] Phase 0 — Repository Initialization
- [ ] Phase 1 — Design System & Application Shell
- [ ] Phase 2 — Database & Prisma Schema
- [ ] Phase 3 — API Foundation & Auth
- [ ] Phase 4 — Departments, Roles & Competency Catalogue
- [ ] Phase 5 — Competency Engine & Skill Score
- [ ] Phase 6 — Skill Gap Engine
- [ ] Phase 7 — Assessment Engine
- [ ] Phase 8 — Courses & Learning Paths API
- [ ] Phase 9 — Progress Tracking API
- [ ] Phase 10 — AI Service (MockAIProvider)
- [ ] Phase 11 — Document Processing & AI Quiz Pipeline
- [ ] Phase 12 — iGOT Adapter (MockIGOTProvider)
- [ ] Phase 13 — Admin Analytics API
- [ ] Phase 14 — Auth Screens
- [ ] Phase 15 — Employee Core Screens
- [ ] Phase 16 — Assessment & Learning Screens
- [ ] Phase 17 — AI Screens
- [ ] Phase 18 — Admin Screens + Shared
- [ ] Phase 19 — Security Hardening, Testing & Deployment
# SIH
