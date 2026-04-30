from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.accounts.serializers import CustomerProfileSerializer
from apps.accounts.services import ProfileService

class CustomerProfileView(APIView):
    """
    GET /api/accounts/profile/ — Get own profile
    PUT /api/accounts/profile/ — Update own profile
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile = ProfileService.get_or_create_profile(request.user)
        serializer = CustomerProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        # We don't use the standard serializer.save() here because we use the service layer
        resume_file = request.FILES.get('resume')
        
        # Extract data excluding the file
        data = {k: v for k, v in request.data.items() if k != 'resume' and v != 'null' and v != ''}
        
        profile = ProfileService.update_profile(request.user, data, resume_file)
        return Response(CustomerProfileSerializer(profile).data, status=status.HTTP_200_OK)
