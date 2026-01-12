from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.sync_service import SyncService

router = APIRouter(prefix="/api/sync", tags=["Sync"])

@router.post("/")
async def trigger_sync(
    db: AsyncSession = Depends(get_db)
):
    """Manual sync trigger"""
    sync_service = SyncService(db)
    await sync_service.sync_all()
    return {"message": "Sync completed successfully"}
