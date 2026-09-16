"""
Live job sync service for Jobetix.
- Primary scraper: python-jobspy (LinkedIn + Indeed)
- Searches targeted at students & freshers in India
- Falls back gracefully if scraping fails
"""

import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models import Job, Application
from app.db.session import SessionLocal
from app.db.init_db import init_db

logger = logging.getLogger(__name__)


def clear_all_jobs(db: Session) -> dict:
    """Clear all existing jobs and applications from the database."""
    try:
        app_count = db.query(Application).delete()
        job_count = db.query(Job).delete()
        db.commit()
        return {"deleted_jobs": job_count, "deleted_applications": app_count}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clear jobs: {e}")
        return {"error": str(e)}


# Search queries specifically targeted at students & freshers in India
SEARCH_QUERIES = [
    {"term": "software engineering intern",  "loc": "India", "type": "Internship"},
    {"term": "frontend developer intern",    "loc": "India", "type": "Internship"},
    {"term": "backend developer intern",     "loc": "India", "type": "Internship"},
    {"term": "python developer intern",      "loc": "India", "type": "Internship"},
    {"term": "data science intern",          "loc": "India", "type": "Internship"},
    {"term": "UI UX design intern",          "loc": "India", "type": "Internship"},
    {"term": "machine learning intern",      "loc": "India", "type": "Internship"},
    {"term": "react developer intern",       "loc": "India", "type": "Internship"},
    {"term": "fresher software engineer",    "loc": "India", "type": "Full-time"},
    {"term": "junior developer fresher",     "loc": "India", "type": "Full-time"},
    {"term": "fresher data analyst",         "loc": "India", "type": "Full-time"},
    {"term": "graduate trainee engineer",    "loc": "India", "type": "Full-time"},
]


def _determine_job_type(title: str, query_type: str) -> str:
    """Infer job type from title keywords."""
    title_lower = title.lower()
    if "intern" in title_lower or "internship" in title_lower:
        return "Internship"
    if "trainee" in title_lower or "fresher" in title_lower or "graduate" in title_lower:
        return "Full-time"
    return query_type


def _is_duplicate(db: Session, title: str, company: str) -> bool:
    """Check if a job with the same title + company already exists."""
    return (
        db.query(Job)
        .filter(Job.title == title, Job.company == company)
        .first()
    ) is not None


def sync_live_jobs(db: Session, limit_per_query: int = 10) -> dict:
    """
    Scrape real-time internships and fresher jobs from LinkedIn and Indeed
    using python-jobspy, then insert new listings into the database.
    """
    init_db()

    try:
        from jobspy import scrape_jobs
    except ImportError:
        logger.warning("python-jobspy is not installed. Run: pip install python-jobspy")
        return {"status": "error", "message": "python-jobspy not installed"}

    added = 0
    skipped = 0
    now = datetime.utcnow()

    for item in SEARCH_QUERIES:
        try:
            logger.info(f"[LiveSync] Scraping: '{item['term']}' in {item['loc']}...")

            df = scrape_jobs(
                site_name=["linkedin", "indeed"],
                search_term=item["term"],
                location=item["loc"],
                results_wanted=limit_per_query,
                country_indeed="india",
                hours_old=72,          # Only jobs posted in last 3 days
                linkedin_fetch_description=True,
            )

            if df is None or len(df) == 0:
                logger.info(f"[LiveSync] No results for '{item['term']}'")
                continue

            for _, row in df.iterrows():
                title   = str(row.get("title",    "")).strip()
                company = str(row.get("company",  "")).strip()
                loc     = str(row.get("location", "India")).strip()
                desc    = str(row.get("description", "")).strip()
                apply_url = str(row.get("job_url", "")).strip()

                # Skip rows with empty required fields
                if not title or title.lower() == "nan":
                    continue
                if not company or company.lower() == "nan":
                    continue

                # Clean up NaN values
                if not apply_url or apply_url.lower() == "nan":
                    apply_url = None
                if not loc or loc.lower() == "nan":
                    loc = "Remote / India"
                if not desc or desc.lower() == "nan":
                    desc = (
                        f"Exciting {item['type']} opportunity at {company}. "
                        "Apply directly through the official posting."
                    )

                # Skip if already in DB
                if _is_duplicate(db, title, company):
                    skipped += 1
                    continue

                job_type = _determine_job_type(title, item["type"])

                # Deadline: 30 days from now (auto-expires and is cleaned up)
                deadline = now + timedelta(days=30)

                new_job = Job(
                    title=title,
                    company=company,
                    location=loc,
                    description=desc,
                    job_type=job_type,
                    deadline=deadline,
                    apply_url=apply_url,
                )
                db.add(new_job)
                added += 1

            db.commit()
            logger.info(f"[LiveSync] '{item['term']}' done. Added so far: {added}")

        except Exception as err:
            db.rollback()
            logger.error(f"[LiveSync] Error scraping '{item['term']}': {err}")
            continue

    logger.info(f"[LiveSync] Sync complete. Total added: {added}, skipped: {skipped}")
    return {
        "status": "success",
        "added_jobs": added,
        "skipped_duplicates": skipped,
    }
