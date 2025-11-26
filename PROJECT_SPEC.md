# Project Specification: Moodle Organizer

## 1. Project Overview
**Goal:** Build a personal "Student Dashboard" application that aggregates data from the Tel Aviv University Moodle (via API), tracks assignment deadlines, and displays a weekly class schedule.
**Repository:** `https://github.com/guysade/moodle-organizer`

## 2. Tech Stack & Architecture

### Backend (The Brain)
* **Language:** Python 3.11+
* **Framework:** FastAPI (Async, modern, auto-generated docs).
* **Scheduler:** `APScheduler` (running within the FastAPI app).
* **Moodle Integration:** Custom Python client using `requests` to hit Moodle Web Services API.
* **Testing:** `pytest` + `httpx`.

### Database (Persistence)
* **Engine:** PostgreSQL.
* **ORM:** SQLAlchemy (Async) or SQLModel.
* **Migration Tool:** Alembic.
* **Data Strategy:** Store **metadata only** (URLs, file names, dates). Do NOT store actual binary files.

### Frontend (The UI)
* **Framework:** React (Vite).
* **Language:** TypeScript.
* **Styling:** Tailwind CSS + Shadcn/UI.
* **State Management:** TanStack Query (React Query).
* **Localization:**
    * **Default Language:** Hebrew (עברית) with RTL layout
    * **Secondary Language:** English with LTR layout
    * **Language Switcher:** Toggle button in UI to switch between Hebrew/English
* **RTL Best Practices:**
    * Use Tailwind's RTL directives (`start`/`end` instead of `left`/`right`)
    * Mirror layout and navigation for RTL
    * Proper text alignment and direction (`dir="rtl"` for Hebrew, `dir="ltr"` for English)
    * RTL-aware icons and animations
    * Store language preference in localStorage
* **Design System:**
    * **Style:** Modern, clean, professional, minimalist
    * **Color Palette:** Blue primary (#3B82F6), neutral grays, accent colors for status
    * **Typography:** Clear hierarchy, readable font sizes, proper spacing
    * **Components:** Rounded cards, subtle shadows, hover effects
    * **Animations:** Smooth transitions (300ms), fade-ins, scale effects on interactions
    * **Spacing:** Consistent padding/margins, generous whitespace
    * **Interactive Elements:** Clear hover states, active states, disabled states
    * **Loading States:** Skeleton loaders, spinners with smooth animations
    * **Empty States:** Friendly messages with visual cues

### DevOps & Infrastructure
* **Containerization:** Docker & Docker Compose.
* **Structure:**
    1.  `db` container (Postgres).
    2.  `backend` container (FastAPI + Worker).
    3.  `frontend` container (Nginx or Node dev server).

## 3. Key Features & Data Models

### A. Background Worker (Scraper)
* **Frequency:** Runs automatically **once every 24 hours** (e.g., at 04:00 AM).
* **Manual Trigger:** Explicit "Sync Now" button in the UI.
* **Logic:**
    1.  Fetch enrolled courses.
    2.  For each course, fetch contents (`core_course_get_contents`) and assignments.
    3.  **Data Extraction:** Extract file metadata: `filename`, `file_url`, `mimetype`, `timecreated`.
    4.  **Storage:** Save this metadata to the DB.
    5.  **Constraint:** **Do NOT download** the actual file content to the server disk. Only store the URL.
    6.  **Diffing:** Identify new items based on IDs to flag them as `is_new`.

### B. Schedule (Static)
* Loaded from a `schedule.json` file.
* **Structure:** JSON array of objects with day, hour, course name, and location.

### C. Frontend Views
**Language & Layout:**
* All UI text in Hebrew by default (buttons, labels, headings)
* RTL layout with sidebar on the right side
* Language switcher in header/sidebar (עברית ⇄ English)
* Smooth transition when switching languages (layout flips for RTL/LTR)

**Pages:**
1.  **Dashboard (דשבורד):** "What's New" (מה חדש) - list of recently added materials.
2.  **Assignments (מטלות):** List view of upcoming deadlines with Hebrew dates.
3.  **My Files / Course Browser (הקורסים שלי):**
    * Displays the course structure (Folders/Modules).
    * **Action:** Each file has a clear **"Download" button** (הורדה).
    * **Mechanism:** Clicking "Download" opens the link: `${file_url}&token=${USER_TOKEN}`. This triggers a direct download from Moodle to the user's browser.
4.  **Schedule (מערכת שעות):** Visual weekly calendar grid with Hebrew day names.

## 4. Implementation Plan (Step-by-Step)

**Do not proceed to the next phase until the current one is tested.**

### Phase 1: Foundation & DevOps
* Initialize Git repo.
* Create `docker-compose.yml` (Postgres + Basic FastAPI).
* Create `.env.example` (Moodle Token, DB URL).
* **Verify:** Containers are up, DB is accessible.

### Phase 2: Moodle Client & Database (Backend)
* Implement `MoodleClient` class.
* Define DB Models: `Course`, `Assignment`, `Resource` (store `url` string, not blob).
* Create sync logic (fetch metadata -> save/update DB).
* **Verify:** Script runs, DB is populated with course names and file URLs.

### Phase 3: API Layer (Backend)
* Create endpoints: `/courses`, `/assignments`, `/resources`, `/schedule`, `/sync`.
* **Verify:** Swagger UI shows correct data structure.

### Phase 4: Frontend Skeleton
* Init React + TS + Vite + Tailwind.
* Create Layout (Sidebar/Header).
* **Verify:** Static page loads.

### Phase 5: Frontend Features Integration
* **Schedule View:** Render from JSON.
* **Assignments View:** Fetch from API.
* **Course Browser:**
    * Render list of files.
    * **Implement Download Logic:** Ensure the download button correctly appends the token to the URL.
* **Verify:** Clicking a file actually downloads it to the computer.

### Phase 6: Polish & Automation
* Activate `APScheduler` (CRON job).
* Connect "Sync Now" button to backend.
* UI Polish (Loading states, Empty states).

## 5. Instructions for the AI Assistant
1.  **Context:** You are an expert Full Stack Engineer.
2.  **Action:** Start by analyzing **Phase 1**. Generate the directory structure and initial config files.
3.  **Wait for user confirmation** before moving to code logic.