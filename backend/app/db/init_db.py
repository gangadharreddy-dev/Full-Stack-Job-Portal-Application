from sqlalchemy import inspect, text
from app.db.session import engine
from app.db.models import Base


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        # Migrate jobs table
        if "jobs" in tables:
            columns = {c["name"] for c in inspector.get_columns("jobs")}
            if "deadline" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE jobs ADD COLUMN deadline DATETIME NULL"))
            if "apply_url" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE jobs ADD COLUMN apply_url VARCHAR(500) NULL"))

        # Migrate applications table
        if "applications" in tables:
            columns = {c["name"] for c in inspector.get_columns("applications")}
            if "resume_path" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE applications ADD COLUMN resume_path VARCHAR(500) NULL"))

    except Exception as e:
        print(f"Migration note: {e}")
