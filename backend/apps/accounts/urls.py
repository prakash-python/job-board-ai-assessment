"""
URL routes for the accounts app.
"""

from django.urls import path
from apps.accounts.views import (
    RegisterView,
    LoginView,
    UserListView,
    UserDetailView,
    MeView,
    CheckExistsView,
    CustomerProfileView,
    ServeResumeView,
)

urlpatterns = [
    # Auth
    path('check-exists/', CheckExistsView.as_view(), name='check-exists'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    
    # Profile
    path('profile/', CustomerProfileView.as_view(), name='profile'),
    path('resume/', ServeResumeView.as_view(), name='serve-resume'),

    # User management (admin)
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<uuid:user_id>/', UserDetailView.as_view(), name='user-detail'),
]
