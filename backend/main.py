from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from config import settings
from db.database import engine
from db import models
from api.routes import analyze, reports, export

app = FastAPI(
    title="İtibar Tespit API",
    description="Firma itibar analizi ve risk skorlama servisi",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    models.Base.metadata.create_all(bind=engine)


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health():
    return {"status": "ok"}
