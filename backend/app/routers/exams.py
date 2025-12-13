from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from pathlib import Path
from datetime import datetime

router = APIRouter(prefix="/api/exams", tags=["Exams"])

EXAMS_FILE = Path("/app/exams.json")

class Exam(BaseModel):
    id: Optional[int] = None
    course_name: str
    course_number: Optional[str] = None
    date: datetime
    location: Optional[str] = None
    description: Optional[str] = None

@router.get("/", response_model=List[Exam])
async def get_exams():
    if not EXAMS_FILE.exists():
        return []
    
    try:
        with open(EXAMS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

@router.post("/", response_model=Exam)
async def add_exam(exam: Exam):
    exams = []
    if EXAMS_FILE.exists():
        try:
            with open(EXAMS_FILE, "r", encoding="utf-8") as f:
                exams = json.load(f)
        except json.JSONDecodeError:
            exams = []
    
    # Simple ID generation
    new_id = 1
    if exams:
        new_id = max(e.get("id", 0) for e in exams) + 1
    
    exam.id = new_id
    
    # Convert pydantic model to dict, handling datetime serialization
    exam_dict = json.loads(exam.model_dump_json())
    exams.append(exam_dict)
    
    with open(EXAMS_FILE, "w", encoding="utf-8") as f:
        json.dump(exams, f, ensure_ascii=False, indent=2)
        
    return exam_dict

@router.delete("/{exam_id}")
async def delete_exam(exam_id: int):
    if not EXAMS_FILE.exists():
        raise HTTPException(status_code=404, detail="No exams found")
        
    try:
        with open(EXAMS_FILE, "r", encoding="utf-8") as f:
            exams = json.load(f)
    except json.JSONDecodeError:
        exams = []
        
    new_exams = [e for e in exams if e.get("id") != exam_id]
    
    if len(new_exams) == len(exams):
        raise HTTPException(status_code=404, detail="Exam not found")
        
    with open(EXAMS_FILE, "w", encoding="utf-8") as f:
        json.dump(new_exams, f, ensure_ascii=False, indent=2)
        
    return {"message": "Exam deleted"}
