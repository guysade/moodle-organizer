"""
Migration script to add grade column to assignments table
"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        await conn.execute(text("""
            ALTER TABLE assignments ADD COLUMN IF NOT EXISTS grade VARCHAR;
        """))
        print("✓ Added grade column to assignments table")

if __name__ == "__main__":
    print("Running migration to add grade column...")
    asyncio.run(migrate())
    print("Migration completed!")
