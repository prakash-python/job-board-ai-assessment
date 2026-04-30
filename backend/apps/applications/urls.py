from django.urls import path
from apps.applications.views import ApplicationListView, ApplicationDetailView

urlpatterns = [
    path('', ApplicationListView.as_view(), name='application-list'),
    path('<int:app_id>/', ApplicationDetailView.as_view(), name='application-detail'),
]
