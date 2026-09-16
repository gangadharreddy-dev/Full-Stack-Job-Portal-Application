import os
import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.db.models import Application
from app.routers.dependencies import get_current_user

router = APIRouter()

# Directory where resumes are saved (on Render this is ephemeral but fine for demo)
UPLOAD_DIR = "/tmp/jobetix_resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("", status_code=status.HTTP_201_CREATED)
async def apply(
    job_id: int = Form(...),
    cover_letter: str = Form(...),
    resume: UploadFile | None = File(None),
    db: Session = Depends(lambda: SessionLocal()),
    user=Depends(get_current_user),
) -> dict:
    init_db()

    # Prevent duplicate application
    existing = (
        db.query(Application)
        .filter(Application.user_id == user.id, Application.job_id == job_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this opportunity")

    # Handle resume upload
    resume_path = None
    if resume and resume.filename:
        ext = os.path.splitext(resume.filename)[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a PDF, DOC, or DOCX file.",
            )

        content = await resume.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 5 MB.",
            )

        filename = f"{uuid.uuid4().hex}_{resume.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(content)

        resume_path = filepath

    app_obj = Application(
        user_id=user.id,
        job_id=job_id,
        cover_letter=cover_letter,
        resume_path=resume_path,
    )
    db.add(app_obj)
    db.commit()
    db.refresh(app_obj)
    return {"id": app_obj.id, "resume_uploaded": resume_path is not None}


@router.get("/mine")
def my_applications(
    db: Session = Depends(lambda: SessionLocal()),
    user=Depends(get_current_user),
) -> list[dict]:
    init_db()
    apps = (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "job_id": a.job_id,
            "cover_letter": a.cover_letter,
            "resume_uploaded": a.resume_path is not None,
            "created_at": a.created_at,
        }
        for a in apps
    ]
