# 📋 HireLoop AI - Comprehensive Feature Documentation

This document serves as an in-depth guide to every feature built within the **HireLoop AI Job Board** platform. It provides a detailed explanation of the functionality, user flows, and technical implementation for each major component of the application, fulfilling the assessment requirement for AI-generated documentation.

---

## 1. Dual-Role Authentication & Access Control

### Description
The platform supports two distinct user roles: **Job Seekers (Candidates)** and **Employers (Admins)**. This ensures that users only have access to the features and data relevant to their role.

### How It Works
- **Registration & Login:** Users can sign up via a secure form. Passwords are cryptographically hashed using Django's built-in security features.
- **JWT Authorization:** Upon successful login, the backend issues an Access Token and a Refresh Token (JSON Web Tokens). The frontend securely stores these tokens and attaches them as `Bearer` tokens in the headers of all subsequent API requests.
- **Route Protection:** React Router (`react-router-dom`) uses a custom `<ProtectedRoute>` wrapper that prevents unauthenticated users from accessing dashboards. Similarly, the backend uses Django Rest Framework's `IsAuthenticated` and custom role-based permission classes to block unauthorized API access.

---

## 2. Advanced Job Discovery (Landing Page & Job Board)

### Description
The core of the platform is the robust job discovery system. It allows candidates to browse, search, and filter available job postings in real-time.

### How It Works
- **Dynamic Search:** A modern search bar allows users to input keywords related to job titles or companies.
- **Multi-parameter Filtering:** Users can filter the job feed based on multiple criteria simultaneously:
  - **Location:** Dropdown of available cities.
  - **Job Type:** Checkboxes for Full-time, Part-time, Contract, Remote, etc.
  - **Salary Range:** Sliders to filter jobs within a specific compensation bracket.
- **Technical Implementation:** The frontend React components construct query parameters (e.g., `?search=developer&location=Remote`) and send them to the Django backend. The backend uses Django's `Q` objects and filtering mechanisms to query the PostgreSQL database efficiently and return matching results.

---

## 3. Comprehensive Job Details & Instant Apply

### Description
When a user clicks on a job card, they are taken to a detailed view of the position. This page highlights everything a candidate needs to know and provides a frictionless application process.

### How It Works
- **Job Description Page:** Displays the job title, company name, location, salary range, vacancies, and a rich-text description of the responsibilities and requirements.
- **One-Click Application:** If the user is logged in, they can click the "Apply Now" button.
- **Application Validation:** The system performs checks to prevent duplicate applications. If the user has already applied for the specific job, the "Apply Now" button dynamically transforms into an "Already Applied" state, preventing spam and improving UX.

---

## 4. Candidate Profiles & Resume Management

### Description
Candidates have a dedicated profile dashboard where they can manage their professional identity and contact information.

### How It Works
- **Profile Data:** Users can update their phone number, LinkedIn profile link, GitHub repository link, and personal portfolio URL.
- **Resume Uploads:** A secure file upload feature allows candidates to attach their PDF resume to their profile.
- **Backend Storage:** The uploaded resumes are processed by the Django backend and stored securely in the designated media directory. The paths are saved to the PostgreSQL database, linked to the user's profile model.

---

## 5. Candidate Application Dashboard (Job Seeker View)

### Description
Candidates need a way to track the progress of their applications. The "My Applications" dashboard provides a bird's-eye view of all the jobs they have applied for.

### How It Works
- **Status Tracking:** Each application displays its current status (e.g., `Pending`, `Reviewed`, `Interviewing`, `Accepted`, `Rejected`).
- **Real-Time Data:** The frontend fetches the user's application history from the `/api/applications/` endpoint. The data is presented in clean, modern, glassmorphic cards indicating the job title, the company, the date applied, and a color-coded status badge.

---

## 6. Employer Admin Dashboard

### Description
Employers have access to a powerful administrative dashboard. This is where they manage the hiring pipeline and review incoming talent.

### How It Works
- **Applicant Tracking System (ATS):** The Admin Dashboard aggregates all applications submitted for the company's job postings.
- **Status Management:** Employers can update the status of an application directly from the dashboard. Changing a candidate's status to `Interviewing` or `Rejected` instantly reflects on the candidate's personal dashboard.
- **Candidate Details:** Employers can click on an application to view the candidate's full profile, including their contact info, social links, and cover letter notes.

---

## 7. Integrated In-App Resume Viewer

### Description
To provide a seamless, enterprise-grade experience, the platform includes a custom PDF resume viewer built directly into the browser. Employers do not need to download potentially unsafe files to their local machines.

### How It Works
- **Secure Blob Fetching:** Instead of exposing public URLs for private user resumes, the React frontend uses the authenticated `axiosInstance` to fetch the resume file as a secure binary `blob`.
- **Iframe Rendering:** The blob is converted into an object URL and rendered inside a custom, dark-themed Modal (`ResumeViewerModal.jsx`). 
- **Browser Native Controls:** The viewer hooks into the browser's native PDF rendering engine, providing built-in zooming, panning, and printing functionality while keeping the user immersed in the HireLoop ecosystem.
- **Scroll Locking:** When the modal opens, the background page scroll is locked (`overflow: hidden`) to prevent the UI from jumping, ensuring a polished user experience.

---

## 8. Modern UI/UX Aesthetic

### Description
The application abandons generic layouts in favor of a "medical-precision" modern dark theme, designed to feel premium, trustworthy, and technologically advanced.

### How It Works
- **CSS Variables & Theming:** A centralized `index.css` file uses CSS variables (e.g., `--bg-dark`, `--primary-accent`) to enforce a strict, cohesive color palette across all React components.
- **Glassmorphism & Gradients:** Cards and modals utilize semi-transparent backgrounds (`rgba`), backdrop-blur effects, and subtle glowing borders to create depth and hierarchy.
- **Micro-interactions:** Buttons and cards feature smooth hover animations (lifting effects, color transitions) to make the interface feel alive and responsive.
- **Scroll-to-Top Management:** The application employs programmatic scrolling (`window.scrollTo`) to ensure that navigating between long pages or opening modals always resets the viewport to the correct position, eliminating "cut-off" UI bugs.

---

## 9. Automated CI/CD Pipeline (Deployment)

### Description
The project fulfills the assessment requirement of having a fully automated Continuous Integration and Continuous Deployment (CI/CD) pipeline.

### How It Works
- **GitHub Actions:** A custom `.github/workflows/deploy.yml` file is configured in the repository.
- **Trigger:** Any code pushed to the `main` branch automatically triggers a cloud build.
- **Frontend Vercel Deployment:** The GitHub Action provisions an Ubuntu environment, installs Node.js, builds the React/Vite project, and securely pushes the production artifacts to Vercel via the Vercel CLI.
- **Backend Render Deployment:** The Django backend is deployed to Render.com, utilizing an automated `build.sh` script to collect static files (via WhiteNoise), apply database migrations to the cloud PostgreSQL database, and serve the API via `gunicorn`.
