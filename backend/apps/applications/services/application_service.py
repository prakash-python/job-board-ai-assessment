"""
Service layer for applications app.
Handles applying to jobs and updating application status.
"""

from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.applications.models import Application
from apps.jobs.services import JobService


class ApplicationService:
    @staticmethod
    def get_user_applications(user) -> list:
        """Return all applications for a specific user."""
        return Application.objects.filter(user=user).order_by('-created_at')

    @staticmethod
    def get_all_applications(user) -> list:
        """Return all applications across all jobs (ADMIN only)."""
        if not user.is_admin:
            raise PermissionDenied('Only admins can view all applications.')
        return Application.objects.all().order_by('-created_at')

    @staticmethod
    def get_application_by_id(app_id) -> Application:
        try:
            return Application.objects.get(id=app_id)
        except ObjectDoesNotExist:
            raise NotFound(f'Application with ID {app_id} not found.')

    @staticmethod
    def apply_for_job(
        job_id: int, user, cover_letter: str = '', 
        phone_number: str = None, 
        linkedin_link: str = None, github_link: str = None, 
        portfolio_link: str = None, resume = None
    ) -> Application:
        """
        Submit a new application for a job.
        CUSTOMERS only.
        Also updates user's phone and profile if provided.
        """
        if not user.is_customer:
            raise PermissionDenied('Only customers can apply for jobs.')

        job = JobService.get_job_by_id(job_id)
        if not job.is_active:
            raise ValidationError('This job is no longer active.')

        if Application.objects.filter(job=job, user=user).exists():
            raise ValidationError('You have already applied for this job.')

        # Update User data if provided
        if phone_number:
            user.phone_number = phone_number
            user.save()

        # Update or Create CustomerProfile
        from apps.accounts.models import CustomerProfile
        profile, created = CustomerProfile.objects.get_or_create(user=user)
        if linkedin_link:
            profile.linkedin_link = linkedin_link
        if github_link:
            profile.github_link = github_link
        if portfolio_link:
            profile.portfolio_link = portfolio_link
        if resume:
            profile.resume = resume
        profile.save()

        application = Application.objects.create(
            job=job,
            user=user,
            cover_letter=cover_letter
        )

        ApplicationService._send_application_confirmation_email(application)
        return application

    @staticmethod
    def update_application_status(app_id, status: str, user) -> Application:
        """Update the status of an application (ADMIN only)."""
        if not user.is_admin:
            raise PermissionDenied('Only admins can update application status.')

        application = ApplicationService.get_application_by_id(app_id)
        
        if status not in dict(Application.Status.choices):
            raise ValidationError('Invalid status provided.')

        old_status = application.status
        application.status = status
        application.save()

        if old_status != status:
            ApplicationService._send_status_update_email(application)

        return application

    @staticmethod
    def withdraw_application(app_id: int, user) -> None:
        """Customer deletes their own application before it's processed."""
        application = ApplicationService.get_application_by_id(app_id)

        if application.user.id != user.id:
            raise PermissionDenied('You can only withdraw your own applications.')

        if application.status != 'APPLIED':
            raise ValidationError('You can no longer withdraw this application as it is already being processed.')

        application.delete()

    @staticmethod
    def _send_application_confirmation_email(application: Application):
        """Send email to customer confirming their application."""
        subject = f"Application Received: {application.job.title} at {application.job.company}"
        message = (
            f"Hi {application.user.name},\n\n"
            f"We have successfully received your application for the {application.job.title} position at {application.job.company}.\n\n"
            f"Our team will review your profile and get back to you soon.\n\n"
            f"Best regards,\n"
            f"The Job Board Team"
        )
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send application confirmation to {application.user.email}: {e}")

    @staticmethod
    def _send_status_update_email(application: Application):
        """Send email to customer when application status changes."""
        status_display = application.get_status_display()
        subject = f"Application Update: {application.job.title} at {application.job.company.name}"
        message = (
            f"Hi {application.user.name},\n\n"
            f"There is an update regarding your application for the {application.job.title} position at {application.job.company.name}.\n\n"
            f"Your application status has been updated to: {status_display}.\n\n"
            f"You can log in to your dashboard to view more details.\n\n"
            f"Best regards,\n"
            f"The Hireloop Team"
        )
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send status update to {application.user.email}: {e}")

    @staticmethod
    def check_application_status(user, job_id: str) -> dict:
        """Check if a user has applied for a specific job and return status."""
        application = Application.objects.filter(user=user, job_id=job_id).first()
        if application:
            return {
                'applied': True,
                'status': application.status,
                'status_display': application.get_status_display()
            }
        return {'applied': False}
