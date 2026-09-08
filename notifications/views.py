from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer, NotificationPreferenceCreateSerializer

User = get_user_model()


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Notification.objects.all()
        user = self.request.user
        if user and user.is_authenticated:
            queryset = queryset.filter(recipient=user)
        else:
            queryset = queryset.none()
        return queryset
    
    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for current user"""
        if request.user and request.user.is_authenticated:
            Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all_read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications for current user"""
        if request.user and request.user.is_authenticated:
            count = Notification.objects.filter(recipient=request.user, is_read=False).count()
            return Response({'count': count})
        return Response({'count': 0})


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationPreferenceSerializer
    
    def get_queryset(self):
        queryset = NotificationPreference.objects.all()
        user = self.request.user
        if user and user.is_authenticated:
            queryset = queryset.filter(user=user)
        return queryset
    
    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            # Get or create preference for user
            preference, created = NotificationPreference.objects.get_or_create(
                user=self.request.user,
                defaults=serializer.validated_data
            )
            if not created:
                # Update existing preference
                for key, value in serializer.validated_data.items():
                    setattr(preference, key, value)
                preference.save()
            self.serializer_class = NotificationPreferenceSerializer
            return preference
        return serializer.save()
