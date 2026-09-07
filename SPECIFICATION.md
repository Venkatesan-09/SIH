<USER_REQUEST>
# SKILLTWIN — MASTER TECHNICAL SPECIFICATION

**"Know your skills. Discover your gaps. Master what matters."**
AI-Powered Competency Intelligence & Personalized Learning Platform for government statistical-system employees.

> **How to read this document:** every claim about the Figma design is based on direct visual inspection of the 25 screens supplied (11 via live Figma MCP node inspection, 14 via pasted exports). Where the file did not specify something precisely (exact hex codes, font family, spacing tokens), the value is **ESTIMATED** from pixels and flagged. Where two designs conflicted, the resolution is flagged **IMPLEMENTATION DECISION**. Where nothing in the file answers the question at all, it is flagged **REQUIRES CONFIRMATION**.

---

## 1. EXECUTIVE SUMMARY

SkillTwin is not a course catalogue with a dashboard bolted on. The Figma screens make the actual product model explicit: every employee has a living **"Skill Twin"** — a competency profile scored 0–100 per skill, compared against a role-required target, producing a **gap %**, a **priority score**, and a **trend**. Gaps drive AI-explained learning-path recommendations; completing paths and assessments updates the twin. Administrators get the organizational mirror of this: a workforce-wide heatmap, critical-gap counts, and AI-generated "deploy intervention" actions.

Two consistent sub-products emerged from the screens:

- **Employee / Learner experience** — Skill Twin, Skill Gap Intelligence, AI Competency Radar, Assessments, Learning Paths/Courses, AI Learning Studio (quiz generation, AI Tutor), Learning Progress, Settings.
- **Admin / Workforce Intelligence experience** — Workforce dashboard, Competency Heatmap, Employee Management, Departmental Analytics, AI Insights, Reports, iGOT sync status.

**Key finding — two competing navigation systems exist in the file** (see §5). Per your direction, this spec **merges them into one canonical IA** and documents the conflict as an `IMPLEMENTATION DECISION` rather than silently picking one.

**Screen count:** 25 unique screens were supplied and audited (26 was the expected count; the 26th was not identified — see §2 note). The spec proceeds on the 25 confirmed screens; nothing is invented to pad the count to 26.

AI is architected as a swappable capability (`AIProvider` interface, `MockAIProvider` default) — nothing in the product should assume a specific LLM vendor is wired in yet. Same pattern for iGOT (`IGOTProvider` / `MockIGOTProvider`). The official competency score is **deterministic and explainable**, never AI-computed directly — AI only explains, recommends, and generates draft content that a human/backend validates.

---

## 2. COMPLETE SCREEN AUDIT (25 of 26 expected)

Node IDs marked `Figma MCP` were retrieved directly from the live file before Anthropic's Figma MCP integration hit its Starter-plan rate limit. The remaining screens were supplied as exported PNGs after the limit was hit, so no live node ID exists for them — route/component names for those are derived from on-screen content only.

**⚠ REQUIRES CONFIRMATION:** Screen count is 25, not the 26 stated in the brief. Two "Employee Management" exports were pixel-identical duplicates, and one "AI Tutor / stratified sampling" screen was pasted twice across both batches — once those duplicates are removed, only 25 distinct screens remain. If a 26th screen exists (a splash/cover screen, a specific empty/error state, or a screen simply not exported), please supply it and I'll fold it in as an addendum.

| # | Screen | Figma Node | Role | Purpose | Main Components | Key Actions | Route (proposed) |
|---|---|---|---|---|---|---|---|
| 1 | Onboarding — Generate Your Skill Twin | `1007:3` | Employee | First-run wizard to seed baseline profile for the competency engine | Progress stepper, dept/role dropdowns, segmented "years of service" control, primary CTA | Select dept, select role, select tenure band, Generate Twin | `/onboarding/profile` |
| 2 | Marketing / Landing Page | `1007:6` | Public | Pre-auth explainer of the product ("How it works", iGOT integration teaser) | Hero, 3-step "How it works" cards, iGOT integration banner, top nav | Explore SkillTwin, See How It Works, View Architecture Diagram | `/` |
| 3 | Employee Dashboard | `1007:9` | Employee | Daily competency snapshot + AI nudge | AI Insight banner, 4 stat cards (Overall Competency, Required Readiness, Critical Gaps, Learning Progress), Skill Twin summary by cluster, bottom nav | Tap AI insight → detail, View Detailed Analysis | `/dashboard` |
| 4 | Skill Gap Intelligence | `1007:12` | Employee | Ranked list of the employee's own skill gaps | AI banner ("sorted by priority"), gap cards (skill, %, priority badge, progress bar) | View Path per gap | `/skill-gaps` |
| 5 | Skill Detail | `1007:18` | Employee | Deep-dive on one competency | Level badge, proficiency bar, competency-history bar chart, "Why This Matters" AI insight, "What to Learn" checklist | Generate Learning Path | `/skills/:skillId` |
| 6 | AI Competency Radar | `1007:21` | Employee | Whole-profile radar chart vs. role target, drill into weakest area | Filter chips (All/Critical/Improving/Achieved), radar chart image, Focus Area card (current/required/gap), AI insight quote | Improve This Skill | `/skill-twin/radar` |
| 7 | Assessment — Question in progress | `1007:25` | Employee | Timed/gated quiz-taking flow | Progress bar (Q of N), topic chip, single-choice options, Submit | Select answer, Submit Answer, pause/exit | `/assessments/:id/attempt/:questionId` |
| 8 | Learning Path Detail | `1007:30` | Employee | Ordered module roadmap for one goal | "Why SkillTwin recommended this" AI card, vertical stepper (Completed/In Progress/Locked) | Resume module, (locked modules gated on prerequisite) | `/learning-paths/:id` |
| 9 | AI Learning Studio — Generate Quiz | `1007:35` | Employee | Document → AI quiz pipeline entry point | Tab bar (Generate Quiz / Ask AI Tutor / Analyze Material), upload dropzone, uploaded-file chip, "Topics Detected" chips, Competencies Mapping bars, Assessment Preview placeholder | Upload file, Generate Assessment | `/ai-studio/generate-quiz` |
| 10 | Admin — Workforce Intelligence Dashboard | `1007:38` | Admin | Org-wide competency KPIs | Admin/Learner role toggle, stat cards (Total Employees, Avg Competency, Critical Gaps), trend chart placeholder, AI Insights list w/ action buttons | Deploy Intervention, View Details, toggle Admin/Learner | `/admin/dashboard` |
| 11 | Admin — Workforce Competency Heatmap | `1007:41` | Admin | Department × skill readiness matrix | Department/Skill-cluster filters, colored matrix cells (4-tier legend), Strategic Insight AI card | Apply Filters, View Recommended Upskilling Path | `/admin/heatmap` |
| 12 | Learning Ecosystem Integration (iGOT sync) | *not retrieved* | Admin | iGOT Karmayogi integration health/status | Status card (Active, last synced, synced courses, progress-sync %), API endpoint display, Data Exchange Logs feed (success/error entries) | Configure, View Full Logs | `/admin/integrations/igot` |
| 13 | Login — Secure Authentication | *not retrieved* | Public | Auth entry | Gov ID/email field, password field, remember-device checkbox, primary + demo-access buttons, "Protected by AI Security" footer | Secure Authentication, Access Demo Environment, Forgot credentials | `/login` |
| 14 | Assessment Complete (Results) | *not retrieved* | Employee | Post-assessment scoring + AI feedback | Score ring (%, X/Y correct), Strengths list, Weak Areas list, AI Insight "Focused Learning Required" card w/ recommended action | Improve Weak Areas, Return to Dashboard | `/assessments/:id/results` |
| 15 | AI Tutor | *not retrieved* | Employee | Conversational Q&A tied to a learning module | Module context chip, chat bubbles (user right / AI left), inline diagram support, follow-up input | Ask follow-up question | `/ai-studio/tutor` |
| 16 | Employee Management (Admin shell) | *not retrieved* | Admin | Roster management & readiness search | Sidebar/hamburger shell, Export Data / Add Employee actions, stat cards (Total Workforce, Avg Readiness), AI Insight card, search + filters, paginated employee table | Search, filter by dept/readiness, Add Employee, Export Data | `/admin/employees` |
| 17 | Departmental Analytics | *not retrieved* | Admin | Division-level readiness trend | Period selector (Q3 2024), Export Report, stat cards (Overall Readiness, Active Employees, Critical Gaps) w/ QoQ deltas | Export Report, change period | `/admin/analytics/departments` |
| 18 | Learning Progress | *not retrieved* | Employee | Personal learning history & growth trend | Competency-growth area chart, Total Learning Hours banner, AI Insight card, Assessment Scores list, Completed Courses list | View All (courses) | `/progress` |
| 19 | System Intelligence & Reporting | *not retrieved* | Admin | Report generation hub | Report cards (Workforce Readiness, Skill Gap Intelligence, …) each with Generate Report + PDF/CSV export | Generate Report, export PDF/CSV | `/admin/reports` |
| 20 | Assessment Center (catalogue) | *not retrieved* | Employee | Browse/start available assessments | "Recommended Assessments" AI banner, assessment cards (priority tag, duration, tags, question count) | Start Assessment | `/assessments` |
| 21 | Learning Paths / Recommended Courses (list) | *not retrieved* | Employee | Filterable course/path recommendations | Competency/Difficulty/Provider filter panel, course cards w/ match %, "why this fits" note, Enroll / View Details | Apply filters, Enroll, View Details | `/courses` (or `/learning`) |
| 22 | Course Detail | *not retrieved* | Employee | Single course/program detail | AI Recommendation Match card, overview + objectives, status, Start Learning / Save for Later, Competencies Addressed bars | Start Learning, Save for Later | `/courses/:id` |
| 23 | AI Insights (Intel) | *not retrieved* | Admin (surfaced under "Intel" tab) | Feed of AI-generated organizational findings | Critical Finding card (timestamp, description, Deploy Training / View Detailed Analysis), Positive Trend card below fold | Deploy Training, View Detailed Analysis | `/admin/ai-insights` (aliased `/intel` in Nav-System-B) |
| 24 | Register — Establish your operational profile | *not retrieved* | Public | Account creation | Split hero/form layout, First/Last name, gov email, password w/ policy hint, dept/role dropdowns, years-of-experience field | Initialize Profile, link to Authenticate | `/register` |
| 25 | Settings | *not retrieved* | Employee/Admin (shared) | Account, notification, privacy, AI, and appearance preferences | Account Information, Notifications (toggles), Privacy & Security (2FA, data sharing), AI Intelligence Preferences (personalization level, predictive modeling toggle), Appearance (theme, language) | Change Password, toggle switches, Save Changes / Cancel | `/settings` |

---

## 3. DESIGN SYSTEM (visually estimated — labeled ESTIMATED throughout)

Because the file's screens are flattened image exports rather than live Figma layers, none of the values below could be extracted as exact tokens from Figma metadata. Every value is a close visual estimate from the screenshots and should be treated as a first draft for the design team to correct against the real files, not as ground truth.

### 3.1 Color System — **ESTIMATED**

| Token | Approx. Hex | Where seen |
|---|---|---|
| `color-primary` (Navy) | `#16224E` – `#1B2A5C` | Primary buttons, header wordmark, selected nav item, selected segmented-control option |
| `color-primary-hover` | `#0F1A3D` | Assumed darker shade — not directly observable |
| `color-accent-teal` (Success/Achieved) | `#0E8F73` – `#12A283` | "Achieved" badge, progress fill on GIS/positive gaps, competency-history bars |
| `color-critical` (Error) | `#DC2626` – `#E23F3F` | "CRITICAL" badges, red % values, Critical Gaps stat, heatmap "Critical Gap" cells |
| `color-warning` (Moderate/Developing) | `#D97706` – `#E8A23A` | "MODERATE" badge accents, heatmap "Developing" cells |
| `color-info-expert` (Indigo) | `#4C56C9` – `#5A63D8` | Heatmap "Expert" cells, some chart accents |
| `color-ai-accent` (Lavender/Indigo) | Background `#E8E9FB`, text `#4338CA` | "AI Insight", "AI INITIALIZATION", "AI Mapped" pill badges (sparkle icon) |
| `color-background` | `#F3F4FA` – `#EEF0F8` | App background behind cards |
| `color-surface` | `#FFFFFF` | Cards, inputs, modals |
| `color-border` | `#E2E4EE` | Card borders, dividers, input outlines |
| `color-text-primary` | `#0E1526` – `#111827` | Headings, primary values |
| `color-text-secondary` | `#5B6478` – `#6B7280` | Subtext, labels, captions |
| `color-text-onprimary` | `#FFFFFF` | Text on navy buttons |

**IMPLEMENTATION DECISION:** treat the above as the Tailwind `theme.extend.colors` seed; exact values should be corrected once real design files (Figma with live styles, or a shared style guide) are available.

### 3.2 Typography — **ESTIMATED**

- Font family: a clean geometric/grotesque sans (visually consistent with **Inter** or **Poppins**). `IMPLEMENTATION DECISION`: use **Inter** (already a natural fit with shadcn/ui and Tailwind defaults) unless corrected.
- Type scale (approx.):
  - Display / H1: 28–32px, weight 700 (e.g. "Good morning, Arun.", "Turn Workforce Skills into Intelligence")
  - H2 / Section title: 20–24px, weight 700 ("Skill Gap Intelligence", "Your Skill Twin")
  - Body: 14–16px, weight 400–500
  - Stat value (large numeric): 28–36px, weight 700, tabular numerals (e.g. "67%", "2,480")
  - Label / eyebrow: 11–12px, weight 600, uppercase, letter-spacing ~0.06em (e.g. "PRIMARY DEPARTMENT", "OVERALL SCORE")
  - Caption / meta: 12–13px, weight 400, muted color

### 3.3 Spacing — **ESTIMATED**

8px base grid: `4, 8, 12, 16, 24, 32, 48`. Card internal padding ≈ 16–20px; section gaps ≈ 24–32px.

### 3.4 Borders — **ESTIMATED**

- Card radius: ~12–16px
- Button radius: ~8–10px
- Input radius: ~8px
- Pill/badge radius: fully rounded (999px)
- Border width: 1px throughout

### 3.5 Shadows — **ESTIMATED**

Very low elevation; cards read almost flat with a faint separation. Approx: `0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)`.

### 3.6 Icons

Style is thin-stroke outline icons consistent with **Lucide** (already in the locked stack) — no separate icon library decision needed.

### 3.7 Component Inventory

| Component | Variants observed | Notes |
|---|---|---|
| `StatCard` | default, critical (red bg), with delta/trend | Used across Dashboard, Admin Dashboard, Departmental Analytics |
| `AIBanner` / `AIInsightCard` | inline (dashboard), bordered-left accent (skill detail, learning path, AI insights feed) | Always carries the sparkle icon + "AI Insight/AI Recommendation" pill |
| `GapCard` | critical, moderate | Skill name, %, priority badge, progress bar, "View Path" |
| `ProgressBar` | linear, colored by severity | Used in gap cards, skill detail, course competencies |
| `SegmentedControl` | 2–4 options | Years-of-service picker, radar filter chips |
| `Badge/Pill` | status (Critical/Moderate/Achieved), category (Data Engineering), AI pill | Rounded-full, colored bg |
| `BottomNav` (mobile) | Nav-System-A (5 items), Nav-System-B (4 items) | See §5 conflict |
| `AdminShell` | sidebar/hamburger variant | Employee Management screen only |
| `Chart_Bar` | competency history | Recharts bar |
| `Chart_Area/Line` | learning progress, org growth trend | Recharts area/line |
| `Chart_Radar` | AI Competency Radar | Recharts radar (source screen shows a photographed/rendered chart, not live Figma vector — implement as live Recharts) |
| `HeatmapCell` | 4-tier colored matrix | Table cell background-colored by band |
| `FileUploadDropzone` | idle, file-selected | AI Learning Studio |
| `ChatBubble` | user, AI | AI Tutor |
| `Stepper/Timeline` | completed, in-progress, locked | Learning Path Detail |
| `FilterPanel` | checkbox groups | Learning Paths list, Employee Management |
| `Table` | paginated | Employee Management |
| `ToggleSwitch` | on/off | Settings |
| `ScoreRing` | circular progress | Assessment Results |

---

## 4. INFORMATION ARCHITECTURE

```
Public
├── / (Landing)
├── /login
└── /register

Employee (role: EMPLOYEE)
├── /onboarding/profile
├── /dashboard
├── /skill-twin/radar
├── /skill-gaps
├── /skills/:skillId
├── /assessments
├── /assessments/:id
├── /assessments/:id/attempt/:questionId
├── /assessments/:id/results
├── /courses
├── /courses/:id
├── /learning-paths/:id
├── /ai-studio/generate-quiz
├── /ai-studio/tutor
├── /ai-studio/analyze-material
├── /progress
├── /profile
└── /settings

Admin (role: ADMIN, some views: TRAINER)
├── /admin/dashboard
├── /admin/heatmap
├── /admin/employees
├── /admin/employees/:id
├── /admin/analytics/departments
├── /admin/ai-insights
├── /admin/reports
├── /admin/integrations/igot
└── /settings (shared)
```

**IMPLEMENTATION DECISION:** Admin and Employee share the app shell and router; Admin unlocks additional nav items rather than being a separate app, matching the "Admin | Learner" toggle seen on the Admin Dashboard screen.

---

## 5. NAVIGATION CONFLICT — RESOLUTION (IMPLEMENTATION DECISION)

The file contains **three different navigation shells** for what is functionally one product:

- **Nav-System-A** (bottom tabs): `Dashboard · Twin · Learning · Profile · More` — seen on Dashboard, Skill Gaps, Radar, AI Studio, Learning Progress, Reports, iGOT Integration.
- **Nav-System-B** (bottom tabs): `Twin · Assessed · Learn · Intel` — seen on Assessment Center, Course list/detail, AI Insights, AI Tutor (second paste).
- **Admin shell** (sidebar/hamburger, no bottom tabs): Employee Management screen only.

**Resolution:** Per your instruction, this spec merges them into **one canonical 5-item bottom nav for Employee**, adopting Nav-System-A's structure (it appears on more screens and covers more surface area) but relabeling "More" as an overflow that surfaces the Nav-System-B-only destinations (Assessment Center, Intel/AI Insights) so no screen is orphaned:

```
Dashboard | Twin | Learning | Profile | More
                                        └── More sheet: Assessments, AI Insights, Reports (role-gated), Settings, Logout
```

Admin gets a **separate shell**: left sidebar (desktop) / hamburger drawer (mobile), consistent with the Employee Management screen, containing Dashboard, Employees, Heatmap, Departments, AI Insights, Reports, Integrations, Settings. This avoids force-fitting 8 admin destinations into a 5-item bottom bar.

`REQUIRES CONFIRMATION`: please confirm this merge is acceptable, or tell us which system is canonical if you'd rather not merge.

---

## 6. USER ROLES

| Role | Description | Primary surfaces |
|---|---|---|
| `EMPLOYEE` | Statistical-system staff being assessed/trained | Employee IA (§4) |
| `ADMIN` | HR/workforce-intelligence staff | Admin IA (§4), plus everything Employee can see for their own account |
| `TRAINER` | Content/course owners; not directly visible in the 25 screens | `REQUIRES CONFIRMATION` — inferred from the brief's role list; likely scoped to Course/Assessment authoring, which has no dedicated screen in this file. Backend RBAC includes it; UI screens for it are `REQUIRES CONFIRMATION`. |

RBAC is enforced **on the backend** (middleware + per-route guards) regardless of what the frontend renders — hiding a nav item is a UX convenience only, never a security boundary.

---

## 7. USER JOURNEYS

**J1 — New employee onboarding → first Skill Twin**
Register → Login → Onboarding (dept/role/tenure) → Generate Twin (backend computes initial deterministic score from self-assessment + role mapping) → Dashboard.

**J2 — Close a skill gap**
Dashboard (AI Insight nudge) → Skill Gaps list → Skill Detail → Generate Learning Path → Learning Path Detail → complete modules → Assessment → Results → Skill Twin recalculated → Radar/Dashboard reflect new %.

**J3 — Document-driven micro-learning**
AI Learning Studio → upload doc → AI extracts topics + maps competencies → Generate Assessment → Assessment attempt → Results → competency update.

**J4 — Admin intervention loop**
Admin Dashboard (AI Insight: "ML shortfall") → Deploy Intervention → Heatmap (confirm which depts) → Employee Management (target roster) → Reports (track before/after).

**J5 — AI Tutor support during a course**
Learning Path module → "Ask AI Tutor" → contextual Q&A tied to current module → follow-up questions.

---

## 8. FRONTEND ARCHITECTURE

```
apps/web/src/
├── assets/
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── layout/           # AppShell, AdminShell, TopBar
│   ├── navigation/        # BottomNav, MoreSheet, Sidebar
│   ├── dashboard/         # StatCard, AIInsightBanner
│   ├── skill-twin/        # SkillTwinSummary, RadarChart, GapCard, SkillDetailPanels
│   ├── assessments/       # QuestionCard, ProgressBar, ResultsScoreRing
│   ├── learning/          # CourseCard, PathStepper, FilterPanel
│   ├── ai/                # AIStudioTabs, UploadDropzone, ChatBubble, TopicChips
│   ├── admin/             # Heatmap, EmployeeTable, InterventionCard
│   └── common/            # Badge, Pill, EmptyState, ErrorState, Skeletons
├── pages/
│   ├── auth/               # Login, Register, Onboarding
│   ├── employee/           # Dashboard, SkillGaps, SkillDetail, Radar, Assessments, Courses, AIStudio, Progress, Profile
│   └── admin/               # Dashboard, Heatmap, Employees, Departments, AIInsights, Reports, Integrations
├── layouts/                # EmployeeLayout, AdminLayout, AuthLayout
├── hooks/                    # useAuth, useCompetencies, useSkillGaps, useAssessment, useLearningPath
├── services/                  # http client wrapper, error normalization
├── api/                        # typed API functions per module (React Query)
├── stores/                      # Zustand: auth store, assessment-in-progress store, ui store
├── types/                        # shared DTO types (mirrors packages/types)
├── utils/                        # formatting, gap-priority helpers
├── constants/                     # role enums, route constants
└── router/                         # React Router route tree, role guards
```

State split: **server state** (competencies, gaps, courses, assessments) lives in TanStack Query; **client/UI state** (assessment-in-progress answers, active AI Studio tab, sidebar collapse) lives in Zustand. This avoids duplicating server data into Zustand, a common source of stale-data bugs.

---

## 9. BACKEND ARCHITECTURE

```
apps/api/src/
├── modules/
│   ├── auth/                 # register, login, logout, refresh, me
│   ├── users/                  # profile CRUD
│   ├── departments/
│   ├── job-roles/
│   ├── competencies/            # competency catalogue + scoring
│   ├── assessments/               # catalogue, attempts, scoring
│   ├── skill-gaps/                  # gap + priority computation
│   ├── recommendations/               # learning-path generation
│   ├── courses/
│   ├── learning-paths/
│   ├── progress/
│   ├── documents/                       # upload + AI-service orchestration
│   ├── ai/                                # calls apps/ai via HTTP, never calls an LLM directly
│   ├── igot/                                # IGOTProvider consumer
│   ├── analytics/                              # admin aggregate queries
│   └── admin/                                    # admin-only composite endpoints
├── middleware/                                     # authGuard, roleGuard, rateLimit, errorHandler, auditLog
├── common/                                            # DTOs, validation schemas (zod), pagination helpers
└── main.ts
```

Each module: `*.controller.ts` (routing + validation only) → `*.service.ts` (business logic) → Prisma client (data access). Controllers never touch Prisma directly — keeps scoring/gap logic testable without an HTTP layer.

---

## 10. AI ARCHITECTURE

```ts
// packages/types (shared) or apps/ai contract
interface AIProvider {
  analyzeDocument(input: { text: string; fileType: string }): Promise<{ topics: string[]; competencyMatches: { competency: string; matchPct: number }[] }>;
  generateQuiz(input: { sourceText: string; competencyIds: string[]; questionCount: number }): Promise<GeneratedQuestion[]>;
  tutorReply(input: { moduleContext: string; history: ChatMessage[]; question: string }): Promise<string>;
  explainGap(input: { skill: string; current: number; required: number; roleContext: string }): Promise<string>;
  recommendPath(input: { gaps: SkillGap[]; history: Enrollment[] }): Promise<{ courseIds: string[]; rationale: string }>;
}
```

- `MockAIProvider` (initial, default): deterministic canned/templated responses seeded by input (so demos are stable and reproducible), lives in `apps/ai/app/providers/mock_ai_provider.py`.
- `LLMProvider` (future): same interface, backed by a real model; **never** referenced elsewhere in the codebase except the provider factory.
- Provider selection via `AI_PROVIDER=mock|llm` env var, resolved once at service boot (`apps/ai/app/services/provider_factory.py`).
- **Validation gate**: every AI-generated quiz question is schema-validated (question, ≥2 options, exactly one correct answer, explanation, competency tag) before it's persisted; malformed output is rejected and logged, never silently shown to the user.
- The **official competency score is never written by the AI service** — it only ever produces `Recommendation`/insight rows and draft `GeneratedQuestion` rows that a human or the deterministic scorer consumes.

---

## 11. iGOT ARCHITECTURE

```ts
interface IGOTProvider {
  getCourses(filter?: CourseFilter): Promise<IGOTCourse[]>;
  getCourseById(id: string): Promise<IGOTCourse | null>;
  searchCourses(query: string): Promise<IGOTCourse[]>;
  getCourseSkills(courseId: string): Promise<string[]>;
  getCourseProgress(userId: string, courseId: string): Promise<{ pct: number; lastSyncedAt: Date }>;
}
```

- `MockIGOTProvider` returns static/seeded data resembling the "Learning Ecosystem Integration" screen (synced course counts, last-synced timestamp, a mix of success/error log entries) so the sync-status UI has something real to render.
- The UI **must** show a "DEMO / MOCK INTEGRATION" badge anywhere iGOT data is displayed until `RealIGOTProvider` exists — this directly maps to the "Learning Ecosystem Integration" screen's status card.
- `RealIGOTProvider` is a stub module with a `NotImplementedError`/501 until real API credentials exist — never silently falls back to mock without the badge.

---

## 12. DATABASE ARCHITECTURE (rationale)

- **PostgreSQL + Prisma**, one schema, modeled 1:1 with the module boundaries above.
- Competency scoring inputs (`Assessment` scores, self-assessment, experience, training history) are stored as **discrete, auditable rows**, not just a rolled-up number — `SkillScore` stores the computed value plus a breakdown so the deterministic formula (§19) is always re-derivable and explainable.
- `SkillGap` is a **derived/materialized** table (recomputed on a scheduled job or on-write trigger from `SkillScore` + `RoleCompetency`), not hand-maintained, so gap % and priority are always consistent with the underlying scores.
- `GeneratedQuestion` is kept separate from `Question` — AI drafts are provisional and reviewable before being promoted into a real `Assessment`'s `Question` set (this enforces "never blindly trust LLM output").
- `AuditLog` captures auth events, admin actions (Add Employee, Deploy Intervention), and document uploads — required by the Security section's audit-log mandate.

---

## 13. PRISMA SCHEMA PROPOSAL

```prisma
// prisma/schema.prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

enum Role { EMPLOYEE ADMIN TRAINER }
enum GapPriority { LOW MODERATE HIGH CRITICAL }
enum EnrollmentStatus { NOT_STARTED IN_PROGRESS COMPLETED }
enum CourseProvider { IGOT INTERNAL MOCK }
enum DocumentStatus { UPLOADED PROCESSING PROCESSED FAILED }
enum QuestionDifficulty { BEGINNER INTERMEDIATE ADVANCED }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          Role     @default(EMPLOYEE)
  departmentId  String?
  jobRoleId     String?
  yearsOfService Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  department        Department?        @relation(fields: [departmentId], references: [id])
  jobRole           JobRole?           @relation(fields: [jobRoleId], references: [id])
  skillScores       SkillScore[]
  skillGaps         SkillGap[]
  attempts          AssessmentAttempt[]
  enrollments       Enrollment[]
  progress          Progress[]
  documents         Document[]
  recommendations   Recommendation[]
  auditLogs         AuditLog[]

  @@index([departmentId])
  @@index([jobRoleId])
}

model Department {
  id    String @id @default(cuid())
  name  String @unique
  users User[]
  jobRoles JobRole[]
}

model JobRole {
  id            String @id @default(cuid())
  title         String
  departmentId  String?
  department    Department? @relation(fields: [departmentId], references: [id])
  users         User[]
  roleCompetencies RoleCompetency[]

  @@unique([title, departmentId])
}

model Competency {
  id          String @id @default(cuid())
  name        String @unique
  cluster     String   // e.g. "Statistical Analysis", "Technical Execution"
  description String?

  roleCompetencies RoleCompetency[]
  skillScores       SkillScore[]
  skillGaps         SkillGap[]
  courseSkills      CourseSkill[]
  questions         Question[]
  generatedQuestions GeneratedQuestion[]
}

model RoleCompetency {
  id             String @id @default(cuid())
  jobRoleId      String
  competencyId   String
  requiredScore  Int      // 0-100 target
  importance     Int      @default(50) // 0-100, drives priority weighting

  jobRole    JobRole    @relation(fields: [jobRoleId], references: [id])
  competency Competency @relation(fields: [competencyId], references: [id])

  @@unique([jobRoleId, competencyId])
}

model SkillScore {
  id                 String   @id @default(cuid())
  userId             String
  competencyId       String
  assessmentComponent Float   // 0-100, weighted input
  selfComponent       Float
  experienceComponent Float
  trainingComponent   Float
  currentScore        Float   // computed, see §19
  trend                Float   @default(0) // delta vs previous score
  lastAssessedAt       DateTime?
  updatedAt             DateTime @updatedAt

  user       User       @relation(fields: [userId], references: [id])
  competency Competency @relation(fields: [competencyId], references: [id])

  @@unique([userId, competencyId])
  @@index([userId])
}

model SkillGap {
  id             String      @id @default(cuid())
  userId         String
  competencyId   String
  currentScore   Float
  requiredScore  Float
  gapPct         Float
  priorityScore  Int         // 0-100, see §20
  priorityBand   GapPriority
  computedAt     DateTime    @default(now())

  user       User       @relation(fields: [userId], references: [id])
  competency Competency @relation(fields: [competencyId], references: [id])

  @@unique([userId, competencyId])
  @@index([userId, priorityScore])
}

model Assessment {
  id            String   @id @default(cuid())
  title         String
  description   String?
  competencyId  String?
  difficulty    QuestionDifficulty @default(INTERMEDIATE)
  durationMins  Int      @default(30)
  isAiGenerated Boolean  @default(false)
  createdAt     DateTime @default(now())

  competency Competency? @relation(fields: [competencyId], references: [id])
  questions  Question[]
  attempts   AssessmentAttempt[]
}

model Question {
  id             String   @id @default(cuid())
  assessmentId   String
  competencyId   String?
  prompt         String
  options        Json     // string[]
  correctIndex   Int
  explanation    String?
  difficulty     QuestionDifficulty @default(INTERMEDIATE)
  order          Int      @default(0)

  assessment Assessment  @relation(fields: [assessmentId], references: [id])
  competency Competency? @relation(fields: [competencyId], references: [id])
  answers    Answer[]

  @@index([assessmentId])
}

model AssessmentAttempt {
  id           String   @id @default(cuid())
  userId       String
  assessmentId String
  startedAt    DateTime @default(now())
  submittedAt  DateTime?
  scorePct     Float?
  correctCount Int?
  totalCount   Int?

  user       User       @relation(fields: [userId], references: [id])
  assessment Assessment @relation(fields: [assessmentId], references: [id])
  answers    Answer[]

  @@index([userId])
  @@index([assessmentId])
}

model Answer {
  id            String @id @default(cuid())
  attemptId     String
  questionId    String
  selectedIndex Int
  isCorrect     Boolean

  attempt  AssessmentAttempt @relation(fields: [attemptId], references: [id])
  question Question          @relation(fields: [questionId], references: [id])

  @@unique([attemptId, questionId])
}

model Course {
  id           String         @id @default(cuid())
  title        String
  description  String?
  provider     CourseProvider @default(INTERNAL)
  providerRef  String?        // external ID for iGOT/etc.
  difficulty   QuestionDifficulty @default(INTERMEDIATE)
  durationHrs  Float?
  url          String?
  rating       Float?
  createdAt    DateTime       @default(now())

  courseSkills      CourseSkill[]
  learningPathItems LearningPathItem[]
  enrollments       Enrollment[]
}

model CourseSkill {
  id           String @id @default(cuid())
  courseId     String
  competencyId String
  weight       Int    @default(50) // relevance 0-100

  course     Course     @relation(fields: [courseId], references: [id])
  competency Competency @relation(fields: [competencyId], references: [id])

  @@unique([courseId, competencyId])
}

model LearningPath {
  id          String   @id @default(cuid())
  userId      String
  title       String
  rationale   String?  // AI explanation text
  createdAt   DateTime @default(now())

  user  User @relation(fields: [userId], references: [id])
  items LearningPathItem[]

  @@index([userId])
}

model LearningPathItem {
  id             String   @id @default(cuid())
  learningPathId String
  courseId       String
  order          Int
  status         EnrollmentStatus @default(NOT_STARTED)

  learningPath LearningPath @relation(fields: [learningPathId], references: [id])
  course       Course       @relation(fields: [courseId], references: [id])

  @@unique([learningPathId, courseId])
}

model Enrollment {
  id         String           @id @default(cuid())
  userId     String
  courseId   String
  status     EnrollmentStatus @default(NOT_STARTED)
  enrolledAt DateTime         @default(now())
  completedAt DateTime?

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}

model Progress {
  id          String   @id @default(cuid())
  userId      String
  courseId    String?
  pct         Float    @default(0)
  hoursLogged Float    @default(0)
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}

model Document {
  id            String         @id @default(cuid())
  userId        String
  fileName      String
  fileType      String
  fileSizeBytes Int
  status        DocumentStatus @default(UPLOADED)
  extractedText String?
  uploadedAt    DateTime       @default(now())

  user     User               @relation(fields: [userId], references: [id])
  quizzes  GeneratedQuiz[]

  @@index([userId])
}

model GeneratedQuiz {
  id          String   @id @default(cuid())
  documentId  String
  createdAt   DateTime @default(now())
  promotedToAssessmentId String?

  document  Document           @relation(fields: [documentId], references: [id])
  questions GeneratedQuestion[]
}

model GeneratedQuestion {
  id            String   @id @default(cuid())
  quizId        String
  competencyId  String?
  prompt        String
  options       Json
  correctIndex  Int
  explanation   String
  difficulty    QuestionDifficulty @default(INTERMEDIATE)
  sourceRef     String?  // page/section reference in source doc
  confidence    Float    // 0-1, from AI provider
  validated     Boolean  @default(false)

  quiz       GeneratedQuiz @relation(fields: [quizId], references: [id])
  competency Competency?   @relation(fields: [competencyId], references: [id])
}

model Recommendation {
  id           String   @id @default(cuid())
  userId       String
  competencyId String?
  message      String
  kind         String   // "gap_explanation" | "path_suggestion" | "org_insight"
  createdAt    DateTime @default(now())

  user       User        @relation(fields: [userId], references: [id])
  competency Competency? @relation(fields: [competencyId], references: [id])

  @@index([userId])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String   // "LOGIN" | "ADD_EMPLOYEE" | "DEPLOY_INTERVENTION" | "DOCUMENT_UPLOAD" | ...
  meta      Json?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
}
```

---

## 14. API SPECIFICATION (selected — full CRUD parity across all listed routes)

Format per endpoint: Method · Route · Auth · Roles · Request · Response · Errors.

### Auth
- `POST /api/auth/register` · public · — · `{firstName,lastName,email,password,departmentId,jobRoleId,yearsOfService}` → `201 {user, accessToken}` · `409` email taken, `422` validation
- `POST /api/auth/login` · public · — · `{email,password}` → `200 {user, accessToken, refreshToken}` · `401` invalid credentials
- `GET /api/auth/me` · JWT · any · — → `200 {user}` · `401`
- `POST /api/auth/logout` · JWT · any · — → `204`

### Competencies
- `GET /api/competencies/me` · JWT · EMPLOYEE,ADMIN · — → `200 {skillScores: SkillScore[]}`
- `GET /api/competencies/:id` · JWT · any → `200 {competency, roleCompetency?}` · `404`

### Skill Gaps
- `GET /api/skill-gaps` · JWT · EMPLOYEE (own), ADMIN (any via `?userId=`) → `200 {gaps: SkillGap[]}` sorted by `priorityScore desc`
- `GET /api/skill-gaps/:id` · JWT → `200 {gap, explanation}` (explanation from `AIProvider.explainGap`, cached)

### Assessments
- `GET /api/assessments` · JWT → `200 {assessments[]}`
- `GET /api/assessments/:id` · JWT → `200 {assessment, questions[] (no correctIndex)}`
- `POST /api/assessments/:id/start` · JWT → `201 {attemptId}`
- `POST /api/assessments/:id/submit` · JWT · body `{attemptId, answers:[{questionId,selectedIndex}]}` → `200 {scorePct, correctCount}` — **scoring happens server-side only**; triggers `SkillScore`/`SkillGap` recompute job
- `GET /api/assessments/:id/results` · JWT → `200 {attempt, strengths[], weakAreas[], aiInsight}`

### Courses / Learning
- `GET /api/courses` · JWT · query `competencyId?,provider?,difficulty?` → `200 {courses[]}`
- `GET /api/courses/:id` · JWT → `200 {course, aiMatch?}`
- `GET /api/courses/recommended` · JWT → `200 {courses[], rationale}`
- `GET /api/learning-paths` · JWT → `200 {paths[]}`
- `POST /api/learning-paths/generate` · JWT · body `{competencyId?}` → `201 {path}` (calls `AIProvider.recommendPath` + `IGOTProvider`)
- `GET /api/learning-paths/:id` · JWT → `200 {path, items[]}`

### Progress
- `GET /api/progress` · JWT → `200 {growthSeries[], totalHours, assessmentScores[], completedCourses[]}`

### Documents / AI
- `POST /api/documents` · JWT · multipart (PDF/DOCX/PPTX, size-limited) → `201 {document}` · `415` unsupported type, `413` too large
- `GET /api/documents` / `GET /api/documents/:id` · JWT
- `POST /api/ai/analyze-document` · JWT · `{documentId}` → `200 {topics[], competencyMatches[]}`
- `POST /api/ai/generate-quiz` · JWT · `{documentId, questionCount}` → `201 {quizId, questions[]}` (validated, `validated:true` before persist)
- `POST /api/ai/tutor` · JWT · `{moduleContext, history[], question}` → `200 {reply}`

### Admin
- `GET /api/admin/dashboard` · JWT · ADMIN → `200 {totalEmployees, avgCompetency, criticalGaps, trend, insights[]}`
- `GET /api/admin/employees` · JWT · ADMIN · query `search?,departmentId?,readinessMin?,page?` → `200 {employees[], total}`
- `GET /api/admin/departments` · JWT · ADMIN → `200 {departments[], readinessByDept[]}`
- `GET /api/admin/skill-gaps` · JWT · ADMIN → `200 {heatmap: {dept, competency, score}[]}`
- `GET /api/admin/analytics` · JWT · ADMIN · query `period?` → `200 {overallReadiness, activeEmployees, criticalGaps, deltas}`
- `GET /api/admin/reports` · JWT · ADMIN · query `type,format(pdf|csv)` → `200` (stream) or `202 {reportId}` async

### iGOT
- `GET /api/igot/status` · JWT · ADMIN → `200 {active, lastSyncedAt, syncedCourses, progressSyncPct, logs[]}` (always includes `isMock:true` currently)
- `GET /api/igot/courses` / `GET /api/igot/courses/:id` · JWT → proxied through `IGOTProvider`

Every route: JWT verified by `authGuard`, role checked by `roleGuard(...)`, body validated by zod DTO before hitting the service layer, all errors normalized to `{error:{code,message}}` with no stack traces leaked.

---

## 15. SCREEN → API MAPPING (all 25 screens)

| Screen | Endpoints called |
|---|---|
| Onboarding | `GET /api/departments`, `GET /api/job-roles`, `POST /api/users/me` (init profile), triggers initial `SkillScore` seed |
| Landing | none (static/public) |
| Employee Dashboard | `GET /api/auth/me`, `GET /api/competencies/me`, `GET /api/skill-gaps`, `GET /api/courses/recommended`, `GET /api/progress` |
| Skill Gap Intelligence | `GET /api/skill-gaps` |
| Skill Detail | `GET /api/competencies/:id`, `GET /api/skill-gaps/:id`, `POST /api/learning-paths/generate` |
| AI Competency Radar | `GET /api/competencies/me` |
| Assessment — Question | `GET /api/assessments/:id`, `POST /api/assessments/:id/submit` (on final Q) |
| Learning Path Detail | `GET /api/learning-paths/:id` |
| AI Learning Studio (Quiz) | `POST /api/documents`, `POST /api/ai/analyze-document`, `POST /api/ai/generate-quiz` |
| Admin Dashboard | `GET /api/admin/dashboard` |
| Workforce Heatmap | `GET /api/admin/skill-gaps` |
| iGOT Integration | `GET /api/igot/status` |
| Login | `POST /api/auth/login` |
| Assessment Results | `GET /api/assessments/:id/results` |
| AI Tutor | `POST /api/ai/tutor` |
| Employee Management | `GET /api/admin/employees`, `POST /api/admin/employees` (Add Employee) |
| Departmental Analytics | `GET /api/admin/analytics` |
| Learning Progress | `GET /api/progress` |
| System Reporting | `GET /api/admin/reports` |
| Assessment Center | `GET /api/assessments` |
| Learning Paths/Courses list | `GET /api/courses`, `GET /api/learning-paths` |
| Course Detail | `GET /api/courses/:id`, `POST /api/enrollments` (Start Learning) |
| AI Insights | `GET /api/admin/dashboard` (insights slice) or dedicated `GET /api/admin/ai-insights` — `IMPLEMENTATION DECISION`: add this as a distinct paginated endpoint rather than overloading dashboard |
| Register | `POST /api/auth/register` |
| Settings | `GET/PATCH /api/users/me`, `PATCH /api/users/me/preferences` |

---

## 16. ROUTE MAP

See §4 (Information Architecture) — the tree there is the authoritative route map; §5 documents the nav-shell resolution.

---

## 17. AUTHENTICATION ARCHITECTURE

- Passwords hashed with **bcrypt** (cost 12) — matches the Register screen's "≥12 chars + special symbols" policy hint.
- JWT **access token** (short-lived, ~15 min) + **refresh token** (httpOnly cookie, ~7 days, rotated on use).
- `Secure Authentication` button on Login maps to standard email+password; `Access Demo Environment` maps to a seeded demo account login — **not** a bypass of auth (`IMPLEMENTATION DECISION`: implement as a real login against a pre-seeded demo user, not an auth-skip route).
- `.env.example` includes `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` — secrets never sent to the frontend.

---

## 18. RBAC

- Enforced via `roleGuard(['ADMIN'])` middleware on every admin route — never via frontend conditional rendering alone.
- Frontend still hides nav items/buttons per role for UX, but every hidden action is independently guarded server-side.
- `TRAINER` role: `REQUIRES CONFIRMATION` — no screen exists for it in the 25 supplied; scoped in the schema/middleware but its UI surface is undefined pending your input.

---

## 19. COMPETENCY ENGINE

Deterministic, per the brief's fixed weights:

```
currentScore =
    assessmentComponent   * 0.60
  + selfComponent          * 0.20
  + experienceComponent     * 0.10
  + trainingComponent        * 0.10
```

- `requiredScore` comes from `RoleCompetency.requiredScore` for the user's `jobRoleId`.
- Recomputed whenever an `AssessmentAttempt` is submitted, or `TrainingHistory`-relevant events occur (course completion), via a `recomputeSkillScore(userId, competencyId)` service — never computed ad hoc in a controller.
- AI never writes `currentScore` — it only reads it to generate `Recommendation.message` (the "Why This Matters" / "AI Insight" text seen throughout the screens).

---

## 20. SKILL GAP ENGINE

```
gapPct = max(0, requiredScore - currentScore)

priorityScore = round(
    (gapPct / 100)        * 0.5      // severity
  + (roleImportance / 100) * 0.35     // RoleCompetency.importance
  + (recencyFactor)          * 0.15    // 1.0 if assessed <30d ago, decaying to 0.4 beyond 180d
) * 100

priorityBand =
    priorityScore >= 80 ? CRITICAL
  : priorityScore >= 60 ? HIGH
  : priorityScore >= 35 ? MODERATE
  : LOW
```

This maps directly onto the "CRITICAL / Priority: 92/100" style badges seen on the Skill Gap Intelligence and Heatmap screens. The exact weights (0.5/0.35/0.15) are an `IMPLEMENTATION DECISION` — expose them via a config table/env so they're tunable without a redeploy.

---

## 21. RECOMMENDATION ENGINE

Input: `SkillGap[]` (priority-sorted) + `Enrollment` history + `CourseSkill` mappings.
Process: for the top-N unresolved critical/high gaps, select courses whose `CourseSkill.weight` for that competency is highest and that the user hasn't completed; sequence by prerequisite (`REQUIRES CONFIRMATION`: prerequisite chaining isn't modeled in the schema draft above beyond `LearningPathItem.order` — add a `prerequisiteCourseId` on `Course` if strict gating is required, matching the "Locked ... Requires Prev. Module" state seen on the Learning Path Detail screen).
Output: persisted `LearningPath` + `Recommendation` row with `AIProvider.recommendPath`'s rationale text — this is the literal source of the "Why SkillTwin recommended this" copy on-screen.

---

## 22. LEARNING PATH ENGINE

- A `LearningPath` is a named, ordered sequence of `Course`s for one competency goal.
- Item status (`NOT_STARTED / IN_PROGRESS / COMPLETED`) drives the Stepper UI (Completed / In Progress / Locked) on the Learning Path Detail screen.
- Completing the final item in a path triggers a `SkillScore` recompute and closes/updates the linked `SkillGap`.

---

## 23. AI DOCUMENT → QUIZ PIPELINE

```
Upload (PDF/DOCX/PPTX, size+type validated)
  → Document row (status=UPLOADED)
  → apps/api enqueues processing (sync call for MVP; queue for scale)
  → apps/ai: extract text (pdf/docx/pptx parsers)
  → apps/ai: AIProvider.analyzeDocument → topics[], competencyMatches[]
  → apps/ai: AIProvider.generateQuiz → GeneratedQuestion[]
  → apps/api: schema-validate each question (options≥2, exactly one correct, explanation present)
  → invalid questions rejected + logged; valid ones saved (validated=true)
  → GeneratedQuiz surfaced in "Assessment Preview"
  → user can promote quiz → real Assessment (creates Question rows from GeneratedQuestion)
  → user takes it like any other assessment
```

Matches the AI Learning Studio screen's dropzone → "Topics Detected" → "Competencies Mapping" → "Assessment Preview" sequence exactly.

---

## 24. AI TUTOR ARCHITECTURE

- Stateless per-request initially: `{moduleContext, history[], question}` → `AIProvider.tutorReply`.
- `history` is client-held (Zustand) and replayed each call in the MVP; `REQUIRES CONFIRMATION` whether tutor conversations should persist server-side for audit/continuity — the screen doesn't show a "past conversations" affordance, so MVP treats sessions as ephemeral.
- Architected so a RAG layer (`apps/ai/app/rag/`) can later inject retrieved course-material chunks into the prompt without changing the `AIProvider` interface.

---

## 25. ADMIN ANALYTICS

- `GET /api/admin/dashboard` aggregates: `COUNT(User)`, `AVG(SkillScore.currentScore)`, `COUNT(SkillGap WHERE priorityBand=CRITICAL)`.
- Heatmap (`GET /api/admin/skill-gaps`) groups `SkillScore` by `Department × Competency`, bucketed into the 4-tier legend (Critical Gap 0–39 / Developing 40–69 / Proficient 70–89 / Expert 90–100) — matching the Heatmap screen's legend exactly.
- Departmental Analytics period filter (`Q3 2024`) implies analytics snapshots; `IMPLEMENTATION DECISION`: store periodic aggregate snapshots (`AnalyticsSnapshot` table, not in the base schema above — add if QoQ deltas need to survive score recomputation) rather than computing deltas live against a moving-target current score.

---

## 26. SECURITY

- **Helmet** (secure headers), **CORS** (locked to `CORS_ORIGIN`), **express-rate-limit** on auth + AI routes.
- Input validation via **zod** DTOs on every mutating route.
- File uploads: MIME-type allowlist (PDF/DOCX/PPTX only), max size enforced both client- and server-side, files scanned for type by content-sniffing, not just extension.
- `AuditLog` rows for: login, logout, register, Add Employee, Deploy Intervention, document upload, quiz generation.
- Never exposed to frontend: `DATABASE_URL`, `JWT_*_SECRET`, any future AI API key, internal stack traces (errors normalized through a single error-handling middleware).

---

## 27. TESTING STRATEGY

| Layer | Tool | Coverage target |
|---|---|---|
| Backend unit | Vitest/Jest | Competency engine, gap engine, priority scoring — pure functions, table-driven tests |
| Backend integration | Supertest + test DB | Auth flow, RBAC denial cases, assessment submit → score → gap recompute chain |
| AI service | pytest | Mock provider determinism, quiz-question schema validation (reject malformed) |
| Frontend component | Vitest + React Testing Library | GapCard, StatCard, Stepper, ChatBubble render/interaction states |
| E2E | Playwright | Register→Onboard→Dashboard; take assessment→see results→gap updates; upload doc→generate quiz→take it; admin login→heatmap→deploy intervention |

---

## 28. DEPLOYMENT ARCHITECTURE

- **Frontend**: Vercel (Vite build output)
- **Backend** (`apps/api`) and **AI service** (`apps/ai`): Render, separate services
- **Database**: managed PostgreSQL (Render Postgres or equivalent)
- Env vars: `DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, API_URL, AI_SERVICE_URL, CORS_ORIGIN, AI_PROVIDER, IGOT_PROVIDER`

---

## 29. DOCKER STRATEGY

`docker-compose.yml` (dev): `postgres`, `api`, `ai` services; `web` runs via `vite dev` on host (not containerized in dev, per brief). Each service has its own `Dockerfile` for prod builds (multi-stage: install → build → slim runtime image).

---

## 30. ENVIRONMENT VARIABLES

```
DATABASE_URL=postgresql://user:pass@host:5432/skilltwin
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
API_URL=http://localhost:4000
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=mock
IGOT_PROVIDER=mock
MAX_UPLOAD_MB=15
```

---

## 31. REPOSITORY STRUCTURE

```
skilltwin/
├── apps/
│   ├── web/   (React/Vite)
│   ├── api/   (Express/TS)
│   └── ai/    (FastAPI)
├── packages/
│   ├── types/   (shared DTOs/enums)
│   └── config/  (eslint/tsconfig bases)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
├── docker-compose.yml
├── .env.example
├── package.json
├── README.md
└── .gitignore
```

---

## 32. DEVELOPMENT PHASES

Phases 0–19 as specified in the brief (repo init → shell/design system → DB/Prisma → auth/RBAC → depts/roles/competencies → assessment engine → skill twin → gap engine → courses → recommendations → learning paths → AI service/mock → document processing → AI quiz → AI tutor → iGOT adapter → admin analytics → security hardening → testing → deployment). Every phase ends with: app runs, migrations apply cleanly, seed data loads, at least the phase's own tests pass.

---

## 33. ACCEPTANCE CRITERIA

Mirrors the "FINAL VERIFICATION" checklist in the brief verbatim — all 25 confirmed screens implemented and matched against these exports; navigation resolved per §5; RBAC enforced backend-side; scoring deterministic and backend-only; AI/iGOT clearly marked as mock; no secrets committed.

---

## 34. RISKS AND MITIGATIONS

| Risk | Mitigation |
|---|---|
| Design tokens are estimates, not ground truth | Ship with an easily-editable Tailwind theme file; flag for design QA pass once real Figma access exists |
| Nav-system conflict could resurface mid-build if more screens appear | §5 resolution is documented as the single source of truth; any new screen gets slotted into the merged IA, not a third system |
| AI-generated quiz content could be low-quality or wrong | Mandatory schema validation + `validated` flag + human-promotable-only flow before it becomes a real graded `Assessment` |
| iGOT "Active" status could be mistaken for a real integration | Persistent DEMO/MOCK badge wherever iGOT data renders |
| Competency score could silently drift from AI influence | Scoring formula is a pure backend function with no AI dependency in its call path — enforced by module boundary, testable in isolation |
| Missing 26th screen | Documented as `REQUIRES CONFIRMATION`; nothing invented to compensate |

---

## 35. TECHNICAL DECISIONS (index of all IMPLEMENTATION DECISIONs above)

1. §5 — Merge Nav-System-A + B into one Employee bottom nav + overflow sheet; separate Admin sidebar shell.
2. §13 — `SkillGap` modeled as a derived table, recomputed rather than hand-edited.
3. §17 — "Access Demo Environment" is a real login against a seeded demo user, not an auth bypass.
4. §15 — AI Insights gets its own `GET /api/admin/ai-insights` endpoint rather than piggybacking on the dashboard payload.
5. §20 — Priority-score weights (0.5/0.35/0.15) exposed as tunable config, not hardcoded constants.
6. §21 — Add `prerequisiteCourseId` to `Course` if strict "Locked" gating (seen on Learning Path Detail) needs enforcing beyond simple ordering.
7. §25 — Consider an `AnalyticsSnapshot` table if the Departmental Analytics QoQ deltas must survive score recomputation.

---

## 36. FINAL ANTIGRAVITY MASTER DEVELOPMENT PROMPT

```
You are building SKILLTWIN, an AI-powered Competency Intelligence and
Personalized Learning Platform for government statistical-system
employees, from an EMPTY FOLDER.

The full technical specification you must follow is attached as
SkillTwin-Technical-Specification.md. It is your single source of
truth for: the 25-screen Figma audit, design system, information
architecture, database schema (Prisma), API spec, screen-to-API
mapping, competency/skill-gap/recommendation engines, AI and iGOT
provider architecture, security requirements, and phased plan.

HARD RULES — DO NOT VIOLATE:
- Do not invent screens beyond the 25 documented. Where a screen or
  detail is marked REQUIRES CONFIRMATION, build the most reasonable
  version and clearly comment it as such in code — do not silently
  guess and move on.
- Do not build a generic SaaS dashboard. Reproduce the documented
  screens, components, and navigation resolution (see §5) closely.
- Do not compute competency scores or skill gaps in the frontend.
  All scoring is backend-only, deterministic, per §19-20.
- Do not let the AI service (apps/ai) write official competency
  scores. It only produces explanations, recommendations, and
  draft quiz questions that pass schema validation before being
  persisted.
- Do not implement a real LLM or real iGOT API. Build MockAIProvider
  and MockIGOTProvider behind the AIProvider / IGOTProvider
  interfaces from §10-11. Show a DEMO/MOCK badge wherever iGOT data
  renders.
- Do not put everything in one file. Follow the module boundaries
  in §8-9.
- Do not use localStorage as a database. Postgres + Prisma only.
- Do not skip authentication, RBAC, validation, error handling,
  responsive design, or tests for the sake of speed.
- Do not build the entire app in one shot. Follow the phases in
  §32 (Phase 0 → Phase 19). After each phase: run the app, run
  that phase's tests, fix any failures, and only then continue.

WORKFLOW FOR EVERY PHASE:
1. Re-read the relevant section(s) of the spec before writing code.
2. Implement the phase vertically (DB → API → frontend → tests) for
   whatever feature that phase covers — not horizontally across all
   screens first.
3. Run the app. Confirm it starts without errors.
4. Run tests for what you just built. Fix failures before moving on.
5. Compare any new screen against its entry in §2's screen audit
   table before considering it done.
6. Only then proceed to the next phase.

BEGIN AT PHASE 0: repository initialization per §31's structure,
then Phase 1 (design system + application shell) using the design
tokens in §3 (clearly marked as estimated — implement them as an
editable theme, not hardcoded magic numbers).

Stop and flag to the user (do not guess past it) if you hit anything
marked REQUIRES CONFIRMATION in the spec and it materially changes
what you're about to build.
```
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-05T08:17:16+05:30.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Claude Sonnet 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>