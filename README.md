# 🚀 HireLoop AI - Modern Job Board Platform

Welcome to **HireLoop AI**, a full-stack, enterprise-grade job board assessment project. This platform bridges the gap between top-tier talent and innovative companies through a seamless, premium, dark-themed user experience.

![HireLoop Interface](https://img.shields.io/badge/UI-Medical_Precision_Dark_Theme-0f172a?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-React_|_Django_|_Vite-blue?style=for-the-badge)

## ✨ Core Features

### 1. 💼 Advanced Job Discovery
- **Live Search & Filtering:** Filter jobs dynamically by Title, Location, Job Type (Full-time, Part-time, Contract, etc.), and Salary ranges.
- **Premium UI/UX:** Built with a "medical-precision" modern dark aesthetic, featuring glassmorphism cards, interactive hover states, and smooth scroll animations.
- **Detailed Job Views:** Comprehensive job description pages highlighting requirements, salary, and instant apply functionality.

### 2. 👥 Dual-Role Authentication System
Secure Role-Based Access Control (RBAC) powered by JWT (JSON Web Tokens).
- **Job Seekers:** Can browse jobs, submit applications, track application status, and manage their professional profiles (Resume, GitHub, LinkedIn).
- **Employers (Admin):** Dedicated administrative dashboard to manage job postings, review applicant resumes in an integrated PDF viewer, and update application statuses in real-time.

### 3. 📄 Integrated Candidate Profiles
- **Resume Management:** Secure PDF resume uploads.
- **In-App Resume Viewer:** Employers can instantly view candidate resumes in a secure, embedded iframe modal without leaving the dashboard or downloading files.
- **Social Connectivity:** Link GitHub, LinkedIn, and Portfolio URLs directly to applications.

### 4. ⚡ Real-Time Application Tracking
- Applicants can view the status of their applications (Pending, Reviewed, Interviewing, Accepted, Rejected) in their personal dashboard.
- Employers can seamlessly transition candidates through the hiring pipeline via the Admin interface.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React.js powered by Vite
- **Routing:** React Router v6
- **Styling:** Vanilla CSS3 with CSS Variables for consistent theming
- **Deployment:** Vercel (CI/CD via GitHub Actions)

### Backend
- **Framework:** Django & Django REST Framework (DRF)
- **Database:** PostgreSQL
- **Authentication:** SimpleJWT
- **Static Files:** WhiteNoise
- **Deployment:** Render (WSGI via Gunicorn)

---

## 🚀 Deployment & CI/CD

This project is configured with a robust, automated CI/CD pipeline.

- **Frontend CI/CD:** A GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically runs on every push to the `main` branch. It installs dependencies, builds the Vite project, and securely deploys the production artifacts to **Vercel** using the Vercel CLI.
- **Backend Infrastructure:** The Django application is configured for production on **Render** utilizing `gunicorn` as the WSGI server, `dj-database-url` for cloud database connectivity, and `whitenoise` for optimal static file serving.

---

## 📖 Local Development Guide

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL (Optional, defaults to SQLite locally)

### 1. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

---
*Developed as an assessment for the Software Engineer position.*