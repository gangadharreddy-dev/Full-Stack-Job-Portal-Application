"""
Background scheduler for Jobetix.
- Runs an automated live job scrape every day at midnight (UTC).
- On first startup, immediately runs a scrape if the DB is empty.
"""

import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.db.session import SessionLocal
from app.db.models import Job

logger = logging.getLogger(__name__)

# Single global scheduler instance
_scheduler: BackgroundScheduler | None = None


def _daily_sync_job():
    """Job function executed by the scheduler. Scrapes live jobs from web."""
    logger.info("[Scheduler] Starting daily live job sync...")
    db = SessionLocal()
    try:
        from app.services.live_sync import sync_live_jobs
        result = sync_live_jobs(db, limit_per_query=10)
        logger.info(f"[Scheduler] Daily sync complete: {result}")
    except Exception as e:
        logger.error(f"[Scheduler] Daily sync failed: {e}")
    finally:
        db.close()


def _run_initial_sync_if_empty():
    """On startup, do an immediate sync if the jobs table is empty."""
    db = SessionLocal()
    try:
        count = db.query(Job).count()
        if count == 0:
            logger.info("[Scheduler] DB is empty – running initial live sync now...")
            from app.services.live_sync import sync_live_jobs
            result = sync_live_jobs(db, limit_per_query=10)
            logger.info(f"[Scheduler] Initial sync done: {result}")
        else:
            logger.info(f"[Scheduler] DB already has {count} jobs – skipping initial sync.")
    except Exception as e:
        logger.error(f"[Scheduler] Initial sync check failed: {e}")
    finally:
        db.close()


def start_scheduler():
    """Start the APScheduler background scheduler and wire up the daily job."""
    global _scheduler

    if _scheduler and _scheduler.running:
        logger.info("[Scheduler] Already running – skipping start.")
        return

    _scheduler = BackgroundScheduler(timezone="UTC")

    # Daily at midnight UTC
    _scheduler.add_job(
        _daily_sync_job,
        trigger=CronTrigger(hour=0, minute=0, timezone="UTC"),
        id="daily_live_sync",
        name="Daily Live Job Sync",
        replace_existing=True,
        misfire_grace_time=3600,  # Allow 1h late start if server was down
    )

    _scheduler.start()
    logger.info("[Scheduler] Background scheduler started. Daily sync scheduled at 00:00 UTC.")

    # Run immediate sync on startup if DB is empty
    _run_initial_sync_if_empty()


def stop_scheduler():
    """Gracefully shut down the scheduler on app shutdown."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("[Scheduler] Scheduler stopped.")
