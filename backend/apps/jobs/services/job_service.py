"""
Service layer for jobs app.
All business logic related to jobs lives here.
"""

from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.jobs.models import Job

class JobService:
    @staticmethod
    def get_all_jobs(filters: dict = None) -> list:
        """
        Return all jobs.
        If user is not admin, they should only see active jobs (views handle this via filters).
        """
        queryset = Job.objects.all()

        if filters:
            if 'is_active' in filters:
                queryset = queryset.filter(is_active=filters['is_active'])
            if 'location' in filters and filters['location']:
                queryset = queryset.filter(location__icontains=filters['location'])
            if 'job_type' in filters and filters['job_type']:
                queryset = queryset.filter(job_type=filters['job_type'])

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
    def delete_job(job_id: int, user) -> None:
        """Delete a job posting (ADMIN only)."""
        if not user.is_admin:
            raise PermissionDenied('Only admins can delete jobs.')

        job = JobService.get_job_by_id(job_id)
        job.delete()
