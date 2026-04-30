"""
Admin registration for the jobs app.
"""

from django.contrib import admin
from apps.jobs.models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'job_type', 'is_active', 'created_by', 'created_at']
    list_filter = ['job_type', 'is_active', 'created_at']
    search_fields = ['title', 'company', 'location']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
