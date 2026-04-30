"""
Job model for the Job Board application.
Represents a job posting created by an ADMIN user.
"""

from django.db import models
from django.conf import settings


class Job(models.Model):
    """
    Represents a job posting.
    - Created by an ADMIN user
    - Visible to all authenticated users
    """

    class JobType(models.TextChoices):
        FULL_TIME = 'full-time', 'Full Time'
        PART_TIME = 'part-time', 'Part Time'
        CONTRACT = 'contract', 'Contract'
        REMOTE = 'remote', 'Remote'
        INTERNSHIP = 'internship', 'Internship'

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    job_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        default=JobType.FULL_TIME,
    )
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    deadline = models.DateField(null=True, blank=True)

    # Admin user who created this job
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_jobs',
        limit_choices_to={'role': 'ADMIN'},
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jobs'
        verbose_name = 'Job'
        verbose_name_plural = 'Jobs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company} ({self.job_type})"
