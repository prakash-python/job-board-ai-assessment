from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.accounts.models import CustomerProfile

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
