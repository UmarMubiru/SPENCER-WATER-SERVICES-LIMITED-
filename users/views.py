from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserProfileSerializer, UserCreateSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserProfileSerializer
    
    @action(detail=False, methods=['get'])
    def administrators(self, request):
        admins = self.queryset.filter(role='Administrator')
        serializer = self.get_serializer(admins, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def technicians(self, request):
        techs = self.queryset.filter(role='Technician')
        serializer = self.get_serializer(techs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def hr_users(self, request):
        hr = self.queryset.filter(role='Human Resource')
        serializer = self.get_serializer(hr, many=True)
        return Response(serializer.data)
