from rest_framework import viewsets, permissions, status
from django.db import models
from rest_framework.response import Response
from .models import Project
from .serializers import (
    ProjectSerializer,
    ProjectMilestoneSerializer,
    ProjectDocumentSerializer,
    ProjectCostLineSerializer,
    ProjectHistorySerializer,
    ProjectTeamAssignmentHistorySerializer,
)
from .models_extras import ProjectMilestone, ProjectDocument, ProjectCostLine, ProjectHistory, ProjectTeamAssignmentHistory


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        service = self.request.GET.get("service_line")
        q = self.request.GET.get("q")
        if service:
            qs = qs.filter(service_line=service)
        if q:
            qs = qs.filter(models.Q(name__icontains=q) | models.Q(project_reference__icontains=q))
        return qs


class ProjectMilestoneViewSet(viewsets.ModelViewSet):
    queryset = ProjectMilestone.objects.all().order_by("order")
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        if project:
            qs = qs.filter(project__id=project)
        return qs


class ProjectDocumentViewSet(viewsets.ModelViewSet):
    queryset = ProjectDocument.objects.all()
    serializer_class = ProjectDocumentSerializer
    permission_classes = [permissions.AllowAny]


class ProjectCostLineViewSet(viewsets.ModelViewSet):
    queryset = ProjectCostLine.objects.all()
    serializer_class = ProjectCostLineSerializer
    permission_classes = [permissions.AllowAny]


class ProjectHistoryViewSet(viewsets.ModelViewSet):
    queryset = ProjectHistory.objects.all()
    serializer_class = ProjectHistorySerializer
    permission_classes = [permissions.AllowAny]


class ProjectTeamAssignmentHistoryViewSet(viewsets.ModelViewSet):
    queryset = ProjectTeamAssignmentHistory.objects.all()
    serializer_class = ProjectTeamAssignmentHistorySerializer
    permission_classes = [permissions.AllowAny]
