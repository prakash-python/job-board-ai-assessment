from rest_framework import serializers
from apps.accounts.models import CustomerProfile

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ['id', 'pan_number', 'resume', 'dob', 'gender', 'education_details', 'updated_at']
        read_only_fields = ['id', 'updated_at']
