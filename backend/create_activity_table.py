from database.connection import Base, engine
from database import models_job, models_candidate, models_activity

Base.metadata.create_all(bind=engine)
print("Activities table created!")
