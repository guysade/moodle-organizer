from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.resource import Resource
from app.config import settings

router = APIRouter(prefix="/api/resources", tags=["Resources"])

@router.get("/")
async def get_resources(course_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(Resource)
    if course_id:
        query = query.where(Resource.course_id == course_id)

    result = await db.execute(query.order_by(Resource.time_created.desc()))
    resources = result.scalars().all()

    return [
        {
            "id": r.id,  # Use database primary key, not moodle_id (which is not unique)
            "moodle_id": r.moodle_id,
            "course_id": r.course_id,
            "filename": r.filename,
            "download_url": f"{r.file_url}&token={settings.moodle_token}",
            "mimetype": r.mimetype,
            "filesize": r.filesize,
            "is_new": r.is_new,
            "time_created": r.time_created.isoformat() if r.time_created else None
        }
        for r in resources
    ]

@router.get("/new")
async def get_new_resources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Resource)
        .where(Resource.is_new == True)
        .order_by(Resource.time_created.desc())
        .limit(20)
    )
    resources = result.scalars().all()

    return [
        {
            "id": r.id,  # Use database primary key, not moodle_id (which is not unique)
            "moodle_id": r.moodle_id,
            "course_id": r.course_id,
            "filename": r.filename,
            "download_url": f"{r.file_url}&token={settings.moodle_token}",
            "mimetype": r.mimetype,
            "filesize": r.filesize,
            "is_new": r.is_new,
            "time_created": r.time_created.isoformat() if r.time_created else None
        }
        for r in resources
    ]
