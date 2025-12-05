from sqlalchemy import Column, Integer, BigInteger, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    moodle_id = Column(BigInteger, nullable=False, index=True)  # Not unique - can be 0
    course_id = Column(BigInteger, ForeignKey("courses.moodle_id"))
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=False, unique=True, index=True)  # Use URL as unique identifier
    mimetype = Column(String)
    filesize = Column(Integer)
    time_created = Column(DateTime, nullable=True)
    is_new = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
