from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.assignment import Assignment
from datetime import datetime

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

@router.get("/")
async def get_assignments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Assignment)
        .where(Assignment.due_date != None)
        .order_by(Assignment.due_date.asc())
    )
    assignments = result.scalars().all()
    return [
        {
            "id": a.moodle_id,
            "course_id": a.course_id,
            "name": a.name,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "is_new": a.is_new
        }
        for a in assignments
    ]
