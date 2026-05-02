"""
URL routes for the jobs app.
"""

from django.urls import path
from apps.jobs.views import JobListCreateView, JobDetailView, JobLocationsView, CompanyListCreateView, CompanyDetailView, CompanyJobsView

urlpatterns = [
    path('', JobListCreateView.as_view(), name='job-list-create'),
    path('locations/', JobLocationsView.as_view(), name='job-locations'),
    path('<uuid:job_id>/', JobDetailView.as_view(), name='job-detail'),
    path('companies/', CompanyListCreateView.as_view(), name='company-list-create'),
    path('companies/<uuid:company_id>/', CompanyDetailView.as_view(), name='company-detail'),
    path('companies/<uuid:company_id>/jobs/', CompanyJobsView.as_view(), name='company-jobs'),
]
