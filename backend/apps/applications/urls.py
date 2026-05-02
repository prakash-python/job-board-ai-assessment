from django.urls import path
from apps.applications.views import ApplicationListView, ApplicationDetailView, CheckApplicationView

urlpatterns = [
    path('', ApplicationListView.as_view(), name='application-list'),
    path('check/', CheckApplicationView.as_view(), name='application-check'),
    path('<uuid:app_id>/', ApplicationDetailView.as_view(), name='application-detail'),
]
