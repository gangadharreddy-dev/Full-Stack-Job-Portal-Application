from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.jobs import router as jobs_router
from app.routers.applications import router as applications_router
from app.core.config import settings
from app.db.init_db import init_db

app = FastAPI(title="Jobetix API")

allowed_origins = [
    origin.strip()
    for origin in settings.FRONTEND_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["health"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(jobs_router, prefix="/api/jobs", tags=["jobs"])
app.include_router(applications_router, prefix="/api/applications", tags=["applications"])


@app.on_event("startup")
def on_startup():
    """Initialize DB and start the daily automated job scraping scheduler."""
    init_db()

    # Start background scheduler for daily live job streaming
    try:
        from app.services.scheduler import start_scheduler
        start_scheduler()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Scheduler failed to start: {e}")


@app.on_event("shutdown")
def on_shutdown():
    """Gracefully stop the background scheduler on server shutdown."""
    try:
        from app.services.scheduler import stop_scheduler
        stop_scheduler()
    except Exception:
        pass
