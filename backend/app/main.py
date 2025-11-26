from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import courses, assignments, resources, schedule, sync
from app.scheduler import start_scheduler, stop_scheduler
from contextlib import asynccontextmanager
# Import models to ensure they're registered with Base
from app.models import course, assignment, resource

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler()
    print("[FastAPI] Application started successfully")
    yield
    # Shutdown
    stop_scheduler()
    print("[FastAPI] Application shutdown complete")

app = FastAPI(
    title="Moodle Organizer API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses.router)
app.include_router(assignments.router)
app.include_router(resources.router)
app.include_router(schedule.router)
app.include_router(sync.router)

@app.get("/")
async def root():
    return {"message": "Moodle Organizer API", "status": "running", "scheduler": "active"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/scheduler/status")
async def scheduler_status():
    """Get scheduler status and next run time"""
    from app.scheduler import scheduler
    if scheduler.running:
        job = scheduler.get_job('sync_moodle')
        return {
            "status": "running",
            "next_run": str(job.next_run_time) if job else None,
            "schedule": "Daily at 04:00 AM"
        }
    return {"status": "stopped"}
