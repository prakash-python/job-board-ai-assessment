"""
Job model for the Job Board application.
Represents a job posting created by an ADMIN user.
"""

import uuid
from django.db import models
from django.conf import settings

class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    industry = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Job(models.Model):
    """
    Represents a job posting.
    - Created by an ADMIN user
    - Visible to all authenticated users
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class JobType(models.TextChoices):
        FULL_TIME = 'full-time', 'Full Time'
        PART_TIME = 'part-time', 'Part Time'
        CONTRACT = 'contract', 'Contract'
        REMOTE = 'remote', 'Remote'
        INTERNSHIP = 'internship', 'Internship'

    title = models.CharField(max_length=255)
    company = models.ForeignKey('jobs.Company', on_delete=models.CASCADE, related_name='jobs')
    location = models.CharField(max_length=255)
    job_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        default=JobType.FULL_TIME,
    )
    description = models.TextField()
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    vacancies = models.IntegerField(default=1)
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


