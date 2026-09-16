from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.db.models import Job
from app.routers.dependencies import get_current_user

router = APIRouter()


from datetime import datetime
from sqlalchemy import or_

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str
    job_type: str = "Full-time"
    deadline: datetime | None = None


def cleanup_expired_jobs(db: Session) -> int:
    """Automatically purge jobs and internships whose application deadline has passed."""
    try:
        now = datetime.utcnow()
        expired_jobs = db.query(Job.id).filter(Job.deadline != None, Job.deadline < now).all()
        if not expired_jobs:
            return 0

        expired_ids = [j[0] for j in expired_jobs]
        from app.db.models import Application
        db.query(Application).filter(Application.job_id.in_(expired_ids)).delete(synchronize_session=False)
        deleted_count = db.query(Job).filter(Job.id.in_(expired_ids)).delete(synchronize_session=False)
        db.commit()
        return deleted_count
    except Exception as e:
        db.rollback()
        print(f"Cleanup note: {e}")
        return 0


@router.get("")
def list_jobs(
    q: str | None = None,
    location: str | None = None,
    job_type: str | None = None,
    db: Session = Depends(lambda: SessionLocal())
) -> list[dict]:
    init_db()
    try:
        cleanup_expired_jobs(db)

        now = datetime.utcnow()
        # Ensure only non-expired jobs are shown
        query = db.query(Job).filter(or_(Job.deadline == None, Job.deadline >= now))

        if q:
            terms = q.split()
            for term in terms:
                query = query.filter(
                    or_(
                        Job.title.ilike(f"%{term}%"),
                        Job.description.ilike(f"%{term}%"),
                        Job.company.ilike(f"%{term}%")
                    )
                )
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        if job_type:
            query = query.filter(Job.job_type.ilike(f"%{job_type}%"))

        jobs = query.order_by(Job.created_at.desc()).all()
        return [
            {
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "description": j.description,
                "job_type": j.job_type,
                "deadline": j.deadline.isoformat() if j.deadline else None,
                "created_at": j.created_at,
            }
            for j in jobs
        ]
    finally:
        db.close()


@router.get("/{job_id}")
def job_detail(job_id: int, db: Session = Depends(lambda: SessionLocal())) -> dict:
    init_db()
    cleanup_expired_jobs(db)

    now = datetime.utcnow()
    job = db.query(Job).filter(Job.id == job_id, or_(Job.deadline == None, Job.deadline >= now)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Opportunity has expired or not found")

    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "job_type": job.job_type,
        "deadline": job.deadline.isoformat() if job.deadline else None,
        "created_at": job.created_at,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, db: Session = Depends(lambda: SessionLocal()), user=Depends(get_current_user)) -> dict:
    # simple: only admin can create
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")

    init_db()
    job = Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"id": job.id}

