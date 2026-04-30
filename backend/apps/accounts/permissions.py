"""
Custom DRF permissions for role-based access control.
"""

from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allow access only to users with ADMIN role."""
    message = 'Access restricted to admin users only.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )


class IsCustomerRole(BasePermission):
    """Allow access only to users with CUSTOMER role."""
    message = 'Access restricted to customer users only.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'CUSTOMER'
        )
