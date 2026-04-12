import asyncio
from sqlalchemy import select
from app.database import engine, AsyncSessionLocal
from app.models.course import Course

# Mapping of course name keywords to notebook URLs
NOTEBOOK_MAPPING = {
    # Semester B courses - add NotebookLM URLs here as you create them
    "תורת המשחקים": "",
    "מבוא ללמידת מכונה": "",
    "ניתוח מערכות ייצור": "",
    "ניהול פרוייקטים": "",
    "הנדסת נתוני עתק": "",
    "מבוא לשיווק": "",
    "מערכות שירות": "",
    "מגילות מדבר יהודה": "",
}

async def populate():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Course))
        courses = result.scalars().all()
        
        print(f"Scanning {len(courses)} courses...")
        count = 0
        
        for course in courses:
            matched = False
            for keyword, url in NOTEBOOK_MAPPING.items():
                if keyword in course.fullname:
                    course.notebook_url = url
                    print(f"✓ Assigned notebook to: {course.fullname}")
                    count += 1
                    matched = True
                    break
        
        await db.commit()
        print(f"\nDone! Updated {count} courses.")

if __name__ == "__main__":
    asyncio.run(populate())
