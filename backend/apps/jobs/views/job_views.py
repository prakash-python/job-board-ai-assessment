"""
Views for the jobs app.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.pagination import PageNumberPagination

from apps.jobs.serializers import JobSerializer, JobCreateUpdateSerializer, CompanySerializer
from apps.jobs.services import JobService, CompanyService
from apps.accounts.permissions import IsAdminRole


class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


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

        for key, value in request.query_params.items():
            filters[key] = value

        jobs = JobService.get_all_jobs(filters=filters)
        
        paginator = JobPagination()
        paginated_jobs = paginator.paginate_queryset(jobs, request)
        serializer = JobSerializer(paginated_jobs, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = JobCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = JobService.create_job(serializer.validated_data, request.user)
        return Response(JobSerializer(job, context={'request': request}).data, status=status.HTTP_201_CREATED)


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
            
        serializer = JobSerializer(job, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, job_id):
        serializer = JobCreateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        job = JobService.update_job(job_id, serializer.validated_data, request.user)
        return Response(JobSerializer(job, context={'request': request}).data, status=status.HTTP_200_OK)

    def delete(self, request, job_id):
        JobService.delete_job(job_id, request.user)
        return Response({'detail': 'Job deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class JobLocationsView(APIView):
    """
    GET /api/jobs/locations/ — List all unique active job locations
    """
    permission_classes = [AllowAny]

    def get(self, request):
        locations = JobService.get_job_locations()
        return Response(locations, status=status.HTTP_200_OK)

class CompanyListCreateView(APIView):
    """
    GET  /api/jobs/companies/ — List all companies
    POST /api/jobs/companies/ — Create a new company (ADMIN only)
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminRole()]

    def get(self, request):
        filters = {}
        for key, value in request.query_params.items():
            filters[key] = value
        
        companies = CompanyService.get_all_companies(filters=filters)
        
        paginator = JobPagination()
        paginated_companies = paginator.paginate_queryset(companies, request)
        serializer = CompanySerializer(paginated_companies, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CompanySerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        company = CompanyService.create_company(serializer.validated_data, request.user)
        return Response(CompanySerializer(company, context={'request': request}).data, status=status.HTTP_201_CREATED)

class CompanyDetailView(APIView):
    """
    GET    /api/jobs/companies/<id>/ — Get company details
    PUT    /api/jobs/companies/<id>/ — Update company (ADMIN only)
    DELETE /api/jobs/companies/<id>/ — Delete company (ADMIN only)
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminRole()]

    def get(self, request, company_id):
        company = CompanyService.get_company_by_id(company_id)
        serializer = CompanySerializer(company, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, company_id):
        serializer = CompanySerializer(data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        company = CompanyService.update_company(company_id, serializer.validated_data, request.user)
        return Response(CompanySerializer(company, context={'request': request}).data, status=status.HTTP_200_OK)

    def delete(self, request, company_id):
        CompanyService.delete_company(company_id, request.user)
        return Response({'detail': 'Company deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class CompanyJobsView(APIView):
    """
    GET /api/jobs/companies/<id>/jobs/ — List all jobs for a company
    """
    permission_classes = [AllowAny]

    def get(self, request, company_id):
        company = CompanyService.get_company_by_id(company_id)
        
        filters = {}
        if not request.user.is_authenticated or not request.user.is_admin:
            filters['is_active'] = True
            
        filters['company_id'] = company.id
        
        for key, value in request.query_params.items():
            filters[key] = value

        jobs = JobService.get_all_jobs(filters=filters)
        serializer = JobSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
