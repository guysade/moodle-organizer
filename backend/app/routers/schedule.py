from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter(prefix="/api/schedule", tags=["Schedule"])

@router.get("/")
async def get_schedule():
    schedule_file = Path("/app/schedule.json")
    if not schedule_file.exists():
        return []

    with open(schedule_file, "r", encoding="utf-8") as f:
        return json.load(f)
