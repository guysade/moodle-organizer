from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.services.sync_service import SyncService
from app.database import AsyncSessionLocal
from app.config import settings
import asyncio

scheduler = AsyncIOScheduler()

async def scheduled_sync():
    """Background sync task"""
    print("[Scheduler] Starting scheduled sync...")
    async with AsyncSessionLocal() as db:
        sync_service = SyncService(db)
        try:
            await sync_service.sync_all()
            print("[Scheduler] Scheduled sync completed successfully")
        except Exception as e:
            print(f"[Scheduler] Sync failed: {e}")

def start_scheduler():
    """Start the background scheduler"""
    # Parse cron expression (e.g., "0 4 * * *" = daily at 4 AM)
    cron_parts = settings.sync_schedule_cron.split()

    trigger = CronTrigger(
        minute=cron_parts[0] if len(cron_parts) > 0 else '0',
        hour=cron_parts[1] if len(cron_parts) > 1 else '4',
        day=cron_parts[2] if len(cron_parts) > 2 else '*',
        month=cron_parts[3] if len(cron_parts) > 3 else '*',
        day_of_week=cron_parts[4] if len(cron_parts) > 4 else '*'
    )

    scheduler.add_job(scheduled_sync, trigger, id='sync_moodle', replace_existing=True)
    scheduler.start()
    print(f"[Scheduler] Started with schedule: {settings.sync_schedule_cron}")
    print(f"[Scheduler] Next run: {scheduler.get_job('sync_moodle').next_run_time}")

def stop_scheduler():
    """Stop the scheduler on shutdown"""
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Stopped")
