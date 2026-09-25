# Adalyn Interview Prep — Feature Scope & Roadmap

Target: Software Engineering Intern interviews (Summer 2027 cycle). The interview target lives in `src/target.js`; every AI prompt calibrates against it.

Current state: Tauri desktop app with AI-powered knowledge chapters, multi-mode quiz (multiple-choice + flashcards), coding practice with an AI interviewer, OOD design practice, progress dashboard, resume analyzer, BQ prep (BQ store + STAR story builder), and job application prep with resume bullet matching.

---

## ✅ Shipped

### ✅ Knowledge Base + Quiz Engine
AI ingests a doc URL (or pasted content), generates a structured knowledge framework, and produces multiple-choice questions. Chapters are organized into folders with drag-and-drop reordering. Per-chapter quiz history and score tracking persisted in localStorage.

### ✅ Flashcard Mode
Third study tab alongside Knowledge and Quiz. Claude generates open-ended flashcard prompts per chapter. Cards flip on tap; user self-rates ✓ / ✗. Session tracks pass/fail counts. Separate regenerate flow to refresh cards.

### ✅ Progress Dashboard
Sidebar shortcut and home-screen view aggregating: overall readiness score, per-chapter mastery heat-map (green/yellow/red), weakest-chapter callout with quick-jump, total quiz questions answered, and chapter-level quiz + flashcard history.

### ✅ Resume Analyzer
Multi-resume library. Each resume uploaded via PDF (Rust `pdf-extract`) or pasted text + filename chip UX. Claude extracts experience bullets grouped by role. Each bullet (work experience or project): click to generate intern-calibrated resume deep-dive questions, record and polish answers, analyze answer quality. Inline loading states; collapsible sections.

### ✅ BQ Prep — BQ Store + STAR Story Builder *(bonus, beyond original scope)*
Standalone sidebar section decoupled from Resume Analyzer. Two sub-tabs:
- **BQ Store**: 16 pre-loaded intern behavioral questions across 8 categories (Motivation, Learning, Teamwork, Conflict, Failure, Ownership, Ambiguity, User Focus), including "Tell me about yourself" and "Why software engineering?". User can add custom BQs. Each BQ links to a STAR story and one-click fine-tunes a ≤250-word Claude-crafted answer targeted to that specific question.
- **Story Store**: Full STAR story editor (Situation / Task / Action / Result) with competency tagging and AI polish.

### ✅ Job Application Preparation
Standalone sidebar section. Company-grouped homepage (levels.fyi-style card grid). Add a job posting by URL → `fetch_url` (Tauri) → Claude extracts company, title, level, summary, responsibilities, required/nice-to-have skills → auto-groups under company card. Posting detail: link a resume, then one-click bullet match (Claude scores each resume bullet 0–10 for relevance, sorted descending with relevance note).

### ✅ Coding Practice
17 intern-level problems across 11 patterns (arrays & hashing, two pointers, sliding window, stack, binary search, linked list, trees, graphs, heap, intervals, DP), plus AI-generated problems per pattern. The flow mirrors a real round: write your approach and complexity first, code in Python / Java / TypeScript / C++, ask for up to 3 progressive hints, then submit to an AI interviewer that returns a rubric scorecard (correctness, complexity, edge cases, code quality, communication), a hire verdict, and a follow-up question. Attempts and verdict history persist and feed the dashboard.

### ✅ OOD Design Practice
10 classic object-oriented design problems with Python/Java skeletons and test scenarios; AI reviews class design, encapsulation, patterns, and scenario coverage.

---

## Tier 1 — Next Up

### 1. Mock Interview Mode (Timed Session)
**Problem**: Real interviews are timed and mixed-topic. Practicing one topic at a time doesn't simulate pressure.

**Idea**: A 45-minute session shaped like a real intern round: 5 minutes of behavioral questions drawn from the BQ Store, then one or two coding problems picked from patterns the user is weakest in, with a countdown timer. The AI interviewer asks follow-ups after each answer and scores the whole session at the end.

**Why it matters**: Intern loops are usually two 45-minute coding rounds with a few behavioral questions mixed in. Practicing under that time pressure, and switching between talking and coding, is the real test.

---

### 2. Weak-Spot AI Analysis
**Problem**: User doesn't know *why* they're failing — just that they scored 6/10.
**Idea**: After 3+ quiz sessions on a topic, a "Diagnose" button sends all answer history to Claude. Claude returns a 3-bullet analysis: "You consistently miss questions about ___, you confuse ___ with ___, and your weakest area is ___." Displayed inline above the quiz history.

---

### 3. Resume Project Deep-Dive Drill
**Problem**: Interviewers often open with "walk me through a project on your resume" and keep drilling down.
**Idea**: Pick a project from the Resume Analyzer; the AI interviewer asks one question at a time and follows up based on the previous answer (how it works, why this design, what broke, what you'd change), then grades the whole thread.

---

## Tier 2 — Nice to Have

### System Design Scratchpad
Rarely asked of interns, but useful later for new-grad and full-time loops: requirements template, capacity estimates, component checklist, and AI critique.

### 4. Export to Anki / PDF
Export study notes as Anki flashcard deck (`.apkg`) or clean PDF for offline review.

### 5. Study Plan Generator
User inputs interview date → AI generates a week-by-week study plan across all saved topics, weighted by current quiz scores. Displayed as a calendar-style view.

### 6. Voice Quiz Mode
Text-to-speech reads the question aloud; user answers by clicking an option. Useful for review while away from the keyboard (commute, gym).

---

## What NOT to Build (Scope Guard)

- **Code execution / online judge**: Coding Practice reviews code with an AI interviewer; running code against hidden test suites is out of scope.
- **Collaborative / multi-user**: Desktop-only, single-user by design.
- **Video content / YouTube integration**: Out of scope; this is a notes + AI tool.
- **Networking / leaderboards**: No backend, all data stays local.

---

## Priority Order

| Status | Feature | Effort | Impact |
|--------|---------|--------|--------|
| ✅ Done | Knowledge Base + Quiz Engine | M | Very High |
| ✅ Done | Flashcard Mode | S | High |
| ✅ Done | Progress Dashboard | S | High |
| ✅ Done | Resume Analyzer + STAR Builder | M | Very High |
| ✅ Done | BQ Prep (BQ Store + Story Store) | M | Very High |
| ✅ Done | Job Application Preparation | M | Very High |
| ✅ Done | Coding Practice (AI interviewer scorecard) | M | Very High |
| ✅ Done | OOD Design Practice | M | High |
| ⬜ Next | Mock Interview Mode (timed intern round) | M | Very High |
| ⬜ Next | Weak-Spot AI Analysis | M | High |
| ⬜ Next | Resume Project Deep-Dive Drill | M | High |
| ⬜ Later | System Design Scratchpad | L | Low (for interns) |
| ⬜ Later | Export / Study Plan / Voice | L | Low-Med |

---

## Future Vision

### V. Cross-Platform with Cloud Sync & Accounts
**Vision**: Support web, desktop (Windows/macOS/Linux), iOS, and Android from a single product. Users sign in with Gmail or create an account. All user-created content — resumes, STAR stories, knowledge chapters, quiz history, flashcard progress — lives in the cloud and is fully consistent across every client. No "this is a desktop-only feature"; the experience is identical regardless of device.

**Key requirements**:
- Auth: Google OAuth ("Sign in with Gmail") + email/password option
- Backend: Cloud data store synced in real-time; local-first with offline support and eventual sync
- Data ownership: User can export or delete all their data at any time
- The current Tauri desktop app becomes one client among many, sharing the same API layer

---

### VI. Beta Invitation Code Gate
**Vision**: Before public launch, gate access with a single-use invitation code mechanism so growth is controlled and early users are vetted.

**Behavior**:
- New users land on a locked sign-up page requiring an invitation code before they can create an account
- Codes are alphanumeric, single-use, and issued manually or in batches by the team
- After a valid code is consumed, the account is fully unlocked with no further restrictions
- Admin panel (even a simple spreadsheet-backed one) to generate, track, and revoke codes
- The gate is removed entirely when moving to public launch

---

### VII. Universal Career Interview Platform
**Vision**: Expand beyond SDE internships to support a wide range of job interviews across industries, levels, and roles.

**Examples of scope expansion**:
- Engineering levels: L3–L7, Staff, Principal, VP Engineering
- Companies: Meta E5/E6, Amazon L5/L6, Microsoft L62–L65, startup CTO, etc.
- Roles beyond SWE: Product Manager, Engineering Manager, Data Scientist, ML Engineer, Designer, Finance, Consulting, Law, Medicine (residency/fellowship), MBA programs
- Users select their target role + company + level at onboarding; AI prompts, rubrics, and feedback are calibrated accordingly
- Knowledge chapters, quiz questions, and behavioral frameworks are all role-aware

---

### VIII. Career Asset Management Platform
**Vision**: Evolve into a combination of **Amazon Forte** (career achievement tracking) and **Hello Interview** (structured interview prep), positioning as a comprehensive **Career Asset Management** platform.

**Core pillars**:

1. **Career Asset Ledger** *(Amazon Forte analog)*
   - A running, searchable record of everything the user has shipped: projects, PRs, incidents owned, cross-team collaborations, promotions, awards
   - Each entry is structured (title, date, scope, metrics, learnings) and tagged by competency
   - AI surfaces relevant assets when preparing for a specific interview or writing a self-review
   - Entries automatically feed the STAR Story Builder and resume bullet generator

2. **Structured Interview Prep** *(Hello Interview analog)*
   - Full prep flows for every interview type: technical screens, system design, behavioral, case studies, take-homes
   - Mock interview sessions with AI as the interviewer — spoken or typed — with real-time feedback
   - Role-specific question banks calibrated to company and level (sourced from community + AI-generated)

3. **Career Trajectory View**
   - Timeline of the user's career: roles, projects, skills acquired, interview outcomes
   - AI identifies gaps between current profile and target role, and generates a personalized prep plan

4. **Community Layer**
   - Anonymized, opt-in sharing of question banks, STAR story templates, and prep strategies
   - Upvoting, tagging by company/level/recency
   - Not a leaderboard — no competitive mechanics; purely knowledge-sharing

---

### IX. Gmail & Google Calendar Integration — Interview Pipeline Awareness
**Vision**: Connect the app to the user's Gmail and Google Calendar so that upcoming interviews are automatically imported, linked to the relevant job postings in Job Prep, and used to generate a time-aware prep countdown.

**How it works**:
- User authenticates with Google OAuth (Gmail + Calendar read-only scopes)
- App scans the calendar for events whose title or description contains keywords like "interview", "screen", "onsite", "recruiter call", or the company name from any tracked job posting
- Matched events are surfaced in the app as **Interview Events**, automatically linked to the corresponding job posting profile
- Each interview event shows: date/time, round type (inferred from title, e.g. "Phone Screen", "Technical", "HM Round", "Onsite"), and a countdown ("3 days away")

**Prep integration**:
- A "Prep for this interview" button on each event opens a focused prep view for the linked job posting (responsibilities, matched resume bullets, STAR stories tagged with relevant competencies)
- If no job posting is linked, the user is prompted to add one
- Upcoming interviews also appear as a priority banner on the app home/dashboard — "You have an onsite at Google in 4 days"

**Data flow**:
- Calendar events are fetched on demand (not stored permanently); only the event ID, title, datetime, and linked posting ID are persisted locally
- No email content is read — only calendar event metadata (title, datetime, attendees)
- Auth tokens are stored securely in the OS keychain via Tauri's credential store; never in localStorage

**Why this matters**: Most candidates discover their interview schedule in their calendar and their job info in the app — in two completely separate places. Bridging this gap means the app becomes the single prep cockpit: "I have an interview in 3 days, here's exactly what to review."

---

### X. Inference Layer & Dynamic Model Routing
**Vision**: Replace the current "bring your own API key" model with a first-party inference layer that routes each request to the right model for the job — optimizing for cost, latency, and quality simultaneously.

**Why this matters**: The current architecture passes the user's Claude API key directly from the client. This works for a single-user desktop tool but is untenable at scale: keys are exposed, costs are uncontrolled, and every request uses the same model regardless of task complexity.

**Model routing strategy**:
- **Heavy reasoning tasks** (knowledge framework generation, system design critique, full resume analysis): frontier model (e.g. Claude Opus / GPT-4o)
- **Medium tasks** (quiz generation, STAR story polish, answer feedback): mid-tier model (e.g. Claude Sonnet / GPT-4o-mini)
- **Lightweight tasks** (flashcard generation, short answer polish, inline suggestions): fast/cheap model (e.g. Claude Haiku / Gemini Flash)
- Routing rules are defined server-side and can be updated without a client release

**Inference layer requirements**:
- Server-side proxy that holds provider API keys — no secrets ever reach the client
- Per-user rate limiting and usage metering tied to the account and subscription tier
- Model fallback: if primary model is unavailable or over rate limit, automatically retry with the next best option
- Streaming support: responses are streamed to the client to maintain the fast "typing" feel
- Observability: log token usage, latency, and error rates per task type to inform routing tuning over time

**Transition path**: The current API key input in settings becomes a "Developer Mode" toggle for power users who want to supply their own key and bypass the inference layer entirely. All other users are served through the platform's managed inference.
