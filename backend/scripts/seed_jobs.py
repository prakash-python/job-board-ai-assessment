"""
Seed script to add dummy jobs with deadlines and spread dates.
Run with: python scripts/seed_jobs.py
"""

import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django.setup()

# ─── Import after Django setup ────────────────────────────────────────────────
from apps.accounts.models import User
from apps.jobs.models import Job


def seed_jobs():
    """Create dummy jobs if they do not already exist."""
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@jobboard.com')
    
    try:
        admin_user = User.objects.get(email=admin_email)
    except User.DoesNotExist:
        print(f"[SEED] Error: Admin user {admin_email} not found. Run seed_admin.py first.")
        return

    now = timezone.now()

    dummy_jobs = [
        {
            "title": "Senior Frontend Developer",
            "company": "TechVision Inc.",
            "location": "New York, USA",
            "job_type": Job.JobType.FULL_TIME,
            "description": "We are looking for an experienced React developer to join our core team.",
            "deadline": (now + timedelta(days=15)).date(),
            "days_ago": 0
        },
        {
            "title": "Backend Software Engineer",
            "company": "CloudScale Solutions",
            "location": "San Francisco, USA",
            "job_type": Job.JobType.FULL_TIME,
            "description": "Join our backend team to build scalable APIs using Django.",
            "deadline": (now + timedelta(days=10)).date(),
            "days_ago": 2
        },
        {
            "title": "UI/UX Designer",
            "company": "Creative Minds",
            "location": "Remote",
            "job_type": Job.JobType.REMOTE,
            "description": "We need a creative designer to help us craft beautiful experiences.",
            "deadline": (now + timedelta(days=5)).date(),
            "days_ago": 5
        },
        {
            "title": "Data Scientist",
            "company": "DataInsights",
            "location": "London, UK",
            "job_type": Job.JobType.FULL_TIME,
            "description": "Help us turn data into actionable insights.",
            "deadline": (now + timedelta(days=20)).date(),
            "days_ago": 12
        },
        {
            "title": "Project Manager",
            "company": "Global Connect",
            "location": "Berlin, Germany",
            "job_type": Job.JobType.CONTRACT,
            "description": "Lead international software projects.",
            "deadline": (now + timedelta(days=3)).date(),
            "days_ago": 25
        },
        {
            "title": "Marketing Intern",
            "company": "GrowthSpark",
            "location": "Paris, France",
            "job_type": Job.JobType.INTERNSHIP,
            "description": "Gain hands-on experience in digital marketing.",
            "deadline": (now + timedelta(days=30)).date(),
            "days_ago": 45
        },
    ]

    for job_data in dummy_jobs:
        days_ago = job_data.pop('days_ago')
        job, created = Job.objects.update_or_create(
            title=job_data['title'], 
            company=job_data['company'],
            defaults=job_data | {"created_by": admin_user}
        )
        
        # Override created_at (auto_now_add doesn't allow it in create/update_or_create)
        Job.objects.filter(id=job.id).update(created_at=now - timedelta(days=days_ago))
        
        if created:
            print(f"[SEED] Created job: {job.title} at {job.company}")
        else:
            print(f"[SEED] Updated job: {job.title} at {job.company}")

    print(f"[SEED] Job seeding completed with deadlines and spread dates!")


if __name__ == '__main__':
    seed_jobs()
