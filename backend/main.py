from fastapi import FastAPI
from routers import jobs

app = FastAPI(title="Canvett API")

app.include_router(jobs.router)


@app.get("/")
def read_root():
    return {"message": "Canvett backend is running"}
