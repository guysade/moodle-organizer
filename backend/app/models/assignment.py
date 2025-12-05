from sqlalchemy import Column, Integer, BigInteger, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    moodle_id = Column(BigInteger, unique=True, nullable=False, index=True)
    cmid = Column(BigInteger, nullable=True)  # Course Module ID for URL
    course_id = Column(BigInteger, ForeignKey("courses.moodle_id"))
    name = Column(String, nullable=False)
    due_date = Column(DateTime, nullable=True)
    description = Column(String, nullable=True)
    is_new = Column(Boolean, default=True)
    submitted = Column(Boolean, default=False)  # Submission status
    grade = Column(String, nullable=True)  # Grade for display
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
