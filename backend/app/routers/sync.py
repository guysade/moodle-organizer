from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.sync_service import SyncService

router = APIRouter(prefix="/api/sync", tags=["Sync"])

@router.post("/")
async def trigger_sync(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Manual sync trigger"""
    sync_service = SyncService(db)
    background_tasks.add_task(sync_service.sync_all)
    return {"message": "Sync started in background"}
