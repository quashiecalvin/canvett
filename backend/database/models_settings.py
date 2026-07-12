from sqlalchemy import Column, Integer, Float
from database.connection import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    skills_weight = Column(Float, default=0.5)
    experience_weight = Column(Float, default=0.3)
    education_weight = Column(Float, default=0.2)
    unverified_factor = Column(Float, default=0.7)
    skill_threshold = Column(Float, default=0.5)
