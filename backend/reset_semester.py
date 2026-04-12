"""
Reset script for new semester.
Clears assignments, resources, grades, and notebook URLs from the database.
Courses are kept (they'll be updated on next Moodle sync).

Usage:
    docker exec moodle_backend python reset_semester.py
"""
import asyncio
from sqlalchemy import delete, update
from app.database import AsyncSessionLocal
from app.models.assignment import Assignment
from app.models.resource import Resource
from app.models.course import Course


async def reset():
    async with AsyncSessionLocal() as db:
        # Delete all assignments (includes grades)
        result = await db.execute(delete(Assignment))
        print(f"Deleted {result.rowcount} assignments")

        # Delete all resources
        result = await db.execute(delete(Resource))
        print(f"Deleted {result.rowcount} resources")

        # Clear notebook URLs (new semester = new notebooks)
        result = await db.execute(
            update(Course).values(notebook_url=None)
        )
        print(f"Cleared notebook URLs for {result.rowcount} courses")

        await db.commit()
        print("\nSemester reset complete. Run a Moodle sync to pull new data.")


if __name__ == "__main__":
    asyncio.run(reset())
