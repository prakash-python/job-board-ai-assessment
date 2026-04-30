"""
Service layer for accounts app.
All business logic related to users lives here.
Views are kept thin and only call these service functions.
"""

from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.exceptions import ValidationError, AuthenticationFailed, NotFound, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User


class UserService:
    @staticmethod
    def register_user(email: str, name: str, password: str, phone_number: str = None) -> User:
        """
        Create a new CUSTOMER user.
        Raises ValidationError if email or phone is already taken.
        """
        if User.objects.filter(email=email).exists():
            raise ValidationError({'email': 'A user with this email already exists.'})

        if phone_number and User.objects.filter(phone_number=phone_number).exists():
            raise ValidationError({'phone_number': 'A user with this phone number already exists.'})

        user = User.objects.create_user(
            username=email,  # username kept same as email
            email=email,
            name=name,
            password=password,
            phone_number=phone_number,
            role=User.Role.CUSTOMER,
        )

        # Send success email
        subject = "Welcome to Job Board!"
        message = (
            f"Hi {name},\n\n"
            f"Your registration was successful. Welcome to Job Board!\n"
            f"Explore thousands of opportunities and find your dream job.\n\n"
            f"Click here to explore opportunities: http://localhost:5173/jobs\n\n"
            f"Best regards,\n"
            f"The Job Board Team"
        )
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send registration email to {user.email}: {e}")

        return user

    @staticmethod
    def login_user(email: str, password: str) -> dict:
        """
        Authenticate user and return JWT tokens + user data.
        """
        user = authenticate(username=email, password=password)
        if not user:
            raise AuthenticationFailed('Invalid email or password.')

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
            username=email,
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
