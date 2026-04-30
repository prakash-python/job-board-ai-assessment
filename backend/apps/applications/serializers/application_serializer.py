"""
Serializers for the applications app.
"""

from rest_framework import serializers
from apps.applications.models import Application
from apps.accounts.serializers import UserSerializer
from apps.jobs.serializers import JobSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Full application serializer — used for read operations."""
    user = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'user', 'job', 'status', 'status_display',
            'cover_letter', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'job', 'status', 'created_at', 'updated_at']


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new application (CUSTOMER)."""
    job_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job_id', 'cover_letter']
        read_only_fields = ['id']


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating application status (ADMIN only)."""

    class Meta:
        model = Application
        fields = ['status']

    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in Application.Status.choices]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Choose from: {', '.join(valid_statuses)}"
            )
        return value
