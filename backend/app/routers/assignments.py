from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.assignment import Assignment
from app.models.course import Course
from datetime import datetime, timezone

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

@router.get("/")
async def get_assignments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Assignment)
        .where(Assignment.due_date != None)
        .order_by(Assignment.submitted.asc(), Assignment.due_date.asc())
    )
    assignments = result.scalars().all()

    # Fetch course names
    course_ids = list(set(a.course_id for a in assignments))
    courses_result = await db.execute(
        select(Course).where(Course.moodle_id.in_(course_ids))
    )
    courses = {c.moodle_id: c for c in courses_result.scalars().all()}

    return [
        {
            "id": a.moodle_id,
            "cmid": a.cmid,  # Include course module ID for URL
            "course_id": a.course_id,
            "course_name": courses.get(a.course_id).fullname if a.course_id in courses else "",
            "name": a.name,
            "due_date": a.due_date.replace(tzinfo=timezone.utc).isoformat() if a.due_date else None,
            "submitted": a.submitted,
            "grade": a.grade,
            "is_new": a.is_new
        }
        for a in assignments
    ]
