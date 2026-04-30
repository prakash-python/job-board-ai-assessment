"""
Views for the accounts app.
Views are kept thin — all logic is delegated to service functions.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    UpdateUserSerializer,
)
from apps.accounts.services import UserService
from apps.accounts.permissions import IsAdminRole
from apps.accounts.models import User

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
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = UserService.register_user(
            email=data['email'],
            name=data['name'],
            password=data['password'],
            phone_number=data.get('phone_number'),
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


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
            'user': UserSerializer(result['user']).data,
        }, status=status.HTTP_200_OK)


class UserListView(APIView):
    """GET /api/accounts/users/ — List all users (ADMIN only)."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        users = UserService.get_all_users()
        serializer = UserSerializer(users, many=True)
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
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    """
    GET    /api/accounts/users/<id>/ — Get user by ID
    PUT    /api/accounts/users/<id>/ — Update user
    DELETE /api/accounts/users/<id>/ — Delete user (ADMIN only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = UserService.get_user_by_id(user_id)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def put(self, request, user_id):
        serializer = UpdateUserSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = UserService.update_user(user_id, serializer.validated_data, request.user)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        UserService.delete_user(user_id, request.user)
        return Response({'detail': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """GET /api/accounts/me/ — Return the currently authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
