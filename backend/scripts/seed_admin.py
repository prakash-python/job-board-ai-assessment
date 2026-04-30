"""
Seed script to create a default admin user.
Run with: python scripts/seed_admin.py

Reads credentials from environment variables:
  - ADMIN_EMAIL
  - ADMIN_PASSWORD
  - ADMIN_NAME

Usage:
  cd backend
  python scripts/seed_admin.py
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Load environment variables from .env
from dotenv import load_dotenv
load_dotenv()

django.setup()

# ─── Import after Django setup ────────────────────────────────────────────────
from apps.accounts.models import User


def seed_admin():
    """Create the default admin user if it does not already exist."""
    email = os.getenv('ADMIN_EMAIL', 'admin@jobboard.com')
    password = os.getenv('ADMIN_PASSWORD', 'Admin@123')
    name = os.getenv('ADMIN_NAME', 'Super Admin')

    if User.objects.filter(email=email).exists():
        print(f"[SEED] Admin user already exists: {email}")
        return

    user = User.objects.create_superuser(
        username=email,
        email=email,
        password=password,
        name=name,
        role=User.Role.ADMIN,
        is_staff=True,
        is_superuser=True,
    )

    print(f"[SEED] Admin user created successfully!")
    print(f"       Email:    {user.email}")
    print(f"       Name:     {user.name}")
    print(f"       Role:     {user.role}")


if __name__ == '__main__':
    seed_admin()
