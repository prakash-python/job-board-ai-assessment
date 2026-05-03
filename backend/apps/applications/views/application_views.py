"""
Views for the applications app.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.applications.serializers import ApplicationSerializer, ApplicationCreateSerializer, ApplicationStatusUpdateSerializer
from apps.applications.services import ApplicationService
from apps.accounts.permissions import IsCustomerRole


class ApplicationListView(APIView):
    """
    GET  /api/applications/ — List applications (Customer sees own, Admin sees all)
    POST /api/applications/ — Apply for a job (CUSTOMER only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_admin:
            applications = ApplicationService.get_all_applications(request.user)
        else:
            applications = ApplicationService.get_user_applications(request.user)
            
        from apps.jobs.views.job_views import JobPagination
        paginator = JobPagination()
        paginated_applications = paginator.paginate_queryset(applications, request)
        serializer = ApplicationSerializer(paginated_applications, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        self.check_object_permissions(request, None)
        if not request.user.is_customer:
            return Response({'detail': 'Only customers can apply.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ApplicationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        application = ApplicationService.apply_for_job(
            job_id=serializer.validated_data['job_id'],
            user=request.user,
            cover_letter=serializer.validated_data.get('cover_letter', ''),
            phone_number=serializer.validated_data.get('phone_number'),
            linkedin_link=serializer.validated_data.get('linkedin_link'),
            github_link=serializer.validated_data.get('github_link'),
            portfolio_link=serializer.validated_data.get('portfolio_link'),
            resume=serializer.validated_data.get('resume')
        )
        return Response(ApplicationSerializer(application, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ApplicationDetailView(APIView):
    """
    GET    /api/applications/<id>/ — Get application details
    PUT    /api/applications/<id>/ — Update status (ADMIN only)
    DELETE /api/applications/<id>/ — Withdraw application (CUSTOMER only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, app_id):
        application = ApplicationService.get_application_by_id(app_id)
        
        # Check permissions
        if not request.user.is_admin and application.user.id != request.user.id:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = ApplicationSerializer(application, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, app_id):
        serializer = ApplicationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        application = ApplicationService.update_application_status(
            app_id=app_id,
            status=serializer.validated_data['status'],
            user=request.user
        )
        return Response(ApplicationSerializer(application, context={'request': request}).data, status=status.HTTP_200_OK)

    def delete(self, request, app_id):
        ApplicationService.withdraw_application(app_id, request.user)
        return Response({'detail': 'Application withdrawn successfully.'}, status=status.HTTP_204_NO_CONTENT)


class CheckApplicationView(APIView):
    """
    GET /api/applications/check/?job_id=<job_id>
    Checks if the current user has applied to the specified job.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({'detail': 'job_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = ApplicationService.check_application_status(request.user, job_id)
        return Response(result, status=status.HTTP_200_OK)
