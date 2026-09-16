from app.db.init_db import init_db
from app.db.models import Job
from app.db.session import SessionLocal


INTERNSHIPS = [
    {
        "company": "Kaizenat",
        "title": "Node.js Intern",
        "location": "Remote",
        "job_type": "Internship",
        "description": "Internship opportunity for candidates interested in Node.js backend development.",
    },
    {
        "company": "Kaizenat",
        "title": "React.js Intern",
        "location": "Remote",
        "job_type": "Internship",
        "description": "Internship opportunity for candidates interested in React.js frontend development.",
    },
    {
        "company": "Kaizenat",
        "title": "Python Intern",
        "location": "Remote",
        "job_type": "Internship",
        "description": "Internship opportunity for candidates interested in Python development.",
    },
    {
        "company": "Kasplo",
        "title": "Frontend Intern",
        "location": "Bangalore",
        "job_type": "Internship",
        "description": "Frontend internship focused on building user interfaces and web application features.",
    },
    {
        "company": "Techdew",
        "title": "PHP Developer Intern",
        "location": "Chennai",
        "job_type": "Internship",
        "description": "PHP developer internship for candidates interested in server-side web development.",
    },
    {
        "company": "Impactiva",
        "title": "Data Analyst Intern",
        "location": "Chennai",
        "job_type": "Internship",
        "description": "Data analyst internship focused on working with business data, reports, and insights.",
    },
    {
        "company": "Ventra Health",
        "title": "Data Analyst",
        "location": "Remote",
        "job_type": "Full-time",
        "description": "Remote data analyst role focused on analyzing data and supporting reporting workflows.",
    },
    {
        "company": "Zoho",
        "title": "Training & Internship",
        "location": "Chennai",
        "job_type": "Internship",
        "description": "Training and internship opportunity for candidates looking to build practical software skills.",
    },
    {
        "company": "Infinity Crest Group",
        "title": "Junior UI Designer",
        "location": "Chennai",
        "job_type": "Full-time",
        "description": "Junior UI designer role focused on creating clean and usable digital interfaces.",
    },
    {
        "company": "Winngoo UK Pvt Ltd",
        "title": "UI/UX Designer",
        "location": "Chennai",
        "job_type": "Full-time",
        "description": "UI/UX designer role focused on user experience, visual design, and product interfaces.",
    },
    {
        "company": "Skills Nurture",
        "title": "Data Science Intern",
        "location": "Remote",
        "job_type": "Internship",
        "description": "Data science internship focused on data analysis, modeling, and practical machine learning tasks.",
    },
    {
        "company": "Ascendas Technology",
        "title": "Junior Data Analyst",
        "location": "Chennai",
        "job_type": "Full-time",
        "description": "Junior data analyst role focused on preparing reports and finding insights from data.",
    },
    {
        "company": "Neolysi Technologies",
        "title": "Junior Software Developer",
        "location": "Chennai",
        "job_type": "Full-time",
        "description": "Junior software developer role for candidates starting their career in application development.",
    },
    {
        "company": "Neysa",
        "title": "Full Stack Developer Intern",
        "location": "Chennai",
        "job_type": "Internship",
        "description": "Full stack developer internship focused on frontend, backend, and web application development.",
    },
    {
        "company": "SCRY AI",
        "title": "Frontend Intern",
        "location": "Hyderabad",
        "job_type": "Internship",
        "description": "Frontend internship focused on building responsive web interfaces and frontend features.",
    },
    {
        "company": "Koders",
        "title": "Frontend Intern",
        "location": "Remote",
        "job_type": "Internship",
        "description": "Remote frontend internship for candidates interested in modern web UI development.",
    },
    {
        "company": "Krevok",
        "title": "UI/UX Designer",
        "location": "Chennai",
        "job_type": "Full-time",
        "description": "UI/UX designer role focused on interface design, user flows, and product experience.",
    },
    {
        "company": "Talview",
        "title": "Software Developer Intern",
        "location": "Bangalore",
        "job_type": "Internship",
        "description": "Software developer internship for candidates looking to gain hands-on coding experience.",
    },
    {
        "company": "Giva",
        "title": "Frontend Developer",
        "location": "Bangalore",
        "job_type": "Full-time",
        "description": "Frontend developer role focused on building and improving web application interfaces.",
    },
    {
        "company": "Adcanopus Digital Media",
        "title": "Frontend Developer",
        "location": "Bangalore",
        "job_type": "Full-time",
        "description": "Frontend developer role focused on creating responsive and engaging web experiences.",
    },
    {
        "company": "Syntellite",
        "title": "MERN Stack Intern",
        "location": "Bangalore",
        "job_type": "Internship",
        "description": "MERN stack internship focused on MongoDB, Express, React, and Node.js application development.",
    },
    {
        "company": "Care.fi",
        "title": "Data Analyst",
        "location": "Bangalore",
        "job_type": "Full-time",
        "description": "Data analyst role focused on analyzing business data and supporting decision-making.",
    },
    {
        "company": "Infosys",
        "title": "Graduate Trainee Engineer (2024/2025 Freshers)",
        "location": "Hyderabad",
        "job_type": "Full-time",
        "description": "Fresher role for recent graduates. Training provided in full stack development, cloud, and modern programming languages.",
    },
    {
        "company": "Cognizant",
        "title": "Junior Software Engineer (Fresher)",
        "location": "Chennai",
        "job_type": "Full-time",
        "description": "Entry-level software engineering role for fresh graduates. Work with enterprise clients on web applications and APIs.",
    },
    {
        "company": "Google for Startups Accelerator",
        "title": "Machine Learning Intern",
        "location": "Remote",
        "job_type": "Internship",
        "description": "Student internship opportunity working with NLP, computer vision, and predictive machine learning models.",
    },
    {
        "company": "Amazon Web Services",
        "title": "Cloud & DevOps Intern",
        "location": "Bangalore",
        "job_type": "Internship",
        "description": "Summer internship for computer science students interested in AWS infrastructure, Docker, CI/CD pipelines, and cloud automation.",
    },
    {
        "company": "Razorpay",
        "title": "Backend Engineering Intern",
        "location": "Bangalore",
        "job_type": "Internship",
        "description": "Exciting internship for students in fintech. Build scalable payment microservices in Go, Python, and Node.js.",
    },
    {
        "company": "TCS",
        "title": "Associate System Engineer (0-1 Yrs / Fresher)",
        "location": "Chennai",
        "job_type": "Full-time",
        "description": "Entry-level position for engineering freshers. Hands-on coding and maintenance of high-throughput software systems.",
    },
    {
        "company": "Cred",
        "title": "UI/UX Product Design Intern",
        "location": "Bangalore",
        "job_type": "Internship",
        "description": "Design internship for creative students. Prototype intuitive fintech consumer experiences using Figma and user research.",
    },
]


from datetime import datetime, timedelta

def seed_jobs() -> None:
    init_db()
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        # Purge any expired jobs
        expired_count = db.query(Job).filter(Job.deadline != None, Job.deadline < now).delete(synchronize_session=False)
        if expired_count:
            print(f"Purged {expired_count} expired opportunities from database.")

        added = 0
        updated = 0

        for i, item in enumerate(INTERNSHIPS):
            # Calculate deadline staggered between 14 to 45 days from current date
            days_valid = 14 + (i % 30)
            item_deadline = now + timedelta(days=days_valid)

            exists = (
                db.query(Job)
                .filter(
                    Job.company == item["company"],
                    Job.title == item["title"],
                    Job.location == item["location"],
                )
                .first()
            )
            if exists:
                # Update deadline so freshers always see active deadlines
                if not exists.deadline or exists.deadline < now:
                    exists.deadline = item_deadline
                    updated += 1
                continue

        # Stream live real-time internships & jobs from LinkedIn & Indeed
        try:
            from app.services.live_sync import sync_live_jobs
            print("Streaming real-time live jobs from LinkedIn & Indeed...")
            sync_res = sync_live_jobs(db, limit_per_query=6)
            print(f"Live sync result: {sync_res}")
        except Exception as sync_err:
            print(f"Live sync notice: {sync_err}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_jobs()
