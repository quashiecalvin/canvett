from fastapi import FastAPI
from routers import jobs, candidates

app = FastAPI(title="Canvett API")

app.include_router(jobs.router)
app.include_router(candidates.router)


@app.get("/")
def read_root():
    return {"message": "Canvett backend is running"}
