from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database.connection import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
