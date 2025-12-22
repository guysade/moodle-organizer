"""
Migration script to add notebook_url column to courses table
Run this script once to update the database schema
"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        # Add notebook_url column if it doesn't exist
        await conn.execute(text("""
            ALTER TABLE courses ADD COLUMN IF NOT EXISTS notebook_url VARCHAR;
        """))
        print("✓ Added notebook_url column to courses table")

if __name__ == "__main__":
    print("Running migration to add notebook_url column...")
    asyncio.run(migrate())
    print("Migration completed!")
