"""
Custom User model for the Job Board application.
Extends AbstractUser to support role-based access (ADMIN, CUSTOMER).
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model.
    - email is the unique identifier (used for login)
    - role determines what the user can do
    """

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        CUSTOMER = 'CUSTOMER', 'Customer'

    # Remove username uniqueness constraint (we use email instead)
    username = models.CharField(max_length=150, blank=True)

    # Required fields
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )

    # Status fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Use email as the login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"

    @property
    def is_admin(self):
        """Helper property to check if user is an admin."""
        return self.role == self.Role.ADMIN

    @property
    def is_customer(self):
        """Helper property to check if user is a customer."""
        return self.role == self.Role.CUSTOMER
