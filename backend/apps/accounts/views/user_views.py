"""
Views for the accounts app.
Views are kept thin — all logic is delegated to service functions.
"""

import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.accounts.serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    UpdateUserSerializer,
    CustomerProfileSerializer,
)
from apps.accounts.services import UserService, ProfileService
from apps.accounts.permissions import IsAdminRole
from apps.accounts.models import User

from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from django.http import FileResponse

logger = logging.getLogger(__name__)

class ServeResumeView(APIView):
    """
    Securely serves the user's resume PDF while allowing it to be 
    embedded in an iframe within the application.
    """
    permission_classes = [IsAuthenticated]

    @method_decorator(xframe_options_exempt)
    def get(self, request):
        profile = ProfileService.get_or_create_profile(request.user)
        if not profile.resume:
            return Response({'detail': 'No resume found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Open the file and return as FileResponse
        response = FileResponse(profile.resume.open(), content_type='application/pdf')
        # Ensure it's treated as an inline file, not a download
        response['Content-Disposition'] = 'inline; filename="resume.pdf"'
        return response

class CustomerProfileView(APIView):
    """
    GET /api/accounts/profile/ — Get own profile
    PUT /api/accounts/profile/ — Update own profile
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile = ProfileService.get_or_create_profile(request.user)
        serializer = CustomerProfileSerializer(profile, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        # We don't use the standard serializer.save() here because we use the service layer
        resume_file = request.FILES.get('resume')
        
        # Extract data excluding the file
        data = {k: v for k, v in request.data.items() if k != 'resume' and v != 'null' and v != ''}
        
        profile = ProfileService.update_profile(request.user, data, resume_file)
        return Response(CustomerProfileSerializer(profile, context={'request': request}).data, status=status.HTTP_200_OK)


class CheckExistsView(APIView):
    """POST /api/accounts/check-exists/ — Pre-check if email/phone exists."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        
        email_exists = User.objects.filter(email=email).exists() if email else False
        phone_exists = User.objects.filter(phone_number=phone_number).exists() if phone_number else False
        
        return Response({
            'email_exists': email_exists,
            'phone_exists': phone_exists
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """POST /api/accounts/register/ — Register a new customer."""
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info("[REGISTRATION] RegisterView.post() called")
        logger.info(f"[REGISTRATION] Request data received: email={request.data.get('email')}")
        
        serializer = RegisterSerializer(data=request.data)
        logger.info("[REGISTRATION] Validating registration data")
        
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        logger.info("[REGISTRATION] Calling UserService.register_user()")
        user = UserService.register_user(
            email=data['email'],
            name=data['name'],
            password=data['password'],
            phone_number=data.get('phone_number'),
        )
        
        logger.info(f"[REGISTRATION] User registered successfully, returning response")
        return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/accounts/login/ — Authenticate and receive JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = UserService.login_user(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        return Response({
            'access': result['access'],
            'refresh': result['refresh'],
            'user': UserSerializer(result['user'], context={'request': request}).data,
        }, status=status.HTTP_200_OK)


class UserListView(APIView):
    """GET /api/accounts/users/ — List all users (ADMIN only)."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        users = UserService.get_all_users()
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """POST /api/accounts/users/ — Create a user (ADMIN only)."""
        data = request.data
        user = UserService.create_user(
            email=data.get('email'),
            name=data.get('name'),
            password=data.get('password'),
            role=data.get('role', 'CUSTOMER'),
        )
        return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    """
    GET    /api/accounts/users/<id>/ — Get user by ID
    PUT    /api/accounts/users/<id>/ — Update user
    DELETE /api/accounts/users/<id>/ — Delete user (ADMIN only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = UserService.get_user_by_id(user_id)
        return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_200_OK)

    def put(self, request, user_id):
        serializer = UpdateUserSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = UserService.update_user(user_id, serializer.validated_data, request.user)
        return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        UserService.delete_user(user_id, request.user)
        return Response({'detail': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """GET /api/accounts/me/ — Return the currently authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data, status=status.HTTP_200_OK)
