"""
Migration script to add section column to resources table
Run this script once to update the database schema
"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    async with engine.begin() as conn:
        # Add section column if it doesn't exist
        await conn.execute(text("""
            ALTER TABLE resources ADD COLUMN IF NOT EXISTS section VARCHAR;
        """))
        print("✓ Added section column to resources table")

if __name__ == "__main__":
    print("Running migration to add section column...")
    asyncio.run(migrate())
    print("Migration completed!")
