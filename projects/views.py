from rest_framework import viewsets, permissions, status
from django.db import models
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.decorators import action
import re
from .models import Project
from .serializers import (
    ProjectSerializer,
    ProjectMilestoneSerializer,
    ProjectDocumentSerializer,
    ProjectCostLineSerializer,
    ProjectHistorySerializer,
    ProjectTeamAssignmentHistorySerializer,
    ProjectFieldHistorySerializer,
    ProjectActivitySerializer,
    ProjectResourceAllocationSerializer,
)
from .models_extras import ProjectMilestone, ProjectDocument, ProjectCostLine, ProjectHistory, ProjectTeamAssignmentHistory, ProjectFieldHistory, ProjectActivity, ActivityResource, ActivityImage, ProjectResourceAllocation


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project_reference = self.request.GET.get("project_reference")
        print(f"DEBUG: project_reference from request: {project_reference}")
        print(f"DEBUG: All GET params: {self.request.GET}")
        if project_reference:
            qs = qs.filter(project_reference=project_reference)
            print(f"DEBUG: Filtered queryset count: {qs.count()}")
        else:
            print(f"DEBUG: No project_reference filter, returning all projects: {qs.count()}")
        return qs

    def get_serializer(self, *args, **kwargs):
        if self.action == 'create':
            return ProjectSerializer(*args, **kwargs)
        return super().get_serializer(*args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Handle multipart form data with documents
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Extract project fields from FormData
            project_data = {}
            documents_data = []
            
            for key, value in request.data.items():
                if key.startswith('documents['):
                    # Parse documents array
                    match = re.match(r'documents\[(\d+)\]\.(\w+)', key)
                    if match:
                        index, field = match.groups()
                        index = int(index)
                        while len(documents_data) <= index:
                            documents_data.append({})
                        documents_data[index][field] = value
                else:
                    project_data[key] = value
            
            # Create project
            serializer = self.get_serializer(data=project_data)
            serializer.is_valid(raise_exception=True)
            project = serializer.save()
            
            # Create documents
            for doc_data in documents_data:
                if 'file' in doc_data:
                    try:
                        ProjectDocument.objects.create(
                            project=project,
                            file=doc_data['file'],
                            document_type=doc_data.get('document_type'),
                            caption=doc_data.get('caption', '')
                        )
                    except Exception as e:
                        print(f"Error creating document: {e}")
                        print(f"Document data: {doc_data}")
            
            # Return the created project with documents
            response_serializer = self.get_serializer(project)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        qs = super().get_queryset()
        service = self.request.GET.get("service_line")
        q = self.request.GET.get("q")
        is_archived = self.request.GET.get("is_archived")
        
        # Default filter: exclude archived projects unless specifically requested
        if is_archived is None:
            qs = qs.filter(is_archived=False)
        elif is_archived.lower() in ['true', '1', 'yes']:
            qs = qs.filter(is_archived=True)
        
        if service:
            qs = qs.filter(service_line=service)
        if q:
            qs = qs.filter(models.Q(name__icontains=q) | models.Q(project_reference__icontains=q))
        return qs

    def perform_update(self, serializer):
        # Track field changes on update
        instance = self.get_object()
        old_values = {}
        
        # Get old values for all fields
        for field in instance._meta.fields:
            if field.name not in ['id', 'created_at', 'updated_at']:
                old_values[field.name] = str(getattr(instance, field.name))
        
        # Save the updated instance
        updated_instance = serializer.save()
        
        # Compare and log changes
        for field in updated_instance._meta.fields:
            if field.name not in ['id', 'created_at', 'updated_at']:
                new_value = str(getattr(updated_instance, field.name))
                old_value = old_values.get(field.name)
                
                if old_value != new_value:
                    # Get the user who made the change
                    changed_by = None
                    if self.request.user and hasattr(self.request.user, 'profile'):
                        changed_by = self.request.user.profile
                    
                    # Create field history record
                    ProjectFieldHistory.objects.create(
                        project=updated_instance,
                        field_name=field.name,
                        old_value=old_value,
                        new_value=new_value,
                        changed_by=changed_by
                    )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a project (soft delete)"""
        project = self.get_object()
        
        # Get the user who is archiving
        archived_by = None
        if request.user and hasattr(request.user, 'profile'):
            archived_by = request.user.profile
        
        project.is_archived = True
        project.archived_at = timezone.now()
        project.archived_by = archived_by
        project.save()
        
        return Response({'message': 'Project archived successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        """Unarchive a project (restore)"""
        project = self.get_object()
        
        project.is_archived = False
        project.archived_at = None
        project.archived_by = None
        project.save()
        
        return Response({'message': 'Project unarchived successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def resources_summary(self, request, pk=None):
        """Return aggregate summary of project resources (company tools and money)"""
        project = self.get_object()
        
        # Get company tool allocations grouped by tool_name
        company_tools = project.resource_allocations.filter(resource_type='company_tool').values(
            'tool_name', 'category'
        ).annotate(
            total_allocated=models.Sum('allocated_quantity')
        ).order_by('tool_name')
        
        # Get money allocations
        money_allocations = project.resource_allocations.filter(resource_type='money')
        total_money = money_allocations.aggregate(total=models.Sum('money_amount'))['total'] or 0
        
        return Response({
            'company_tools': list(company_tools),
            'total_money': total_money,
            'money_allocations': ProjectResourceAllocationSerializer(money_allocations, many=True).data
        })

    @action(detail=True, methods=['get'])
    def resource_allocations(self, request, pk=None):
        """Return project's resource allocations with remaining balances"""
        project = self.get_object()
        allocations = project.resource_allocations.all()
        serializer = ProjectResourceAllocationSerializer(allocations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def activity_images(self, request, pk=None):
        """Return all activity images for this project"""
        project = self.get_object()
        activities = project.activities.all()
        images = ActivityImage.objects.filter(activity__in=activities).order_by('-uploaded_at')
        
        image_data = []
        for img in images:
            image_data.append({
                'id': img.id,
                'image': img.image.url if img.image else None,
                'caption': img.caption,
                'uploaded_at': img.uploaded_at.isoformat(),
                'activity_name': img.activity.activity_name if img.activity else None,
            })
        
        return Response(image_data)


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
    queryset = ProjectDocument.objects.all().order_by("-uploaded_at")
    serializer_class = ProjectDocumentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        if project:
            qs = qs.filter(project__id=project)
        return qs


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


class ProjectFieldHistoryViewSet(viewsets.ModelViewSet):
    queryset = ProjectFieldHistory.objects.all()
    serializer_class = ProjectFieldHistorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        if project:
            qs = qs.filter(project__id=project)
        return qs


class ProjectActivityViewSet(viewsets.ModelViewSet):
    queryset = ProjectActivity.objects.all()
    serializer_class = ProjectActivitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        if project:
            qs = qs.filter(project__id=project)
        return qs

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update all activities for a project"""
        try:
            project_id = request.data.get('project')
            activities_data = request.data.get('activities', [])
            
            if not project_id:
                return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Delete existing activities for this project
            ProjectActivity.objects.filter(project=project).delete()
            
            # Create new activities
            created_activities = []
            for activity_data in activities_data:
                resources_data = activity_data.pop('resources', [])
                images_data = activity_data.pop('images', [])
                # Remove project from activity_data to avoid duplicate keyword argument
                activity_data.pop('project', None)
                activity = ProjectActivity.objects.create(project=project, **activity_data)
                
                for resource_data in resources_data:
                    # Remove activity from resource_data to avoid duplicate keyword argument
                    resource_data_copy = resource_data.copy()
                    resource_data_copy.pop('activity', None)
                    ActivityResource.objects.create(activity=activity, **resource_data_copy)
                
                for image_data in images_data:
                    # Remove temporary IDs and activity before creating
                    image_data_copy = image_data.copy()
                    if 'id' in image_data_copy and str(image_data_copy['id']).startswith('temp-'):
                        del image_data_copy['id']
                    image_data_copy.pop('activity', None)
                    ActivityImage.objects.create(activity=activity, **image_data_copy)
                
                created_activities.append(activity)
            
            serializer = ProjectActivitySerializer(created_activities, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
