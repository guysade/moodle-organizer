from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.course import Course
from typing import List

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.get("/")
async def get_courses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.visible == True))
    courses = result.scalars().all()
    return [
        {
            "id": c.moodle_id,
            "moodle_id": c.moodle_id,
            "fullname": c.fullname,
            "shortname": c.shortname,
            "progress": c.progress,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None
        }
        for c in courses
    ]
