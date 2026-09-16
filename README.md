<img width="2939" height="1667" alt="image" src="https://github.com/user-attachments/assets/cb3b664f-8786-4748-878c-af9776f5125a" />

# Full Stack Job Portal Application

A modern Full Stack Job Portal built with FastAPI, React, TypeScript, SQLite, and JWT Authentication.

# Live Application:
https://job-portal-frontend-195k.onrender.com/

## Features

* User Registration & Login
* JWT Authentication
* Browse Available Jobs
* View Job Details
* Apply for Jobs
* Track My Applications
* Responsive React Frontend
* FastAPI REST API Backend
* SQLite Database Integration

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* JWT Authentication
* Pydantic

## Project Structure

```text
Full Stack Job Portal Application
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── app.db
│   └── seed_internships.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── render.yaml
```

## Installation

### Backend Setup

```bash
cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

### Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

(or the next available port)

## API Endpoints

### Authentication

* POST /api/auth/register
* POST /api/auth/login

### Jobs

* GET /api/jobs
* GET /api/jobs/{job_id}
* POST /api/jobs

### Applications

* POST /api/applications
* GET /api/applications/mine

## Database

The application uses SQLite for development.

Database file:

```text
backend/app.db
```

Sample internship data can be inserted using:

```bash
python seed_internships.py
```

## Deployment

### Backend

* Render
* Railway

### Frontend

* Netlify
* Vercel
* Render Static Site

## Screenshots

### Home Page & Job Listings

<img width="1470" height="835" alt="Home Page" src="https://github.com/user-attachments/assets/3e6aa737-6559-457f-8729-3d72f22f35ec" />

### Job Search & Filtering

<img width="1470" height="831" alt="Job Search" src="https://github.com/user-attachments/assets/34437152-58b8-4a46-9db9-92bf0a43d4d4" />

### My Applications

<img width="1470" height="835" alt="My Applications" src="https://github.com/user-attachments/assets/db23c0e7-85f4-4c74-82d6-8377e7f8154d" />

## Future Enhancements

* Resume Upload
* Admin Dashboard
* Company Profiles
* Email Notifications
* PostgreSQL Support
* Advanced Job Search & Filters

## Author

Gangadhar Reddy

GitHub:
https://github.com/gangadharreddy065-create
