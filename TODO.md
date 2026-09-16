# TODO - Google Cloud deployment (Cloud Run)

- [ ] Create a backend Dockerfile for FastAPI/uvicorn
- [ ] Create a frontend build step for static hosting (either Cloud Run frontend container or Cloud Storage + backend URL)
- [ ] Add `backend/.dockerignore` and `frontend/.dockerignore` (optional but recommended)
- [ ] Add scripts/commands to build and test locally (Docker build + run)
- [ ] Add Cloud Run deployment instructions for backend (and frontend if containerized)
- [ ] Update backend config defaults for production (CORS origins, DATABASE_URL)
- [ ] Verify `/health`, auth, jobs endpoints from Cloud Run
- [ ] Document required env vars in a template `.env.example`

