# Moodle Organizer

A modern, bilingual (Hebrew/English) web application for Tel Aviv University students to organize and track Moodle courses, assignments, and resources.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Python](https://img.shields.io/badge/python-3.11-blue)
![FastAPI](https://img.shields.io/badge/fastapi-0.109.0-teal)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Features

### 📚 Course Management
- **Automatic Sync**: Daily automatic synchronization with Moodle at 4:00 AM
- **Manual Sync**: On-demand sync button with progress indicator
- **Progress Tracking**: Visual progress bars for each course
- **13+ Courses**: Supports all your enrolled courses

### 📅 Schedule
- **Weekly View**: Beautiful calendar grid showing your class schedule
- **Hebrew Support**: Course names, times, and locations in Hebrew
- **Responsive Design**: Works on desktop and mobile

### 📄 Resources & Materials
- **Course Materials Tab**: Dedicated file browser for all course contents
- **Section Organization**: Files are grouped by Moodle sections (e.g., Week 1, Lectures)
- **Direct Downloads**: One-click download of individual files
- **Bulk Download**: Download entire course contents as a ZIP file
- **Dashboard**: "What's New" section showing recently added materials
- **File Metadata**: View file types, sizes, and upload dates

### 📓 Notebooks
- **Integrated NotebookLM**: Quick access to Google NotebookLM notebooks for each course
- **Course-Specific Links**: Automatically maps courses to their corresponding notebooks

### ✅ Assignments
- **Upcoming Deadlines**: Sorted list of assignments with due dates
- **New Badge**: Highlights newly added assignments
- **Hebrew Dates**: Localized date formatting

### 🌐 Bilingual Interface
- **Hebrew (Default)**: Right-to-left layout
- **English**: Left-to-right layout
- **Instant Switch**: Toggle between languages with one click
- **Full Translation**: All UI elements translated

### 🎨 Modern UI/UX
- **Professional Design**: Clean, minimalist interface
- **Smooth Animations**: Fade-ins, transitions, hover effects
- **Loading States**: Spinners and skeleton loaders
- **Empty States**: Friendly messages when no data available
- **Responsive**: Adapts to all screen sizes

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Python 3.11+
- FastAPI (Async REST API)
- SQLAlchemy + AsyncPG (PostgreSQL)
- APScheduler (Background jobs)
- httpx (Moodle API client)

**Frontend:**
- React 18
- TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- TanStack Query (State management)
- Axios (HTTP client)

**Database:**
- PostgreSQL 15

**DevOps:**
- Docker & Docker Compose
- 3 containers: db, backend, frontend

### Project Structure

```
moodle-organizer/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # DB connection
│   │   ├── main.py          # FastAPI app
│   │   └── scheduler.py     # Background scheduler
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── lib/             # API & i18n
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Styles
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example            # Template
├── schedule.json           # Your class schedule
└── PROJECT_SPEC.md        # Original specification
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- WSL2 (for Windows users)
- Moodle API token from TAU Moodle

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/guysade/moodle-organizer.git
   cd moodle-organizer
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   MOODLE_URL=https://moodle.tau.ac.il
   MOODLE_TOKEN=your_token_here
   MOODLE_USER_ID=your_user_id
   ```

3. **Start the application**
   ```bash
   docker compose up -d
   ```

4. **Run Migrations**
   ```bash
   # Add new columns for notebooks and sections
   docker exec moodle_backend python migrate_add_notebook_url.py
   docker exec moodle_backend python migrate_add_section.py
   
   # Populate notebook data
   docker exec moodle_backend python populate_notebooks.py
   ```

5. **Trigger initial sync**
   ```bash
   curl -X POST http://localhost:8000/api/sync/
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📖 API Documentation

### Endpoints

#### Courses
- `GET /api/courses/` - List all courses with notebook URLs

#### Assignments
- `GET /api/assignments/` - List assignments with due dates

#### Resources
- `GET /api/resources/` - List all resources with section info
- `GET /api/resources/?course_id=123` - Filter by course
- `GET /api/resources/new` - Get 20 newest resources
- `GET /api/resources/download-zip/{course_id}` - Download course contents as ZIP

#### Schedule
- `GET /api/schedule/` - Get weekly class schedule

#### Sync
- `POST /api/sync/` - Trigger manual sync

#### System
- `GET /` - API status
- `GET /health` - Health check
- `GET /scheduler/status` - Scheduler status & next run time

## 📊 Database Schema

### Courses
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  moodle_id BIGINT UNIQUE NOT NULL,
  fullname VARCHAR NOT NULL,
  shortname VARCHAR NOT NULL,
  category_id INTEGER,
  progress INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  notebook_url VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Assignments
```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  moodle_id BIGINT UNIQUE NOT NULL,
  cmid BIGINT,
  course_id BIGINT REFERENCES courses(moodle_id),
  name VARCHAR NOT NULL,
  due_date TIMESTAMP,
  description VARCHAR,
  grade VARCHAR,
  submitted BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Resources
```sql
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  moodle_id BIGINT NOT NULL,
  course_id BIGINT REFERENCES courses(moodle_id),
  filename VARCHAR NOT NULL,
  file_url VARCHAR UNIQUE NOT NULL,
  mimetype VARCHAR,
  filesize INTEGER,
  section VARCHAR,
  time_created TIMESTAMP,
  is_new BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is for personal use. All rights reserved.

## 👨‍💻 Author

**Guy Sade**
- GitHub: [@guysade](https://github.com/guysade)
- University: Tel Aviv University

## 🙏 Acknowledgments

- Tel Aviv University for Moodle API access
- FastAPI and React communities
- All open-source contributors

---

Built with ❤️ for TAU students