"""
Application model for the Job Board application.
Represents a customer's application to a job posting.
"""

import uuid
from django.db import models
from django.conf import settings
from apps.jobs.models import Job


class Application(models.Model):
    """
    Represents a job application submitted by a CUSTOMER.
    - Status can be updated by ADMIN (ACCEPTED/REJECTED).
    - Email notifications are sent on apply and status change.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        REVIEWED = 'REVIEWED', 'Reviewed'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'

    # The customer who applied
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
        limit_choices_to={'role': 'CUSTOMER'},
    )

    # The job being applied to
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications',
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED,
    )

    # Optional cover letter or message from applicant
    cover_letter = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'applications'
        verbose_name = 'Application'
        verbose_name_plural = 'Applications'
        ordering = ['-created_at']
        # Prevent the same user from applying to the same job twice
        unique_together = [['user', 'job']]

    def __str__(self):
        return f"{self.user.name} → {self.job.title} [{self.status}]"
