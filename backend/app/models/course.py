from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime
from app.database import Base
from datetime import datetime

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    moodle_id = Column(BigInteger, unique=True, nullable=False, index=True)
    fullname = Column(String, nullable=False)
    shortname = Column(String, nullable=False)
    category_id = Column(Integer)
    progress = Column(Integer, default=0)
    visible = Column(Boolean, default=True)
    notebook_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
