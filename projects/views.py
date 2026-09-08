from rest_framework import viewsets, permissions, status, decorators
from django.db import models
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Project, ProjectAssignment, ProjectRoleAllocation, ProjectRole, CasualWorker, CasualWorkerAttendance, CasualWorkTask, CasualWorkAssignment, CasualWorkProgress
from .serializers import (
    ProjectSerializer,
    ProjectMilestoneSerializer,
    ProjectDocumentSerializer,
    ProjectCostLineSerializer,
    ProjectHistorySerializer,
    ProjectTeamAssignmentHistorySerializer,
    ProjectAssignmentSerializer,
    ProjectRoleAllocationSerializer,
    ProjectRoleSerializer,
    CasualWorkerSerializer,
    CasualWorkerAttendanceSerializer,
    CasualWorkTaskSerializer,
    CasualWorkAssignmentSerializer,
    CasualWorkProgressSerializer,
    ProjectFieldHistorySerializer,
    ProjectActivitySerializer,
    ActivityResourceSerializer,
    ActivityImageSerializer,
    ProjectResourceAllocationSerializer,
    ProjectFundTransactionSerializer,
)
from .models_extras import (
    ProjectMilestone, ProjectDocument, ProjectCostLine, ProjectHistory, ProjectTeamAssignmentHistory,
    ProjectActivity, ActivityResource, ActivityImage, ProjectResourceAllocation, ProjectFieldHistory,
    ProjectFundTransaction
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        service = self.request.GET.get("service_line")
        q = self.request.GET.get("q")
        show_archived = self.request.GET.get("show_archived", "false").lower() == "true"

        # Don't filter by archived status for detail actions (archive, unarchive, etc.)
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'archive', 'unarchive']:
            pass  # Don't apply archived filter for detail actions
        elif show_archived:
            qs = qs.filter(is_archived=True)
        else:
            qs = qs.filter(is_archived=False)

        if service:
            qs = qs.filter(service_line=service)
        if q:
            qs = qs.filter(models.Q(name__icontains=q) | models.Q(project_reference__icontains=q))
        return qs

    @decorators.action(detail=True, methods=['get'])
    def fund_summary(self, request, pk=None):
        """Get fund summary for a project"""
        from .services.fund_service import FundService
        project = self.get_object()
        summary = FundService.get_project_fund_summary(project)
        return Response(summary)

    @decorators.action(detail=True, methods=['get'])
    def completion_check(self, request, pk=None):
        """Check if project can be completed based on outstanding tools and accountability"""
        project = self.get_object()
        summary = project.get_outstanding_tools_summary()
        return Response(summary)

    @decorators.action(detail=True, methods=['get'])
    def material_requests(self, request, pk=None):
        """Get material requests for this project"""
        from inventory.models import MaterialRequest
        project = self.get_object()
        requests = MaterialRequest.objects.filter(project_id=str(project.id))
        from inventory.serializers import MaterialRequestSerializer
        serializer = MaterialRequestSerializer(requests, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        project = serializer.save()

        from reports.audit import log_activity
        log_activity(
            module='projects',
            action='Project Created',
            entity_type='Project',
            entity_id=project.id,
            reference_number=project.project_reference,
            action_type='created',
            description=f'Project created: {project.name} ({project.project_reference})',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            new_data={'name': project.name, 'project_reference': project.project_reference, 'service_line': project.service_line},
            request=self.request,
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = {
            'name': old_instance.name,
            'status': old_instance.status,
            'completion_percentage': old_instance.completion_percentage,
        }
        super().perform_update(serializer)
        new_instance = self.get_object()
        new_data = {
            'name': new_instance.name,
            'status': new_instance.status,
            'completion_percentage': new_instance.completion_percentage,
        }

        # Log to SystemActivity if status changed
        if old_data['status'] != new_data['status']:
            from reports.audit import log_activity
            log_activity(
                module='projects',
                action='Project Status Changed',
                entity_type='Project',
                entity_id=new_instance.id,
                reference_number=new_instance.project_reference,
                action_type='updated',
                description=f'Project status changed: {new_instance.name} from {old_data["status"]} to {new_data["status"]}',
                performed_by=self.request.user if self.request.user.is_authenticated else None,
                old_data={'status': old_data['status']},
                new_data={'status': new_data['status']},
                request=self.request,
            )

    @decorators.action(detail=True, methods=['post'])
    def assign_employee(self, request, pk=None):
        project = self.get_object()
        serializer = ProjectRoleAllocationSerializer(data=request.data)

        if serializer.is_valid():
            from employees.models import Employee
            employee_id = request.data.get('employee')
            job_title_id = request.data.get('job_title')
            project_role_id = request.data.get('project_role')
            try:
                employee = Employee.objects.get(id=employee_id, status='available')
                from employees.models import JobTitle
                job_title = JobTitle.objects.get(id=job_title_id) if job_title_id else None
                
                # Get project role if provided
                project_role = None
                if project_role_id:
                    from .models import ProjectRole
                    project_role = ProjectRole.objects.get(id=project_role_id)

                # Check if employee is already assigned to this project
                existing = ProjectRoleAllocation.objects.filter(
                    employee=employee,
                    project=project,
                    is_active=True
                ).first()
                if existing:
                    return Response(
                        {'error': 'Employee is already assigned to this project'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Handle clerk of works assignment (using project_role)
                if project_role and project_role.name == 'Clerk of Works':
                    # Check if there's already a clerk of works
                    existing_lead = ProjectRoleAllocation.objects.filter(
                        project=project,
                        project_role__name='Clerk of Works',
                        is_active=True
                    ).first()
                    if existing_lead:
                        # Replace existing clerk of works
                        existing_lead.project_role = None
                        existing_lead.save()

                serializer.save(
                    employee=employee,
                    project=project,
                    job_title=job_title,
                    project_role=project_role,
                    assigned_by=request.user if request.user.is_authenticated else None
                )

                from reports.audit import log_activity
                log_activity(
                    module='projects',
                    action='Employee Assigned to Project',
                    entity_type='Project',
                    entity_id=project.id,
                    reference_number=project.project_reference,
                    action_type='assigned',
                    description=f'Employee assigned: {employee.full_name} to project {project.name}',
                    performed_by=request.user if request.user.is_authenticated else None,
                    new_data={'employee': employee.full_name, 'project': project.name, 'job_title': job_title.title if job_title else 'N/A', 'project_role': project_role.name if project_role else 'N/A'},
                    request=request,
                )

                return Response({'status': 'assigned', 'employee': employee.full_name})
            except Employee.DoesNotExist:
                return Response(
                    {'error': 'Employee not found or not available'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @decorators.action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        project = self.get_object()
        assignments = project.role_allocations.filter(is_active=True)
        serializer = ProjectRoleAllocationSerializer(assignments, many=True)
        return Response(serializer.data)

    @decorators.action(detail=True, methods=['post'])
    def remove_assignment(self, request, pk=None):
        project = self.get_object()
        allocation_id = request.data.get('allocation_id')
        try:
            allocation = ProjectRoleAllocation.objects.get(id=allocation_id, project=project)
            allocation.is_active = False
            allocation.save()
            return Response({'message': 'Assignment removed successfully'})
        except ProjectRoleAllocation.DoesNotExist:
            return Response(
                {'error': 'Assignment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @decorators.action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pending project"""
        project = self.get_object()
        if project.status != 'pending_approval':
            return Response(
                {'error': 'Only projects with pending_approval status can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        approval_notes = request.data.get('approval_notes', '')
        project.status = 'not_started'
        project.approved_by = request.user if request.user.is_authenticated else None
        project.approved_at = timezone.now()
        project.approval_notes = approval_notes
        project.save()

        from reports.audit import log_activity
        log_activity(
            module='projects',
            action='Project Approved',
            entity_type='Project',
            entity_id=project.id,
            reference_number=project.project_reference,
            action_type='approved',
            description=f'Project approved: {project.name} ({project.project_reference})',
            performed_by=request.user if request.user.is_authenticated else None,
            new_data={'status': 'not_started', 'approval_notes': approval_notes},
            request=self.request,
        )

        # Send project approved notifications
        try:
            from notifications.utils import send_project_approved_email
            send_project_approved_email(project)
        except Exception as e:
            print(f"Error sending project approved notification: {e}")

        return Response({'status': 'approved', 'project_reference': project.project_reference})

    @decorators.action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        print(f"Archive action called for project pk={pk}")
        try:
            project = Project.objects.get(pk=pk)
            print(f"Project found: {project.name}, is_archived={project.is_archived}")
            if project.is_archived:
                return Response(
                    {'error': 'Project is already archived'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            project.is_archived = True
            project.archived_at = timezone.now()
            project.save()
            print(f"Project archived successfully: {project.name}")

            serializer = self.get_serializer(project)
            return Response(serializer.data)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error archiving project: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error archiving project: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @decorators.action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        print(f"Unarchive action called for project pk={pk}")
        project = self.get_object()
        print(f"Project found: {project.name}, is_archived={project.is_archived}")
        if not project.is_archived:
            return Response(
                {'error': 'Project is not archived'},
                status=status.HTTP_400_BAD_REQUEST
            )

        project.is_archived = False
        project.archived_at = None
        project.archived_by = None
        project.save()
        print(f"Project unarchived successfully: {project.name}")

        serializer = self.get_serializer(project)
        return Response(serializer.data)


class ProjectRoleAllocationViewSet(viewsets.ModelViewSet):
    queryset = ProjectRoleAllocation.objects.all()
    serializer_class = ProjectRoleAllocationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        employee = self.request.GET.get("employee")
        if project:
            qs = qs.filter(project__id=project)
        if employee:
            qs = qs.filter(employee__id=employee)
        return qs


class ProjectRoleViewSet(viewsets.ModelViewSet):
    queryset = ProjectRole.objects.all()
    serializer_class = ProjectRoleSerializer
    permission_classes = [permissions.AllowAny]


class CasualWorkerViewSet(viewsets.ModelViewSet):
    queryset = CasualWorker.objects.all()
    serializer_class = CasualWorkerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        if project:
            qs = qs.filter(project__id=project)
        return qs


class CasualWorkerAttendanceViewSet(viewsets.ModelViewSet):
    queryset = CasualWorkerAttendance.objects.all()
    serializer_class = CasualWorkerAttendanceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        casual_worker = self.request.GET.get("casual_worker")
        if project:
            qs = qs.filter(casual_worker__project__id=project)
        if casual_worker:
            qs = qs.filter(casual_worker__id=casual_worker)
        return qs

    def create(self, request, *args, **kwargs):
        """Allow one attendance record per casual worker for each local workday."""
        casual_worker_id = request.data.get("casual_worker")
        if casual_worker_id:
            from django.utils import timezone

            already_clocked_in = CasualWorkerAttendance.objects.filter(
                casual_worker_id=casual_worker_id,
                clock_in__date=timezone.localdate(),
            ).exists()
            if already_clocked_in:
                return Response(
                    {"error": "This worker has already been clocked in today."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return super().create(request, *args, **kwargs)

    @decorators.action(detail=True, methods=['post'])
    def clock_out(self, request, pk=None):
        attendance = self.get_object()
        if attendance.clock_out:
            return Response(
                {'error': 'Already clocked out'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if attendance.casual_worker.payment_type == "piece_rate":
            pieces_completed = request.data.get("pieces_completed")
            if pieces_completed in (None, ""):
                return Response(
                    {'error': 'Enter the number of completed pieces before clocking out.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                from decimal import Decimal
                attendance.pieces_completed = Decimal(str(pieces_completed))
                if attendance.pieces_completed < 0:
                    raise ValueError
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Completed pieces must be a non-negative number.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        from django.utils import timezone
        attendance.clock_out = timezone.now()
        attendance.clocked_out_by = request.user if request.user.is_authenticated else None
        attendance.save()
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)


class CasualWorkTaskViewSet(viewsets.ModelViewSet):
    queryset = CasualWorkTask.objects.all()
    serializer_class = CasualWorkTaskSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        if project := self.request.GET.get('project'):
            queryset = queryset.filter(project_id=project)
        return queryset


class CasualWorkAssignmentViewSet(viewsets.ModelViewSet):
    queryset = CasualWorkAssignment.objects.all()
    serializer_class = CasualWorkAssignmentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        if task := self.request.GET.get('task'):
            queryset = queryset.filter(task_id=task)
        return queryset


class CasualWorkProgressViewSet(viewsets.ModelViewSet):
    queryset = CasualWorkProgress.objects.all()
    serializer_class = CasualWorkProgressSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        if task := self.request.GET.get('task'):
            queryset = queryset.filter(task_id=task)
        return queryset

    def perform_create(self, serializer):
        serializer.save(approved_by=self.request.user if self.request.user.is_authenticated else None)

    @decorators.action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        progress = self.get_object()
        progress.is_approved = True
        progress.approved_by = request.user if request.user.is_authenticated else None
        progress.save(update_fields=['is_approved', 'approved_by'])
        return Response(self.get_serializer(progress).data)


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

    def create(self, request, *args, **kwargs):
        """Only available, non-archived employees can receive a new project allocation."""
        from employees.models import Employee
        employee_id = request.data.get('employee')
        try:
            employee = Employee.objects.get(id=employee_id, status=Employee.AVAILABLE, is_archived=False)
        except Employee.DoesNotExist:
            return Response({'error': 'Select an available employee before making an allocation.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    @decorators.action(detail=False, methods=['get'])
    def review_actions(self, request):
        """Open allocation decisions caused by a completed or ended project."""
        from django.db.models import Q
        today = timezone.localdate()
        allocations = self.get_queryset().filter(
            is_active=True,
            reviewed_at__isnull=True,
        ).filter(
            Q(project__status='completed') |
            Q(project__actual_completion_date__lte=today) |
            Q(project__planned_end_date__lte=today)
        ).select_related('employee', 'project')

        if request.user.is_authenticated:
            from notifications.models import Notification
            for allocation in allocations:
                Notification.objects.get_or_create(
                    recipient=request.user,
                    notification_type='employee_allocation_review',
                    metadata__allocation_id=allocation.id,
                    defaults={
                        'title': 'Employee allocation needs review',
                        'message': f'{allocation.employee.full_name} is still assigned to {allocation.project.name}. Confirm their employment status.',
                        'project_id': allocation.project_id,
                        'metadata': {'allocation_id': allocation.id, 'link': '/admin/employees'},
                    },
                )
        return Response(ProjectRoleAllocationSerializer(allocations, many=True).data)

    @decorators.action(detail=True, methods=['post'])
    def resolve_review(self, request, pk=None):
        allocation = self.get_object()
        decision = request.data.get('decision')
        if decision not in {'available', 'keep_assigned'}:
            return Response({'error': 'Decision must be available or keep_assigned.'}, status=status.HTTP_400_BAD_REQUEST)
        allocation.reviewed_at = timezone.now()
        allocation.reviewed_by = request.user if request.user.is_authenticated else None
        if decision == 'available':
            allocation.is_active = False
            allocation.end_date = timezone.localdate()
            employee = allocation.employee
            other_active = ProjectRoleAllocation.objects.filter(employee=employee, is_active=True).exclude(pk=allocation.pk).exists()
            if not other_active and employee.status == 'assigned':
                from employees.models import Employee
                employee.status = Employee.AVAILABLE
                employee.save(update_fields=['status'])
        allocation.save()
        return Response(ProjectRoleAllocationSerializer(allocation).data)


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
        print(f"ProjectActivityViewSet.get_queryset called with project={project}")
        if project:
            qs = qs.filter(project__id=project)
        print(f"Queryset count: {qs.count()}")
        return qs

    def create(self, request, *args, **kwargs):
        print(f"ProjectActivityViewSet.create called")
        print(f"Request data: {request.data}")
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                instance = serializer.save()
                print(f"Activity created successfully: {instance.activity_name}")

                # Update project completion percentage based on average activity progress
                project = instance.project
                activities = project.activities.all()
                if activities.exists():
                    total_progress = sum(activity.progress for activity in activities)
                    avg_progress = total_progress // activities.count()
                    project.completion_percentage = avg_progress
                    project.save()
                    print(f"Updated project {project.name} completion percentage to {avg_progress}%")

                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error creating activity: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error creating activity: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        print(f"ProjectActivityViewSet.update called with pk={kwargs.get('pk')}")
        print(f"Request data: {request.data}")
        try:
            instance = self.get_object()
            print(f"Activity found: {instance.activity_name}")
            serializer = self.get_serializer(instance, data=request.data, partial=False)
            if serializer.is_valid():
                serializer.save()
                print(f"Activity updated successfully")

                # Update project completion percentage based on average activity progress
                project = instance.project
                activities = project.activities.all()
                if activities.exists():
                    total_progress = sum(activity.progress for activity in activities)
                    avg_progress = total_progress // activities.count()
                    project.completion_percentage = avg_progress
                    project.save()
                    print(f"Updated project {project.name} completion percentage to {avg_progress}%")

                return Response(serializer.data)
            else:
                print(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error updating activity: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error updating activity: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @decorators.action(detail=True, methods=['get'])
    def resources(self, request, pk=None):
        activity = self.get_object()
        resources = activity.resources.all()
        serializer = ActivityResourceSerializer(resources, many=True)
        return Response(serializer.data)

    @decorators.action(detail=True, methods=['get'])
    def images(self, request, pk=None):
        activity = self.get_object()
        images = activity.images.all()
        serializer = ActivityImageSerializer(images, many=True)
        return Response(serializer.data)


class ActivityResourceViewSet(viewsets.ModelViewSet):
    queryset = ActivityResource.objects.all()
    serializer_class = ActivityResourceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        activity = self.request.GET.get("activity")
        if activity:
            qs = qs.filter(activity__id=activity)
        return qs


class ActivityImageViewSet(viewsets.ModelViewSet):
    queryset = ActivityImage.objects.all()
    serializer_class = ActivityImageSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        activity = self.request.GET.get("activity")
        if activity:
            qs = qs.filter(activity__id=activity)
        return qs


class ProjectResourceAllocationViewSet(viewsets.ModelViewSet):
    queryset = ProjectResourceAllocation.objects.all()
    serializer_class = ProjectResourceAllocationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        if project:
            qs = qs.filter(project__id=project)
        return qs

    def perform_create(self, serializer):
        serializer.save(allocated_by=self.request.user if self.request.user.is_authenticated else None)


class ProjectFundTransactionViewSet(viewsets.ModelViewSet):
    queryset = ProjectFundTransaction.objects.select_related(
        'project', 'activity', 'resource_allocation', 'spent_by'
    )
    serializer_class = ProjectFundTransactionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        project = self.request.GET.get("project")
        if project:
            qs = qs.filter(project__id=project)
        return qs

    def perform_create(self, serializer):
        serializer.save(spent_by=self.request.user if self.request.user.is_authenticated else None)

    @decorators.action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pending fund transaction"""
        from .services.fund_service import FundService
        try:
            transaction = FundService.approve_transaction(pk, approved_by=request.user)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @decorators.action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a pending or approved fund transaction"""
        from .services.fund_service import FundService
        reason = request.data.get('reason', '')
        try:
            transaction = FundService.reject_transaction(pk, rejected_by=request.user, reason=reason)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @decorators.action(detail=True, methods=['post'])
    def post(self, request, pk=None):
        """Post an approved transaction to project costs"""
        from .services.fund_service import FundService
        try:
            transaction = FundService.post_transaction(pk, posted_by=request.user)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @decorators.action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a pending fund transaction"""
        from .services.fund_service import FundService
        reason = request.data.get('reason', '')
        try:
            transaction = FundService.cancel_transaction(pk, cancelled_by=request.user, reason=reason)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def public_projects(request):
    """
    API endpoint to fetch published projects for public website.
    Includes project details, cover images, and gallery images.
    """
    projects = Project.objects.filter(
        is_published=True,
        is_archived=False
    ).order_by('-created_at')

    results = []
    for project in projects:
        # Get activity images for this project's gallery
        activity_images = []
        for activity in project.activities.all():
            for image in activity.images.all():
                image_url = image.image.url if image.image else image.image_url
                if image_url and not image_url.startswith('http'):
                    image_url = request.build_absolute_uri(image_url)
                activity_images.append({
                    'url': image_url,
                    'caption': image.caption or '',
                    'uploaded_at': image.uploaded_at.isoformat() if image.uploaded_at else None,
                })

        # Get cover image
        cover_image = None
        if project.cover_image:
            cover_image = project.cover_image.url
            if cover_image and not cover_image.startswith('http'):
                cover_image = request.build_absolute_uri(cover_image)
        elif project.cover_image_url:
            cover_image = project.cover_image_url

        results.append({
            'id': str(project.id),
            'project_reference': project.project_reference,
            'name': project.name,
            'service_line': project.get_service_line_display(),
            'description': project.public_description or project.scope_description,
            'location': project.site_location,
            'latitude': float(project.latitude) if project.latitude else None,
            'longitude': float(project.longitude) if project.longitude else None,
            'cover_image': cover_image,
            'gallery_images': activity_images,
            'status': project.get_status_display(),
            'completion_percentage': project.completion_percentage,
            'actual_start_date': project.actual_start_date.isoformat() if project.actual_start_date else None,
            'actual_completion_date': project.actual_completion_date.isoformat() if project.actual_completion_date else None,
        })

    return Response({
        'results': results,
        'count': len(results)
    })


@api_view(['GET'])
def public_project_detail(request, project_id):
    """
    API endpoint to fetch detailed information for a single published project.
    """
    try:
        project = Project.objects.get(id=project_id, is_published=True, is_archived=False)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get activity images for gallery
    activity_images = []
    hero_images = []
    for activity in project.activities.all():
        for image in activity.images.all():
            image_url = image.image.url if image.image else image.image_url
            if image_url and not image_url.startswith('http'):
                image_url = request.build_absolute_uri(image_url)
            activity_images.append({
                'url': image_url,
                'caption': image.caption or '',
                'uploaded_at': image.uploaded_at.isoformat() if image.uploaded_at else None,
                'activity': activity.activity_name,
            })
            # Add first 3 images as hero images
            if len(hero_images) < 3:
                hero_images.append(image_url)

    # Get cover image
    cover_image = None
    if project.cover_image:
        cover_image = project.cover_image.url
        if cover_image and not cover_image.startswith('http'):
            cover_image = request.build_absolute_uri(cover_image)
    elif project.cover_image_url:
        cover_image = project.cover_image_url

    # Get milestones
    milestones = []
    for milestone in project.milestones.all():
        milestones.append({
            'title': milestone.name,
            'description': milestone.description,
            'target_date': milestone.target_date.isoformat() if milestone.target_date else None,
            'is_completed': milestone.status == 'completed',
        })

    # Get related projects (same service line, excluding current project)
    related_projects = []
    related = Project.objects.filter(
        service_line=project.service_line,
        is_published=True,
        is_archived=False
    ).exclude(id=project.id).order_by('-created_at')[:3]

    for rel_project in related:
        rel_cover = None
        if rel_project.cover_image:
            rel_cover = rel_project.cover_image.url
            if rel_cover and not rel_cover.startswith('http'):
                rel_cover = request.build_absolute_uri(rel_cover)
        elif rel_project.cover_image_url:
            rel_cover = rel_project.cover_image_url

        related_projects.append({
            'id': str(rel_project.id),
            'name': rel_project.name,
            'service_line': rel_project.get_service_line_display(),
            'location': rel_project.site_location,
            'cover_image': rel_cover,
        })

    return Response({
        'id': str(project.id),
        'project_reference': project.project_reference,
        'name': project.name,
        'service_line': project.get_service_line_display(),
        'description': project.public_description or project.scope_description,
        'location': project.site_location,
        'latitude': float(project.latitude) if project.latitude else None,
        'longitude': float(project.longitude) if project.longitude else None,
        'cover_image': cover_image,
        'hero_images': hero_images,
        'gallery_images': activity_images,
        'milestones': milestones,
        'status': project.get_status_display(),
        'completion_percentage': project.completion_percentage,
        'contract_value': float(project.contract_value),
        'planned_start_date': project.planned_start_date.isoformat() if project.planned_start_date else None,
        'planned_end_date': project.planned_end_date.isoformat() if project.planned_end_date else None,
        'actual_start_date': project.actual_start_date.isoformat() if project.actual_start_date else None,
        'actual_completion_date': project.actual_completion_date.isoformat() if project.actual_completion_date else None,
        'created_at': project.created_at.isoformat(),
        'updated_at': project.updated_at.isoformat(),
        'challenge': project.challenge,
        'approach': project.approach,
        'result_coverage': project.result_coverage,
        'result_units_installed': project.result_units_installed,
        'result_infrastructure': project.result_infrastructure,
        'result_other': project.result_other,
        'result_delivery_timing': project.result_delivery_timing,
        'related_projects': related_projects,
    })
