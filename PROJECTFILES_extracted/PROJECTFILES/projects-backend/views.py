import json
from rest_framework import viewsets, permissions, status
from django.db import models, transaction
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
    ActivityUpdateHistorySerializer,
    ProjectActivitySerializer,
    ProjectResourceAllocationSerializer,
)
from .models_extras import ProjectMilestone, ProjectDocument, ProjectCostLine, ProjectHistory, ProjectTeamAssignmentHistory, ProjectFieldHistory, ProjectActivity, ActivityUpdateHistory, ActivityResource, ActivityImage, ProjectResourceAllocation


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

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
            
            with transaction.atomic():
                # Create project
                serializer = self.get_serializer(data=project_data)
                serializer.is_valid(raise_exception=True)
                project = serializer.save()

                # Validate and save each uploaded document, so invalid types cannot
                # silently create records that the UI cannot classify correctly.
                for doc_data in documents_data:
                    if 'file' in doc_data:
                        document_serializer = ProjectDocumentSerializer(data={
                            **doc_data,
                            'project': str(project.id),
                            'document_type': doc_data.get('document_type', 'other'),
                        })
                        document_serializer.is_valid(raise_exception=True)
                        document_serializer.save()
            
            # Return the created project with documents
            response_serializer = self.get_serializer(project)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Handle all updates, not just multipart form data
        instance = self.get_object()
        old_values = {}

        # Get old values for all fields before update
        for field in instance._meta.fields:
            if field.name not in ['id', 'created_at', 'updated_at']:
                old_values[field.name] = str(getattr(instance, field.name))

        # Extract project data from request
        project_data = {}
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle FormData
            for key, value in request.data.items():
                if key == 'resource_allocations':
                    continue
                project_data[key] = value
        else:
            # Handle JSON data
            project_data = request.data.copy()

        with transaction.atomic():
            serializer = self.get_serializer(instance, data=project_data, partial=True)
            serializer.is_valid(raise_exception=True)
            updated_instance = serializer.save()

            # Compare and log changes
            changes_logged = False
            for field in updated_instance._meta.fields:
                if field.name not in ['id', 'created_at', 'updated_at']:
                    new_value = str(getattr(updated_instance, field.name))
                    old_value = old_values.get(field.name)

                    if old_value != new_value:
                        # Get the user who made the change
                        changed_by = None
                        if request.user and hasattr(request.user, 'profile'):
                            changed_by = request.user.profile

                        # Create field history record
                        ProjectFieldHistory.objects.create(
                            project=updated_instance,
                            field_name=field.name,
                            old_value=old_value,
                            new_value=new_value,
                            changed_by=changed_by
                        )
                        changes_logged = True

            # If no field changes were detected but data was submitted, log a general update
            if not changes_logged and project_data:
                changed_by = None
                if request.user and hasattr(request.user, 'profile'):
                    changed_by = request.user.profile
                ProjectFieldHistory.objects.create(
                    project=updated_instance,
                    field_name='general_update',
                    old_value='N/A',
                    new_value='Project updated',
                    changed_by=changed_by
                )

        response_serializer = self.get_serializer(updated_instance)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    def get_queryset(self):
        qs = super().get_queryset()
        project_reference = self.request.GET.get("project_reference")
        service = self.request.GET.get("service_line")
        q = self.request.GET.get("q")
        is_archived = self.request.GET.get("is_archived")
        
        # Default filter: exclude archived projects unless specifically requested
        if is_archived is None:
            qs = qs.filter(is_archived=False)
        elif is_archived.lower() in ['true', '1', 'yes']:
            qs = qs.filter(is_archived=True)

        if project_reference:
            qs = qs.filter(project_reference=project_reference)
        if service:
            qs = qs.filter(service_line=service)
        if q:
            qs = qs.filter(models.Q(name__icontains=q) | models.Q(project_reference__icontains=q))
        return qs

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
        try:
            project = self.get_object()

            # Get all allocations in a single query
            allocations = project.resource_allocations.filter(is_archived=False)

            # Separate by resource type
            company_tools_data = []
            hired_tools_data = []
            money_allocations_data = []
            total_money = 0

            for allocation in allocations:
                try:
                    if allocation.resource_type == 'company_tool':
                        company_tools_data.append({
                            'id': str(allocation.id),
                            'tool_name': allocation.tool_name or '',
                            'category': allocation.category or '',
                            'total_allocated': allocation.allocated_quantity or 0,
                            'specifications': allocation.specifications or '',
                            'supplier': allocation.supplier or '',
                            'source': allocation.supplier or '',
                            'cost': None,
                        })
                    elif allocation.resource_type == 'hired_tool':
                        hired_tools_data.append({
                            'id': str(allocation.id),
                            'tool_name': allocation.tool_name or '',
                            'quantity': allocation.allocated_quantity or 0,
                            'hired_from': allocation.hired_from or '',
                            'source': allocation.hired_from or '',
                            'cost': allocation.hired_tool_cost or 0,
                        })
                    elif allocation.resource_type == 'money':
                        money_allocations_data.append({
                            'id': str(allocation.id),
                            'money_purpose': allocation.money_purpose or '',
                            'money_amount': allocation.money_amount or 0,
                            'source': 'Project allocation',
                            'cost': allocation.money_amount or 0,
                            'allocated_at': allocation.allocated_at.isoformat() if allocation.allocated_at else None,
                        })
                        total_money += allocation.money_amount or 0
                except Exception as e:
                    # Skip problematic allocations but continue processing others
                    import logging
                    logging.error(f"Error processing allocation {allocation.id}: {str(e)}")
                    continue

            return Response({
                'company_tools': company_tools_data,
                'hired_tools': hired_tools_data,
                'total_money': total_money,
                'money_allocations': money_allocations_data
            })
        except Exception as e:
            import logging
            logging.error(f"Error in resources_summary: {str(e)}")
            return Response({'detail': f'Error loading resources: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def resource_allocations(self, request, pk=None):
        """Return project's resource allocations with remaining balances"""
        project = self.get_object()
        allocations = project.resource_allocations.all()
        serializer = ProjectResourceAllocationSerializer(allocations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'patch', 'delete'], url_path=r'resources/(?P<resource_id>[^/.]+)')
    def resource_allocation(self, request, pk=None, resource_id=None):
        """View, archive, or permanently delete one project resource allocation."""
        project = self.get_object()
        try:
            allocation = project.resource_allocations.get(id=resource_id)
        except ProjectResourceAllocation.DoesNotExist:
            return Response({'detail': 'Resource allocation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(ProjectResourceAllocationSerializer(allocation).data)

        if request.method == 'PATCH':
            if not request.data.get('is_archived'):
                return Response({'detail': 'Only archiving is supported.'}, status=status.HTTP_400_BAD_REQUEST)
            allocation.is_archived = True
            allocation.archived_at = timezone.now()
            allocation.save(update_fields=['is_archived', 'archived_at'])
            return Response(ProjectResourceAllocationSerializer(allocation).data)

        allocation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def add_resource(self, request, pk=None):
        """Add a resource allocation to a project"""
        project = self.get_object()

        try:
            resource_type = request.data.get('resource_type')
            if not resource_type:
                return Response({'detail': 'resource_type is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Create the resource allocation
            allocation_data = {
                'project': project.id,
                'resource_type': resource_type,
            }

            if resource_type == 'company_tool':
                allocation_data['tool_name'] = request.data.get('tool_name')
                allocation_data['category'] = request.data.get('category')
                allocation_data['allocated_quantity'] = request.data.get('allocated_quantity')
                allocation_data['specifications'] = request.data.get('specifications')
                allocation_data['supplier'] = request.data.get('supplier')
            elif resource_type == 'hired_tool':
                allocation_data['tool_name'] = request.data.get('hired_tool_name')
                allocation_data['allocated_quantity'] = request.data.get('allocated_quantity')
                allocation_data['hired_from'] = request.data.get('hired_from')
                allocation_data['hired_tool_cost'] = request.data.get('hired_tool_cost')
            elif resource_type == 'money':
                allocation_data['money_amount'] = request.data.get('money_amount')
                allocation_data['money_purpose'] = request.data.get('money_purpose')

            serializer = ProjectResourceAllocationSerializer(data=allocation_data)
            serializer.is_valid(raise_exception=True)
            allocation = serializer.save()

            return Response(ProjectResourceAllocationSerializer(allocation).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

    def create(self, request, *args, **kwargs):
        print(f"DEBUG DOCUMENT: Create called with content_type: {request.content_type}")
        print(f"DEBUG DOCUMENT: Request data keys: {list(request.data.keys())}")
        print(f"DEBUG DOCUMENT: Request data: {request.data}")
        try:
            response = super().create(request, *args, **kwargs)
            print(f"DEBUG DOCUMENT: Create successful")
            return response
        except Exception as e:
            print(f"DEBUG DOCUMENT: Create failed with error: {str(e)}")
            raise


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
        return qs.order_by('-changed_at')


class ActivityUpdateHistoryViewSet(viewsets.ModelViewSet):
    queryset = ActivityUpdateHistory.objects.all()
    serializer_class = ActivityUpdateHistorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        activity = self.request.GET.get("activity")
        project = self.request.GET.get("project")
        if activity:
            qs = qs.filter(activity__id=activity)
        if project:
            qs = qs.filter(activity__project__id=project)
        return qs.order_by('-changed_at')


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

    def _get_actor(self, request):
        if request.user and hasattr(request.user, 'profile'):
            return request.user.profile
        return None

    def _summarize_activity(self, activity):
        def format_date(date_value):
            if date_value is None:
                return None
            if isinstance(date_value, str):
                return date_value
            return date_value.isoformat()

        return json.dumps({
            'activity_name': activity.activity_name,
            'start_date': format_date(activity.start_date),
            'end_date': format_date(activity.end_date),
            'progress': activity.progress,
            'status': activity.status,
            'notes': activity.notes,
            'resource_count': activity.resources.count(),
        })

    def _summarize_activity_data(self, activity_data):
        return json.dumps({
            'activity_name': activity_data.get('activity_name'),
            'start_date': activity_data.get('start_date'),
            'end_date': activity_data.get('end_date'),
            'progress': activity_data.get('progress'),
            'status': activity_data.get('status'),
            'notes': activity_data.get('notes'),
            'resource_count': len(activity_data.get('resources', [])),
        })

    def _log_activity_update(self, activity, action, before_value=None, after_value=None, actor=None):
        ActivityUpdateHistory.objects.create(
            activity=activity,
            action=action,
            before_value=before_value,
            after_value=after_value,
            changed_by=actor,
        )

    def _format_field_value(self, field_name, value):
        """Format field value for display in update history"""
        if value is None:
            return 'None'
        if field_name == 'progress':
            return f"{value}%"
        if field_name in ['start_date', 'end_date']:
            return str(value)
        return str(value)

    def _sync_project_progress(self, project):
        activities = project.activities.all()
        if activities.exists():
            average_progress = round(sum(activity.progress for activity in activities) / activities.count())
        else:
            average_progress = 0
        project.completion_percentage = average_progress
        project.save(update_fields=['completion_percentage'])

    def perform_create(self, serializer):
        activity = serializer.save()
        self._sync_project_progress(activity.project)

    def perform_update(self, serializer):
        activity = serializer.save()
        self._sync_project_progress(activity.project)

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
            
            actor = self._get_actor(request)
            incoming_ids = []
            created_activities = []
            for activity_data in activities_data:
                resources_data = activity_data.pop('resources', [])
                images_data = activity_data.pop('images', [])
                activity_id = activity_data.get('id')
                incoming_ids.append(str(activity_id)) if activity_id else None
                # Client responses include read-only reverse relations such as
                # `update_history`. Only persist fields that belong to ProjectActivity.
                activity_data = {
                    key: value
                    for key, value in activity_data.items()
                    if key in {
                        'activity_name', 'order', 'start_date', 'end_date',
                        'progress', 'notes', 'status', 'is_archived',
                    }
                }

                existing_activity = None
                if activity_id:
                    existing_activity = ProjectActivity.objects.filter(project=project, id=activity_id).first()

                if existing_activity:
                    # Track individual field changes
                    changed_fields = {}
                    for attr, value in activity_data.items():
                        old_value = getattr(existing_activity, attr, None)
                        if old_value != value:
                            changed_fields[attr] = {
                                'old': old_value,
                                'new': value
                            }
                        setattr(existing_activity, attr, value)
                    existing_activity.save()
                    activity = existing_activity

                    # Log each changed field individually with formatted values
                    if changed_fields:
                        for field_name, values in changed_fields.items():
                            action = f'{field_name}_changed'
                            # Format values without field name prefix
                            old_formatted = self._format_field_value(field_name, values['old'])
                            new_formatted = self._format_field_value(field_name, values['new'])
                            self._log_activity_update(activity, action, old_formatted, new_formatted, actor=actor)
                else:
                    activity = ProjectActivity.objects.create(project=project, **activity_data)
                    self._log_activity_update(activity, 'created', None, self._summarize_activity_data(activity_data), actor=actor)
                
                # Replace resources/images for this activity
                activity.resources.all().delete()
                activity.images.all().delete()
                for resource_data in resources_data:
                    # Remove activity from resource_data to avoid duplicate keyword argument
                    resource_data_copy = resource_data.copy()
                    resource_data_copy.pop('activity', None)
                    # Remove read-only/computed fields that don't exist in the model
                    resource_data_copy.pop('inventory_item_name', None)
                    resource_data_copy.pop('remaining_quantity', None)
                    resource_data_copy.pop('remaining_amount', None)
                    ActivityResource.objects.create(activity=activity, **resource_data_copy)
                
                for image_data in images_data:
                    # Remove temporary IDs and activity before creating
                    image_data_copy = image_data.copy()
                    if 'id' in image_data_copy and str(image_data_copy['id']).startswith('temp-'):
                        del image_data_copy['id']
                    image_data_copy.pop('activity', None)
                    ActivityImage.objects.create(activity=activity, **image_data_copy)
                
                if resources_data:
                    self._log_activity_update(activity, 'resource_changed', None, f"{len(resources_data)} resource(s) updated", actor=actor)
                
                created_activities.append(activity)

            # Remove activities that are no longer in the payload
            ProjectActivity.objects.filter(project=project).exclude(id__in=[activity.id for activity in created_activities]).delete()
            self._sync_project_progress(project)
            
            serializer = ProjectActivitySerializer(created_activities, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
