"""
Service layer for accounts app.
All business logic related to users lives here.
Views are kept thin and only call these service functions.
"""

import threading
import logging
from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from rest_framework.exceptions import ValidationError, AuthenticationFailed, NotFound, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User, CustomerProfile

logger = logging.getLogger(__name__)


class ProfileService:
    @staticmethod
    def get_or_create_profile(user) -> CustomerProfile:
        """Returns the profile for a user, creating it if it doesn't exist."""
        profile, created = CustomerProfile.objects.get_or_create(user=user)
        return profile

    @staticmethod
    def update_profile(user, data: dict, resume_file=None) -> CustomerProfile:
        """Updates the user's profile."""
        profile = ProfileService.get_or_create_profile(user)
        
        for field, value in data.items():
            if hasattr(profile, field) and field != 'resume':
                setattr(profile, field, value)
                
        if resume_file:
            profile.resume = resume_file
            
        profile.save()
        return profile


class UserService:
    @staticmethod
    def _send_registration_email(email: str, name: str) -> None:
        """
        Send registration confirmation email asynchronously.
        This runs in a separate thread to avoid blocking the request.
        """
        try:
            logger.info(f"[ASYNC EMAIL] Starting email send for {email}")
            subject = "Welcome to Job Board!"
            message = (
                f"Hi {name},\n\n"
                f"Your registration was successful. Welcome to Job Board!\n"
                f"Explore thousands of opportunities and find your dream job.\n\n"
                f"Click here to explore opportunities: http://localhost:5173/jobs\n\n"
                f"Best regards,\n"
                f"The Job Board Team"
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            logger.info(f"[ASYNC EMAIL] Successfully sent email to {email}")
        except Exception as e:
            logger.error(f"[ASYNC EMAIL ERROR] Failed to send registration email to {email}: {e}")

    @staticmethod
    def register_user(email: str, name: str, password: str, phone_number: str = None) -> User:
        """
        Create a new CUSTOMER user.
        Raises ValidationError if email or phone is already taken.
        Email sending is done asynchronously to prevent timeout.
        """
        logger.info(f"[REGISTRATION] Step 1: Starting validation for email={email}")
        
        # Optimize: Use single query with Q objects to check both email and phone uniqueness
        existing_user = User.objects.filter(
            Q(email=email) | Q(phone_number=phone_number)
        ).first() if phone_number else User.objects.filter(email=email).first()
        
        if existing_user:
            if existing_user.email == email:
                raise ValidationError({'email': 'A user with this email already exists.'})
            else:
                raise ValidationError({'phone_number': 'A user with this phone number already exists.'})

        logger.info(f"[REGISTRATION] Step 2: Creating user for email={email}")
        user = User.objects.create_user(
            email=email,
            name=name,
            password=password,
            phone_number=phone_number,
            role=User.Role.CUSTOMER,
        )
        logger.info(f"[REGISTRATION] Step 2: User created successfully, user_id={user.id}")

        # Send email asynchronously in a separate thread
        logger.info(f"[REGISTRATION] Step 3: Sending registration email asynchronously")
        email_thread = threading.Thread(
            target=UserService._send_registration_email,
            args=(user.email, user.name),
            daemon=True
        )
        email_thread.start()

        return user

    @staticmethod
    def login_user(email: str, password: str) -> dict:
        """
        Authenticate user and return JWT tokens + user data.
        """
        # First check if user exists at all
        if not User.objects.filter(email=email).exists():
            raise AuthenticationFailed('We are unable to find an account with the provided email. Please register.')

        user = authenticate(username=email, password=password)
        if not user:
            raise AuthenticationFailed('Invalid password. Please try again.')

        if not user.is_active:
            raise AuthenticationFailed('This account has been deactivated.')

        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user,
        }

    @staticmethod
    def get_all_users() -> list:
        """Return all users (ADMIN only)."""
        return User.objects.all().order_by('-date_joined')

    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        """Return a single user by ID."""
        try:
            return User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            raise NotFound(f'User with ID {user_id} not found.')

    @staticmethod
    def create_user(email: str, name: str, password: str, role: str = 'CUSTOMER') -> User:
        """Create a user with any role (ADMIN only action)."""
        if User.objects.filter(email=email).exists():
            raise ValidationError({'email': 'A user with this email already exists.'})

        user = User.objects.create_user(
            email=email,
            name=name,
            password=password,
            role=role,
            is_staff=(role == 'ADMIN'),
        )
        return user

    @staticmethod
    def update_user(user_id: int, data: dict, requesting_user: User) -> User:
        """Update a user's details."""
        user = UserService.get_user_by_id(user_id)

        if requesting_user.id != user_id and not requesting_user.is_admin:
            raise PermissionDenied('You do not have permission to modify this user.')

        if 'role' in data and not requesting_user.is_admin:
            raise PermissionDenied('Only admins can change user roles.')

        for field, value in data.items():
            if field == 'password':
                user.set_password(value)
            else:
                setattr(user, field, value)

        user.save()
        return user

    @staticmethod
    def delete_user(user_id: int, requesting_user: User) -> None:
        """Delete a user by ID."""
        if not requesting_user.is_admin:
            raise PermissionDenied('Only admins can delete users.')

        user = UserService.get_user_by_id(user_id)
        if user.id == requesting_user.id:
            raise ValidationError('You cannot delete your own account.')

        user.delete()
