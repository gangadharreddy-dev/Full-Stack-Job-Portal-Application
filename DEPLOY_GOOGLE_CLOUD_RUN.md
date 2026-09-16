# Deploy Job Portal to Google Cloud (Cloud Run + Cloud Storage)

This repo is a FastAPI (backend) + React (frontend).

Per your choice, we will:
- Deploy **backend** to **Cloud Run**
- Deploy **frontend** to **Cloud Storage** (static hosting) + (optional) CDN via Cloud CDN

## 0) Prereqs
- Install Google Cloud SDK (gcloud)
- Authenticate: `gcloud auth login`
- Set project: `gcloud config set project <PROJECT_ID>`

## 1) Build + push backend container

### Build
From repo root:

```bash
gcloud builds submit --tag gcr.io/<PROJECT_ID>/job-portal-api:$(date +%Y%m%d-%H%M%S) --timeout=20m
```

If that fails (because Cloud Build needs a `cloudbuild.yaml`), use local Docker instead:

```bash
docker build -f backend/Dockerfile -t gcr.io/<PROJECT_ID>/job-portal-api:latest .
docker push gcr.io/<PROJECT_ID>/job-portal-api:latest
```

> Note: the Dockerfile runs `seed_internships.py` and `migrate_add_phone_number.py` at startup.

## 2) Deploy backend to Cloud Run

```bash
gcloud run deploy job-portal-api \
  --image gcr.io/<PROJECT_ID>/job-portal-api:latest \
  --platform managed \
  --region <REGION> \
  --allow-unauthenticated=false \
  --set-env-vars JWT_SECRET_KEY=<YOUR_SECRET>,FRONTEND_ORIGINS=<YOUR_FRONTEND_ORIGIN>,DATABASE_URL=sqlite:///./app.db
```

### Important note about SQLite on Cloud Run
Cloud Run instances are ephemeral; SQLite writes may disappear between restarts. For production, migrate to Postgres/Cloud SQL.

## 3) Deploy frontend to Cloud Storage

### Build frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Create bucket
```bash
gcloud storage buckets create gs://<BUCKET_NAME> --location=<REGION>
```

### Upload built assets
```bash
gcloud storage cp -r frontend/dist/* gs://<BUCKET_NAME>/
```

### Enable static website / CDN
- Configure bucket for static website hosting (or use Cloud CDN + HTTPS)
- If you use a custom domain, update `FRONTEND_ORIGINS` accordingly and set HTTPS origin.

## 4) Configure API base URL
Frontend reads:
- `VITE_API_BASE_URL`

Because we are hosting frontend as static files, you have two options:
1) Set the API base URL at build time (simple):
   - `VITE_API_BASE_URL=https://<CLOUD_RUN_BACKEND_URL>` during `npm run build`.
2) Keep a runtime config script (requires extra work).

For option (1), rebuild frontend with:

```bash
cd frontend
VITE_API_BASE_URL=https://job-portal-api-<hash>-uc.a.run.app npm run build
cd ..
```

## 5) CORS
Set `FRONTEND_ORIGINS` in Cloud Run to the exact origin of your frontend (including scheme + domain).

## 6) Smoke test
- Backend health: `GET <CLOUD_RUN_BACKEND_URL>/health`
- Frontend should load from the bucket URL and call API successfully.

