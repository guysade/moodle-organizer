import asyncio
from sqlalchemy import select
from app.database import engine, AsyncSessionLocal
from app.models.course import Course

# Mapping of course name keywords to notebook URLs
NOTEBOOK_MAPPING = {
    "ניתוח החלטות": "https://notebooklm.google.com/notebook/9290baf5-e80d-4da4-a810-26f5a82d8e41?authuser=1",
    "הבטים קוגניטיביים": "https://notebooklm.google.com/notebook/814665f5-9a56-4181-8ce3-48984641fcbd?authuser=1",
    "היבטים קוגניטיביים": "https://notebooklm.google.com/notebook/814665f5-9a56-4181-8ce3-48984641fcbd?authuser=1",
    "ניתוח נתונים סטטיסטי": "https://notebooklm.google.com/notebook/f217d6c8-8d9c-4567-aa50-0369e3ea77de?authuser=1",
    "ניתוח מערכות מלאי": "https://notebooklm.google.com/notebook/f37aa324-f7ce-448d-86fa-8d7e259759ae?authuser=1",
    "סימולציה": "https://notebooklm.google.com/notebook/40ba2f88-f1b7-4df1-a6b1-d14260767f31?authuser=1",
    "כתיבה טכנית": "https://notebooklm.google.com/notebook/51ca533e-035b-417d-a0ad-84309f0e7732?authuser=1",
    "אופטימיזציה": "https://notebooklm.google.com/notebook/2e18e87d-a39f-47c2-b0b6-8b081546c8ae?authuser=1",
    "הנדסת התנהגות": "https://notebooklm.google.com/notebook/7cd70615-72a5-4281-ad10-8e43909ec6a9?authuser=1"
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
