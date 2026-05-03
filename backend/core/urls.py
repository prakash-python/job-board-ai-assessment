"""
Core URL configuration for the Job Board application.
Routes requests to accounts, jobs, and applications apps.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
from .views import home_view

urlpatterns = [
    # Root API view
    path('', home_view, name='home'),
    
    # Django admin panel
    path('admin/', admin.site.urls),
    
    # JWT token refresh endpoint
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App routes
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/applications/', include('apps.applications.urls')),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
