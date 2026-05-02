"""
Serializers for the accounts app.
Handles user registration, login response, and profile representation.
"""

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.models import User, CustomerProfile

class CustomerProfileSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'resume', 'resume_url', 'dob', 'gender', 
            'education_details', 'linkedin_link', 'github_link', 
            'portfolio_link', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']

    def get_resume_url(self, obj):
        request = self.context.get("request")
        if obj.resume:
            if request:
                return request.build_absolute_uri(obj.resume.url)
            return obj.resume.url
        return None

class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for user representation."""
    profile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'phone_number', 'name', 'role', 'is_active', 'date_joined', 'profile']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for registering a new CUSTOMER user."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'email', 'phone_number', 'name', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        # Delegate creation to service layer (called from view)
        return validated_data


class LoginSerializer(serializers.Serializer):
    """Serializer for login credentials."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class TokenResponseSerializer(serializers.Serializer):
    """Serializer for JWT token response."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class UpdateUserSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile (name, is_active)."""

    class Meta:
        model = User
        fields = ['name', 'phone_number', 'is_active', 'role']
