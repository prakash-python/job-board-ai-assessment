"""
Serializers for the jobs app.
"""

from rest_framework import serializers
from apps.jobs.models import Job
from apps.accounts.serializers import UserSerializer


class JobSerializer(serializers.ModelSerializer):
    """Full job serializer — used for read operations."""
    created_by = UserSerializer(read_only=True)
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location',
            'job_type', 'job_type_display', 'description',
            'is_active', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating jobs (ADMIN only)."""

    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'location', 'job_type', 'description', 'is_active']
        read_only_fields = ['id']

    def validate_job_type(self, value):
        valid_types = [choice[0] for choice in Job.JobType.choices]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Invalid job type. Choose from: {', '.join(valid_types)}"
            )
        return value
