from sqlalchemy import Column, Integer, BigInteger, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    moodle_id = Column(BigInteger, unique=True, nullable=False, index=True)
    course_id = Column(BigInteger, ForeignKey("courses.moodle_id"))
    name = Column(String, nullable=False)
    due_date = Column(DateTime, nullable=True)
    description = Column(String, nullable=True)
    is_new = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
