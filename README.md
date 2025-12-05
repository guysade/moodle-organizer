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

### 📄 Resources
- **Dashboard**: "What's New" section showing recently added materials
- **Direct Downloads**: One-click download of course materials from Moodle
- **File Metadata**: View file types, sizes, and upload dates

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

4. **Trigger initial sync**
   ```bash
   curl -X POST http://localhost:8000/api/sync/
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Getting Your Moodle Token

1. Go to https://moodle.tau.ac.il/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=1&url_scheme=moodlemobile
2. Open browser DevTools (F12) → Network tab
3. Find a request with `wstoken=` in the URL
4. The token format is: `prefix:::actual_token`
5. Use only the **second part** (after `:::`)

## 📖 API Documentation

### Endpoints

#### Courses
- `GET /api/courses/` - List all courses

#### Assignments
- `GET /api/assignments/` - List assignments with due dates

#### Resources
- `GET /api/resources/` - List all resources
- `GET /api/resources/?course_id=123` - Filter by course
- `GET /api/resources/new` - Get 20 newest resources

#### Schedule
- `GET /api/schedule/` - Get weekly class schedule

#### Sync
- `POST /api/sync/` - Trigger manual sync

#### System
- `GET /` - API status
- `GET /health` - Health check
- `GET /scheduler/status` - Scheduler status & next run time

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MOODLE_URL` | TAU Moodle URL | `https://moodle.tau.ac.il` |
| `MOODLE_TOKEN` | Your Moodle API token | `785a2fa52a777c5fab766e64fe01add3` |
| `MOODLE_USER_ID` | Your Moodle user ID | `191391` |
| `POSTGRES_USER` | Database username | `moodle_user` |
| `POSTGRES_PASSWORD` | Database password | `secure_password` |
| `POSTGRES_DB` | Database name | `moodle_organizer` |
| `DATABASE_URL` | Full database connection URL | See `.env.example` |
| `BACKEND_PORT` | Backend port | `8000` |
| `SYNC_SCHEDULE_CRON` | Sync schedule (cron format) | `0 4 * * *` (4 AM daily) |
| `VITE_API_URL` | Frontend API URL | `http://localhost:8000` |

### Sync Schedule

The sync schedule uses cron format: `minute hour day month day_of_week`

Examples:
- `0 4 * * *` - Daily at 4:00 AM (default)
- `0 */6 * * *` - Every 6 hours
- `0 9,17 * * *` - 9 AM and 5 PM daily
- `0 8 * * 1-5` - 8 AM on weekdays only

## 🛠️ Development

### Backend Development

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run locally (without Docker)
uvicorn app.main:app --reload
```

### Frontend Development

```bash
# Install dependencies
cd frontend
npm install

# Run dev server
npm run dev
```

### Database Management

```bash
# Access database
docker compose exec db psql -U moodle_user -d moodle_organizer

# View tables
\dt

# Query data
SELECT * FROM courses;
SELECT * FROM assignments;
SELECT * FROM resources;

# Reset database
docker compose exec db psql -U moodle_user -d moodle_organizer -c "DROP TABLE IF EXISTS resources, assignments, courses CASCADE;"
docker compose restart backend
```

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
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Assignments
```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  moodle_id BIGINT UNIQUE NOT NULL,
  course_id BIGINT REFERENCES courses(moodle_id),
  name VARCHAR NOT NULL,
  due_date TIMESTAMP,
  description VARCHAR,
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
  time_created TIMESTAMP,
  is_new BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
docker compose logs backend

# Restart backend
docker compose restart backend
```

### Database issues
```bash
# Check database health
docker compose exec db pg_isready -U moodle_user

# Restart database
docker compose restart db
```

### Frontend not loading
```bash
# Check logs
docker compose logs frontend

# Rebuild frontend
docker compose up -d --build frontend
```

### Sync not working
```bash
# Check scheduler status
curl http://localhost:8000/scheduler/status

# Trigger manual sync
curl -X POST http://localhost:8000/api/sync/

# Check sync logs
docker compose logs backend | grep -i sync
```

## 🔒 Security Notes

- **Never commit** `.env` file to Git
- Store Moodle token securely
- Change default database password in production
- Use HTTPS in production
- Regularly update dependencies

## 📝 Future Enhancements

- [ ] Mark assignments as completed
- [ ] Push notifications for new content
- [ ] Filter courses by semester
- [ ] Export schedule to iCal format
- [ ] Dark mode
- [ ] Mobile app
- [ ] Email notifications
- [ ] Assignment reminders

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
