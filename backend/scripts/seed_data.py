"""
Seed command: python manage.py seed_data
Populates the database with 10 realistic Indian MNC companies and 100 detailed job postings.
"""
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.jobs.models import Company, Job
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with realistic Indian MNC companies and jobs'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        Job.objects.all().delete()
        Company.objects.all().delete()

        # Ensure an admin user exists for seeding
        admin_user = User.objects.filter(role='ADMIN').first()
        if not admin_user:
            self.stdout.write(self.style.WARNING('No ADMIN user found. Creating a default admin...'))
            admin_user = User.objects.create_superuser(
                email='admin@hireloop.in',
                password='Admin@12345',
                name='Hireloop Admin',
            )
            admin_user.role = 'ADMIN'
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Default admin created: admin@hireloop.in / Admin@12345'))

        self.stdout.write('Creating companies...')
        companies_data = [
            {
                "name": "Tata Consultancy Services",
                "industry": "IT Services & Consulting",
                "location": "Hyderabad, Telangana",
                "logo": "/logos/tcs.png",
                "description": (
                    "Tata Consultancy Services (TCS) is a global leader in IT services, consulting, and business solutions, "
                    "with a presence in over 50 countries. Part of the Tata Group, TCS has a legacy of over 55 years of "
                    "delivering excellence in technology and innovation. With a workforce of over 600,000 associates, TCS "
                    "partners with the world's leading businesses in their transformation journeys through cognitive, agile, "
                    "and cloud-native platforms. TCS India operates several world-class delivery centers across Hyderabad, "
                    "Bengaluru, Chennai, Pune, and Kolkata — making it one of the largest private employers in India. "
                    "At TCS, we believe in a culture of continuous learning, inclusive growth, and social responsibility."
                ),
            },
            {
                "name": "Infosys",
                "industry": "IT Services & Consulting",
                "location": "Bangalore, Karnataka",
                "logo": "/logos/infosys.png",
                "description": (
                    "Infosys is a global leader in next-generation digital services and consulting. Founded in 1981 in "
                    "Pune, India, Infosys has grown to become one of the world's most admired technology companies, "
                    "with revenues exceeding $18 billion and 300,000+ employees worldwide. Infosys enables clients in "
                    "more than 56 countries to navigate their digital transformation journey. Its Bengaluru headquarters "
                    "is home to a sprawling, award-winning campus that has become an icon of Indian IT excellence. "
                    "Infosys is recognized for its commitment to sustainability, ethical governance, and employee welfare, "
                    "consistently ranking as one of India's Best Employers."
                ),
            },
            {
                "name": "Wipro",
                "industry": "IT Services & Consulting",
                "location": "Hyderabad, Telangana",
                "logo": "/logos/wipro.png",
                "description": (
                    "Wipro Limited is a leading global information technology, consulting, and business process services company. "
                    "Headquartered in Bengaluru, Karnataka, Wipro harnesses the power of cognitive computing, hyper-automation, "
                    "robotics, cloud, analytics, and emerging technologies to help clients adapt to the digital world and "
                    "make them successful. With an enduring commitment to corporate citizenship, Wipro operates across 65+ "
                    "countries with a total workforce of 250,000+ associates. The company has a strong presence in Hyderabad "
                    "with state-of-the-art development centers focused on cloud engineering and AI solutions."
                ),
            },
            {
                "name": "HCL Technologies",
                "industry": "IT Services & Engineering",
                "location": "Visakhapatnam, Andhra Pradesh",
                "logo": "/logos/hcl.png",
                "description": (
                    "HCL Technologies is a next-generation global technology company that helps enterprises reimagine their "
                    "businesses for the digital age. With its technology products, services, and an extensive global network "
                    "of R&D, innovation labs, and delivery centers, HCL works with leading Fortune 500 companies across key "
                    "verticals. HCLTech's Vizag delivery center is one of its fastest-growing campuses in India, specializing "
                    "in engineering R&D services, enterprise software, and digital transformation. The company is renowned "
                    "for its 'Employee First' culture, offering competitive packages, flexible work models, and global mobility."
                ),
            },
            {
                "name": "Tech Mahindra",
                "industry": "IT Services & Telecom",
                "location": "Hyderabad, Telangana",
                "logo": "/logos/techmahindra.png",
                "description": (
                    "Tech Mahindra is a leading provider of digital transformation, consulting, and business re-engineering "
                    "services and solutions. A USD 6.5 billion company with 163,000+ professionals across 90 countries, "
                    "Tech Mahindra focuses on leveraging next-generation technologies including 5G, IoT, AI, and cloud "
                    "to enable end-to-end digital transformation. Its Hyderabad campus is its largest hub globally, "
                    "serving the telecom, banking, manufacturing, and healthcare verticals. Tech Mahindra is a Mahindra "
                    "Group Company and has been consistently recognized as a Great Place to Work."
                ),
            },
            {
                "name": "Cyient",
                "industry": "Engineering & Technology",
                "location": "Hyderabad, Telangana",
                "logo": "/logos/cyient.png",
                "description": (
                    "Cyient is a global engineering and technology solutions company headquartered in Hyderabad, India. "
                    "With over 15,500 associates worldwide and a presence in 21 countries, Cyient delivers advanced "
                    "design, technology, and digital solutions to global industry leaders in aerospace, defense, energy, "
                    "medical devices, and transportation. Founded in 1991, Cyient has grown from a geospatial services "
                    "company into a full-spectrum engineering partner. Cyient's culture champions innovation, quality, "
                    "and sustainability — with a strong 'Design-Led Manufacturing' vision for the future of industry."
                ),
            },
            {
                "name": "Zoho Corporation",
                "industry": "Enterprise Software",
                "location": "Bangalore, Karnataka",
                "logo": "/logos/zoho.png",
                "description": (
                    "Zoho Corporation is one of India's most iconic and profitable technology companies, operating entirely "
                    "without external funding. Founded in 1996, Zoho offers a comprehensive suite of over 55 cloud-based "
                    "business applications — from CRM and project management to HR, finance, and collaboration tools — "
                    "used by more than 80 million users worldwide. Zoho's Bengaluru office is a major R&D hub, housing "
                    "thousands of engineers who build world-class SaaS products. The company is celebrated for its "
                    "tranquil work culture, focus on employee development, and its unconventional philosophy of building "
                    "long-term, sustainable businesses over short-term profitability."
                ),
            },
            {
                "name": "Freshworks",
                "industry": "SaaS & Cloud Software",
                "location": "Hyderabad, Telangana",
                "logo": "/logos/freshworks.png",
                "description": (
                    "Freshworks is a Nasdaq-listed SaaS company that makes it fast and easy for businesses of all sizes "
                    "to delight their customers and employees. Freshworks has offices in 17 countries and over 65,000 "
                    "customers worldwide — from small businesses to Fortune 500 enterprises. Freshworks' product portfolio "
                    "includes Freshdesk, Freshservice, Freshsales, and Freshchat, among others. Its Hyderabad engineering "
                    "center is one of the most dynamic tech hubs in the city, known for its agile engineering culture, "
                    "fast-paced product cycles, and a vibrant startup-like work environment. Freshworks is consistently "
                    "recognized for its inclusive culture, generous benefits, and focus on employee well-being."
                ),
            },
            {
                "name": "Accenture India",
                "industry": "Consulting & Technology Services",
                "location": "Bangalore, Karnataka",
                "logo": "/logos/accenture.png",
                "description": (
                    "Accenture is a global professional services company with leading capabilities in digital, cloud, and "
                    "security. Combining unmatched experience and specialized skills across more than 40 industries, "
                    "Accenture offers Strategy and Consulting, Technology, Operations, Industry X, and Accenture Song "
                    "services. With revenues exceeding $64 billion and 740,000 employees worldwide, Accenture is one "
                    "of the world's largest employers. In India, Accenture's Bengaluru hub employs over 200,000 "
                    "professionals and is one of the company's largest delivery centers globally. Accenture India is "
                    "celebrated for its focus on reskilling, diversity and inclusion, and leadership development programs."
                ),
            },
            {
                "name": "Deloitte India",
                "industry": "Professional Services & Consulting",
                "location": "Hyderabad, Telangana",
                "logo": "/logos/deloitte.png",
                "description": (
                    "Deloitte is one of the 'Big Four' professional services firms in the world, with revenues exceeding "
                    "$65 billion and a network of 415,000+ professionals across more than 150 countries. Deloitte's India "
                    "offices span Hyderabad, Bengaluru, Mumbai, Delhi, and Kolkata, providing audit, consulting, financial "
                    "advisory, risk advisory, and tax services to India's largest corporations and government institutions. "
                    "Deloitte India's Hyderabad office is a major center for technology consulting, risk management, and "
                    "finance transformation. Known for a high-performance culture, Deloitte offers unparalleled career "
                    "growth, global exposure, and world-class learning programs through Deloitte University."
                ),
            },
        ]

        companies = []
        for data in companies_data:
            companies.append(Company.objects.create(
                name=data['name'],
                industry=data['industry'],
                location=data['location'],
                description=data['description'],
                logo=data['logo'],
            ))

        self.stdout.write('Creating detailed job postings...')

        all_locations = list(set([data['location'] for data in companies_data]))

        job_templates = [
            {
                "title": "Senior Software Engineer - Backend",
                "vacancies": 3,
                "description": lambda company: (
                    f"We are seeking an experienced Senior Software Engineer to join {company.name}'s core backend engineering team. "
                    f"In this role, you will design and build scalable, high-performance microservices that power millions of users.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Architect and develop robust REST/gRPC APIs using Python (Django/FastAPI) or Java (Spring Boot).\n"
                    f"- Lead technical design discussions, contribute to system design documents, and mentor junior engineers.\n"
                    f"- Collaborate with product managers and frontend engineers to deliver high-impact features.\n"
                    f"- Champion code quality through thorough code reviews, unit testing, and CI/CD best practices.\n"
                    f"- Optimize database queries and application performance across PostgreSQL and Redis.\n\n"
                    f"**Requirements:**\n"
                    f"- 4–8 years of experience in backend software development.\n"
                    f"- Strong proficiency in Python, Java, or Go.\n"
                    f"- Hands-on experience with Kubernetes, Docker, and cloud platforms (AWS/GCP/Azure).\n"
                    f"- Deep understanding of distributed systems, CAP theorem, and fault-tolerance patterns.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- Competitive salary and performance-linked bonuses.\n"
                    f"- Flexible work-from-home options and comprehensive health insurance.\n"
                    f"- Learning budget of ₹1,00,000 per year for certifications and courses.\n"
                    f"- Opportunity to work on large-scale, globally distributed systems."
                ),
            },
            {
                "title": "Product Manager - Platform",
                "vacancies": 2,
                "description": lambda company: (
                    f"{company.name} is looking for a strategic and data-driven Product Manager to lead the Platform team. "
                    f"You will own the product roadmap for our core infrastructure and developer-facing tools.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Define, prioritize, and communicate the product vision and roadmap for the platform.\n"
                    f"- Work closely with engineering leads to translate business requirements into detailed specifications.\n"
                    f"- Analyze product metrics and user research to make evidence-based decisions.\n"
                    f"- Collaborate with stakeholders across sales, marketing, and customer success to align priorities.\n"
                    f"- Drive go-to-market strategies for new platform features and capabilities.\n\n"
                    f"**Requirements:**\n"
                    f"- 3–6 years of product management experience, ideally with a B2B SaaS or enterprise software product.\n"
                    f"- Strong analytical skills with experience using tools like Mixpanel, Amplitude, or Tableau.\n"
                    f"- Excellent written and verbal communication skills.\n"
                    f"- Prior engineering or consulting background is a strong plus.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- Industry-leading compensation with ESOP grants.\n"
                    f"- High ownership and autonomy in a flat, collaborative culture.\n"
                    f"- Opportunities to present your vision to C-level leadership and drive company-wide impact."
                ),
            },
            {
                "title": "Data Scientist - AI/ML",
                "vacancies": 4,
                "description": lambda company: (
                    f"Join {company.name}'s AI Center of Excellence as a Data Scientist and work on cutting-edge ML models "
                    f"that are deployed in real-world production systems at enterprise scale.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Develop, train, and deploy machine learning models for classification, regression, NLP, and forecasting.\n"
                    f"- Own the entire ML lifecycle: data collection, feature engineering, model training, evaluation, and monitoring.\n"
                    f"- Partner with data engineers to build robust, scalable data pipelines.\n"
                    f"- Publish research findings, technical blogs, and contribute to internal knowledge-sharing initiatives.\n\n"
                    f"**Requirements:**\n"
                    f"- 3–6 years of experience in data science or ML engineering.\n"
                    f"- Proficiency in Python (scikit-learn, TensorFlow, PyTorch, Hugging Face).\n"
                    f"- Experience with MLOps tools like MLflow, Kubeflow, or SageMaker.\n"
                    f"- Strong statistics and mathematics foundation.\n"
                    f"- Masters or Ph.D. in Computer Science, Statistics, or a related field preferred.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- Access to state-of-the-art GPU compute clusters and proprietary datasets.\n"
                    f"- Sponsorship for top-tier ML conferences (NeurIPS, ICML, ACL).\n"
                    f"- A culture that values scientific rigor, experimentation, and innovation."
                ),
            },
            {
                "title": "UI/UX Designer",
                "vacancies": 2,
                "description": lambda company: (
                    f"{company.name} is hiring a talented UI/UX Designer to create world-class user experiences for our "
                    f"enterprise products used by millions of users globally.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Lead end-to-end design projects from discovery and research to high-fidelity prototypes and handoff.\n"
                    f"- Conduct user interviews, usability tests, and synthesize findings into actionable design decisions.\n"
                    f"- Build and maintain a cohesive design system that aligns with our brand and product strategy.\n"
                    f"- Work closely with engineering teams to ensure pixel-perfect implementation.\n\n"
                    f"**Requirements:**\n"
                    f"- 3–5 years of UX/UI design experience.\n"
                    f"- Expert-level proficiency in Figma and prototyping tools.\n"
                    f"- Strong portfolio demonstrating user research, information architecture, and interaction design.\n"
                    f"- Experience designing complex, data-heavy enterprise applications.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- Creative ownership and direct access to user feedback loops.\n"
                    f"- Collaborative, cross-functional team environment.\n"
                    f"- Top-tier MacBook Pro workstation and premium design tool licenses."
                ),
            },
            {
                "title": "DevOps Engineer - Cloud Infrastructure",
                "vacancies": 3,
                "description": lambda company: (
                    f"We are looking for a skilled DevOps Engineer to join {company.name}'s Infrastructure team. "
                    f"You will be responsible for building and maintaining the highly available, secure cloud infrastructure "
                    f"that powers our global operations.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Design, build, and maintain CI/CD pipelines using Jenkins, GitLab CI, or GitHub Actions.\n"
                    f"- Manage Kubernetes clusters on AWS EKS or Google GKE, ensuring high availability and auto-scaling.\n"
                    f"- Write Infrastructure-as-Code using Terraform and Ansible.\n"
                    f"- Implement robust monitoring and alerting using Prometheus, Grafana, and PagerDuty.\n"
                    f"- Drive a culture of SRE best practices: SLOs, error budgets, and blameless post-mortems.\n\n"
                    f"**Requirements:**\n"
                    f"- 3–7 years of DevOps/SRE experience.\n"
                    f"- Deep expertise with AWS, GCP, or Azure.\n"
                    f"- Proficiency in scripting languages: Bash, Python.\n"
                    f"- AWS/GCP professional certifications are highly desirable.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- On-call compensation and generous PTO policy.\n"
                    f"- Access to cutting-edge cloud technologies and on-demand training budgets."
                ),
            },
            {
                "title": "Frontend Developer - React",
                "vacancies": 5,
                "description": lambda company: (
                    f"{company.name} is seeking a passionate Frontend Developer with strong React skills to build "
                    f"beautiful, responsive, and high-performance web applications.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Build reusable, accessible, and well-tested React components.\n"
                    f"- Collaborate with UI/UX designers to translate Figma designs into pixel-perfect interfaces.\n"
                    f"- Optimize web application performance (Core Web Vitals, lazy loading, code splitting).\n"
                    f"- Integrate with RESTful and GraphQL APIs.\n"
                    f"- Participate in Agile sprints, daily standups, and code reviews.\n\n"
                    f"**Requirements:**\n"
                    f"- 2–5 years of experience in frontend development.\n"
                    f"- Strong proficiency in React.js, TypeScript, and modern CSS (Styled Components, Tailwind).\n"
                    f"- Familiarity with state management solutions: Redux Toolkit, Zustand, or Jotai.\n"
                    f"- Experience with testing frameworks: Jest, React Testing Library.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- Work on a globally visible, high-impact product.\n"
                    f"- Remote-friendly culture with flexible work hours.\n"
                    f"- Competitive pay with quarterly performance reviews."
                ),
            },
            {
                "title": "Business Analyst - Digital Transformation",
                "vacancies": 2,
                "description": lambda company: (
                    f"Join {company.name} as a Business Analyst and play a pivotal role in driving digital transformation "
                    f"projects for Fortune 500 clients across BFSI, Retail, and Healthcare verticals.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Elicit, document, and validate business and functional requirements from client stakeholders.\n"
                    f"- Create detailed BRDs, FRDs, user stories, and process flow diagrams using BPMN.\n"
                    f"- Facilitate workshops, discovery sessions, and sprint planning ceremonies.\n"
                    f"- Serve as the primary liaison between business stakeholders and the engineering team.\n"
                    f"- Conduct UAT, create test plans, and ensure deliverables meet client acceptance criteria.\n\n"
                    f"**Requirements:**\n"
                    f"- 3–6 years of business analysis experience.\n"
                    f"- CBAP or PMI-PBA certification is a strong advantage.\n"
                    f"- Proficiency in tools like JIRA, Confluence, MS Visio, and SQL.\n"
                    f"- Excellent communication skills and ability to manage multiple priorities.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- Global client exposure and international travel opportunities.\n"
                    f"- Structured career paths with fast-track leadership programs."
                ),
            },
            {
                "title": "HR Business Partner",
                "vacancies": 1,
                "description": lambda company: (
                    f"{company.name} is looking for an experienced HR Business Partner to serve as a strategic advisor "
                    f"to our technology business units in Hyderabad and Bengaluru.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Partner with business unit leaders on talent planning, workforce development, and OKR alignment.\n"
                    f"- Drive performance management cycles, including goal-setting, mid-year reviews, and annual appraisals.\n"
                    f"- Champion employee engagement, culture-building, and retention initiatives.\n"
                    f"- Manage complex employee relations cases with empathy and legal compliance.\n"
                    f"- Analyze HR metrics and provide actionable insights to senior leadership.\n\n"
                    f"**Requirements:**\n"
                    f"- 5–8 years of experience in HR, with at least 3 years in an HRBP role.\n"
                    f"- MBA in HR from a premier institution preferred.\n"
                    f"- Deep knowledge of Indian labor law, compliance, and statutory requirements.\n"
                    f"- Experience in large IT/ITES organizations is strongly preferred.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- High visibility and strategic impact role.\n"
                    f"- Best-in-class benefits and wellness programs."
                ),
            },
            {
                "title": "Cloud Solutions Architect",
                "vacancies": 2,
                "description": lambda company: (
                    f"As a Cloud Solutions Architect at {company.name}, you will be responsible for designing and implementing "
                    f"cloud-native solutions for our largest enterprise clients, guiding them from on-premise monoliths to "
                    f"modern, distributed cloud architectures.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Engage with senior client stakeholders to understand business requirements and propose optimal cloud architectures.\n"
                    f"- Design end-to-end solutions on AWS, GCP, or Azure, covering compute, networking, security, and data.\n"
                    f"- Lead proof-of-concept engagements, cloud readiness assessments, and migration planning workshops.\n"
                    f"- Provide technical governance and oversight throughout the delivery lifecycle.\n\n"
                    f"**Requirements:**\n"
                    f"- 7–12 years of IT experience with at least 4 years in a cloud architecture role.\n"
                    f"- Mandatory: AWS Solutions Architect Professional, Google Cloud Professional Architect, or Azure Solutions Architect Expert certification.\n"
                    f"- Experience with Well-Architected Framework reviews and FinOps best practices.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- Leadership over multi-million dollar engagements.\n"
                    f"- Fully funded international certification and conference attendance."
                ),
            },
            {
                "title": "Software Development Engineer in Test (SDET)",
                "vacancies": 3,
                "description": lambda company: (
                    f"We are hiring a Software Development Engineer in Test (SDET) at {company.name} to build and scale "
                    f"our test automation infrastructure and champion quality across our engineering organization.\n\n"
                    f"**Key Responsibilities:**\n"
                    f"- Design, develop, and maintain automated test frameworks for API, UI, and performance testing.\n"
                    f"- Integrate automated tests into CI/CD pipelines to enable continuous quality gates.\n"
                    f"- Develop custom test tooling, harnesses, and data generators.\n"
                    f"- Drive shift-left testing practices, collaborating with developers during the design phase.\n"
                    f"- Report and track defects, analyze flaky tests, and drive test stability improvements.\n\n"
                    f"**Requirements:**\n"
                    f"- 3–6 years of software testing or SDET experience.\n"
                    f"- Proficiency in test frameworks such as Selenium, Playwright, Cypress, or Appium.\n"
                    f"- Strong programming skills in Python or Java.\n"
                    f"- Experience with performance testing tools like JMeter or Gatling is a plus.\n\n"
                    f"**What {company.name} Offers:**\n"
                    f"- A quality-first engineering culture.\n"
                    f"- Competitive salaries and annual merit increases.\n"
                    f"- Opportunities to build test infrastructure that impacts thousands of engineers."
                ),
            },
        ]

        job_types = ['full-time', 'part-time', 'contract', 'remote', 'internship']
        total_jobs = 0

        for company in companies:
            for i, template in enumerate(job_templates):
                salary_min = random.randint(600000, 2500000)
                salary_max = salary_min + random.randint(300000, 1500000)
                job_location = all_locations[i % len(all_locations)]

                Job.objects.create(
                    title=template['title'],
                    company=company,
                    location=job_location,
                    job_type=job_types[i % len(job_types)],
                    description=template['description'](company),
                    salary_min=salary_min,
                    salary_max=salary_max,
                    vacancies=template['vacancies'],
                    created_by=admin_user,
                )
                total_jobs += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(companies)} companies and {total_jobs} jobs.'))
