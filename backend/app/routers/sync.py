from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.sync_service import SyncService
import traceback

router = APIRouter(prefix="/api/sync", tags=["Sync"])

@router.post("/")
async def trigger_sync(
    db: AsyncSession = Depends(get_db)
):
    """Manual sync trigger"""
    try:
        sync_service = SyncService(db)
        await sync_service.sync_all()
        return {"message": "Sync completed successfully"}
    except Exception as e:
        print(f"[SYNC ERROR] {type(e).__name__}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
