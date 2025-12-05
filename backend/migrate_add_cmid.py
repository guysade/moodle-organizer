"""
Migration script to add cmid column to assignments table
Run this script once to update the database schema
"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        # Add cmid column if it doesn't exist
        await conn.execute(text("""
            ALTER TABLE assignments ADD COLUMN IF NOT EXISTS cmid BIGINT;
        """))
        print("✓ Added cmid column to assignments table")

if __name__ == "__main__":
    print("Running migration to add cmid column...")
    asyncio.run(migrate())
    print("Migration completed!")
