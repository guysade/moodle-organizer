import asyncio
from sqlalchemy import select
from app.database import engine, AsyncSessionLocal
from app.models.course import Course

async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Course))
        courses = result.scalars().all()
        
        print(f"Total courses found: {len(courses)}")
        print("-" * 50)
        print(f"{'Course Name':<40} | {'Notebook URL'}")
        print("-" * 50)
        for course in courses:
            url = course.notebook_url if course.notebook_url else "None"
            print(f"{course.fullname[:40]:<40} | {url}")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(check())
