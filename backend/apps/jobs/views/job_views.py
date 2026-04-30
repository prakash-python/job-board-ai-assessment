"""
Views for the jobs app.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.jobs.serializers import JobSerializer, JobCreateUpdateSerializer
from apps.jobs.services import JobService
from apps.accounts.permissions import IsAdminRole


class JobListCreateView(APIView):
    """
    GET  /api/jobs/ — List all active jobs (or all jobs for admin)
    POST /api/jobs/ — Create a new job (ADMIN only)
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminRole()]

    def get(self, request):
        filters = {}
        if not request.user.is_authenticated or not request.user.is_admin:
            filters['is_active'] = True

        location = request.query_params.get('location')
        job_type = request.query_params.get('job_type')

        if location:
            filters['location'] = location
        if job_type:
            filters['job_type'] = job_type

        jobs = JobService.get_all_jobs(filters=filters)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = JobCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = JobService.create_job(serializer.validated_data, request.user)
        return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)


class JobDetailView(APIView):
    """
    GET    /api/jobs/<id>/ — Get job details
    PUT    /api/jobs/<id>/ — Update job (ADMIN only)
    DELETE /api/jobs/<id>/ — Delete job (ADMIN only)
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminRole()]

    def get(self, request, job_id):
        job = JobService.get_job_by_id(job_id)
        # If not admin, only allow viewing active jobs
        if not job.is_active and (not request.user.is_authenticated or not request.user.is_admin):
            return Response({'detail': 'This job is no longer active.'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = JobSerializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, job_id):
        serializer = JobCreateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        job = JobService.update_job(job_id, serializer.validated_data, request.user)
        return Response(JobSerializer(job).data, status=status.HTTP_200_OK)

    def delete(self, request, job_id):
        JobService.delete_job(job_id, request.user)
        return Response({'detail': 'Job deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
