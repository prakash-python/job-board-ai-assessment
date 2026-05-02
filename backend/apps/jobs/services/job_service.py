"""
Service layer for jobs app.
All business logic related to jobs lives here.
"""

from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.jobs.models import Job, Company

class JobService:
    @staticmethod
    def get_all_jobs(filters: dict = None) -> list:
        """
        Return all jobs.
        If user is not admin, they should only see active jobs (views handle this via filters).
        """
        queryset = Job.objects.all()

        from django.db.models import Q
        from django.utils import timezone
        from datetime import timedelta

        if filters:
            if 'is_active' in filters:
                queryset = queryset.filter(is_active=filters['is_active'])
            if 'location' in filters and filters['location']:
                queryset = queryset.filter(location__icontains=filters['location'])
            if 'job_type' in filters and filters['job_type']:
                queryset = queryset.filter(job_type=filters['job_type'])
            if 'company_id' in filters and filters['company_id']:
                queryset = queryset.filter(company_id=filters['company_id'])
            
            # Search filter
            search_query = filters.get('search')
            if search_query:
                queryset = queryset.filter(
                    Q(title__icontains=search_query) | 
                    Q(description__icontains=search_query) |
                    Q(company__name__icontains=search_query)
                )

            # Salary filter (expects min and max)
            min_salary = filters.get('min_salary')
            if min_salary and min_salary.isdigit():
                queryset = queryset.filter(salary_min__gte=int(min_salary))
                
            max_salary = filters.get('max_salary')
            if max_salary and max_salary.isdigit():
                queryset = queryset.filter(salary_max__lte=int(max_salary))

            # Date posted filter
            date_posted = filters.get('date_posted')
            if date_posted:
                now = timezone.now()
                if date_posted == '24h':
                    queryset = queryset.filter(created_at__gte=now - timedelta(days=1))
                elif date_posted == '7d':
                    queryset = queryset.filter(created_at__gte=now - timedelta(days=7))
                elif date_posted == '30d':
                    queryset = queryset.filter(created_at__gte=now - timedelta(days=30))

        return queryset.order_by('-created_at')

    @staticmethod
    def get_job_by_id(job_id: int) -> Job:
        """Return a single job by ID."""
        try:
            return Job.objects.get(id=job_id)
        except ObjectDoesNotExist:
            raise NotFound(f'Job with ID {job_id} not found.')

    @staticmethod
    def create_job(data: dict, user) -> Job:
        """Create a new job posting (ADMIN only)."""
        if not user.is_admin:
            raise PermissionDenied('Only admins can create jobs.')
            
        job = Job.objects.create(
            title=data['title'],
            description=data['description'],
            company=data['company'],
            location=data['location'],
            job_type=data['job_type'],
            deadline=data.get('deadline'),
            created_by=user,
        )
        return job

    @staticmethod
    def update_job(job_id: int, data: dict, user) -> Job:
        """Update an existing job posting (ADMIN only)."""
        if not user.is_admin:
            raise PermissionDenied('Only admins can update jobs.')

        job = JobService.get_job_by_id(job_id)
        
        for field, value in data.items():
            setattr(job, field, value)
            
        job.save()
        return job

    @staticmethod
    def get_job_locations() -> list:
        """Get a list of all unique locations for active jobs."""
        locations = Job.objects.filter(is_active=True).exclude(location__exact='').values_list('location', flat=True)
        return sorted(list(set(locations)))

    @staticmethod
    def delete_job(job_id: int, user) -> None:
        """Delete a job posting (ADMIN only)."""
        if not user.is_admin:
            raise PermissionDenied('Only admins can delete jobs.')

        job = JobService.get_job_by_id(job_id)
        job.delete()
        
class CompanyService:
    @staticmethod
    def get_all_companies(filters: dict = None):
        from django.db.models import Q
        from django.utils import timezone
        from datetime import timedelta

        queryset = Company.objects.all()

        if filters:
            if 'search' in filters and filters['search']:
                search_query = filters['search']
                queryset = queryset.filter(
                    Q(name__icontains=search_query) | 
                    Q(description__icontains=search_query) |
                    Q(industry__icontains=search_query)
                )
            if 'industry' in filters and filters['industry'] and filters['industry'] != 'All Industries':
                queryset = queryset.filter(industry=filters['industry'])
            if 'location' in filters and filters['location'] and filters['location'] != 'All Locations':
                queryset = queryset.filter(location__icontains=filters['location'])
            if 'date_added' in filters and filters['date_added']:
                try:
                    days = int(filters['date_added'])
                    now = timezone.now()
                    queryset = queryset.filter(created_at__gte=now - timedelta(days=days))
                except ValueError:
                    pass

        return queryset.order_by('name').distinct()

    @staticmethod
    def get_company_by_id(company_id: int) -> Company:
        try:
            return Company.objects.get(id=company_id)
        except ObjectDoesNotExist:
            raise NotFound(f'Company with ID {company_id} not found.')

    @staticmethod
    def create_company(data: dict, user) -> Company:
        if not user.is_admin:
            raise PermissionDenied('Only admins can create companies.')
        return Company.objects.create(**data)

    @staticmethod
    def update_company(company_id: int, data: dict, user) -> Company:
        if not user.is_admin:
            raise PermissionDenied('Only admins can update companies.')
        company = CompanyService.get_company_by_id(company_id)
        for field, value in data.items():
            setattr(company, field, value)
        company.save()
        return company

    @staticmethod
    def delete_company(company_id: int, user) -> None:
        if not user.is_admin:
            raise PermissionDenied('Only admins can delete companies.')
        company = CompanyService.get_company_by_id(company_id)
        company.delete()
