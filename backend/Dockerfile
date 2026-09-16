# Backend container for Google Cloud Run (FastAPI)
# Uses slim Python image and runs uvicorn

FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (better Docker layer caching)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY backend ./backend

# Cloud Run expects the container to listen on $PORT (defaults handled by platform)
# We'll use uvicorn directly.
EXPOSE 8080

CMD ["sh", "-c", "python backend/migrate_add_phone_number.py && python backend/seed_internships.py && uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]

