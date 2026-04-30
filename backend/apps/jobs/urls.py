"""
URL routes for the jobs app.
"""

from django.urls import path
from apps.jobs.views import JobListCreateView, JobDetailView

urlpatterns = [
    path('', JobListCreateView.as_view(), name='job-list-create'),
    path('<int:job_id>/', JobDetailView.as_view(), name='job-detail'),
]
