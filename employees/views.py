from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta
from .models import (
    Department, JobTitle, EmploymentType, Employee, Contract,
    EmployeeDocument, EmployeeAssignment, EmployeeHistory
)
from .serializers import (
    DepartmentSerializer, JobTitleSerializer, EmploymentTypeSerializer,
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeCreateSerializer,
    ContractSerializer, ContractCreateSerializer,
    EmployeeDocumentSerializer, EmployeeDocumentCreateSerializer,
    EmployeeAssignmentSerializer, EmployeeAssignmentCreateSerializer,
    EmployeeHistorySerializer, DashboardStatsSerializer,
    DepartmentReportSerializer, RecentActivitySerializer
)


class DashboardViewSet(viewsets.ViewSet):
    def list(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(status='active').count()
        on_contract = Employee.objects.filter(
            status='active',
            contracts__status='active',
            contracts__contract_type='fixed_term'
        ).distinct().count()
        exited = Employee.objects.filter(status='exited').count()
        
        active_contracts = Contract.objects.filter(status='active')
        contracts_expiring_soon = sum(1 for c in active_contracts if c.is_expiring_soon)
        contracts_expired = Contract.objects.filter(status='expired').count()
        
        new_this_month = Employee.objects.filter(created_at__gte=thirty_days_ago).count()
        
        department_distribution = list(
            Employee.objects.values('department__name').annotate(
                count=Count('id')
            ).order_by('-count')
        )
        
        recent_activities = list(
            EmployeeHistory.objects.select_related('employee').order_by('-timestamp')[:10]
        )
        
        recent_activities_data = [
            {
                'action': activity.get_action_display(),
                'description': activity.description,
                'timestamp': activity.timestamp,
                'employee_name': activity.employee.full_name
            }
            for activity in recent_activities
        ]
        
        data = {
            'total_employees': total_employees,
            'active_employees': active_employees,
            'on_contract': on_contract,
            'exited': exited,
            'contracts_expiring_soon': contracts_expiring_soon,
            'contracts_expired': contracts_expired,
            'new_this_month': new_this_month,
            'department_distribution': department_distribution,
            'recent_activities': recent_activities_data
        }
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('department', 'job_title', 'employment_type', 'supervisor')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'create':
            return EmployeeCreateSerializer
        return EmployeeDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        search = self.request.query_params.get('search', '')
        department = self.request.query_params.get('department', '')
        status_filter = self.request.query_params.get('status', '')
        employment_type = self.request.query_params.get('employment_type', '')
        contract_status = self.request.query_params.get('contract_status', '')
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(employee_id__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search)
            )
        
        if department:
            queryset = queryset.filter(department__name=department)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if employment_type:
            queryset = queryset.filter(employment_type__name=employment_type)
        
        if contract_status == 'expiring_soon':
            queryset = queryset.filter(
                contracts__status='active',
                contracts__end_date__lte=timezone.now() + timedelta(days=30),
                contracts__end_date__gte=timezone.now()
            ).distinct()
        elif contract_status == 'expired':
            queryset = queryset.filter(contracts__status='expired').distinct()
        
        return queryset
    
    def perform_create(self, serializer):
        employee = serializer.save()
        EmployeeHistory.objects.create(
            employee=employee,
            action='registered',
            description=f'Employee {employee.full_name} registered',
            performed_by=self.request.user.username if self.request.user.is_authenticated else 'System'
        )
    
    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        employee = self.get_object()
        serializer = EmployeeDetailSerializer(employee)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contracts(self, request, pk=None):
        employee = self.get_object()
        contracts = employee.contracts.all()
        serializer = ContractSerializer(contracts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        employee = self.get_object()
        documents = employee.documents.all()
        serializer = EmployeeDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        employee = self.get_object()
        assignments = employee.assignments.all()
        serializer = EmployeeAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        employee = self.get_object()
        history = employee.history.all()
        serializer = EmployeeHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def change_status(self, request, pk=None):
        employee = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        
        if new_status not in dict(Employee.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = employee.status
        employee.status = new_status
        employee.save()
        
        EmployeeHistory.objects.create(
            employee=employee,
            action='status_changed',
            description=f'Status changed from {old_status} to {new_status}. {reason}',
            previous_value=old_status,
            new_value=new_status,
            performed_by=request.user.username if request.user.is_authenticated else 'System'
        )
        
        return Response(EmployeeDetailSerializer(employee).data)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class JobTitleViewSet(viewsets.ModelViewSet):
    queryset = JobTitle.objects.select_related('department')
    serializer_class = JobTitleSerializer


class EmploymentTypeViewSet(viewsets.ModelViewSet):
    queryset = EmploymentType.objects.all()
    serializer_class = EmploymentTypeSerializer


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.select_related('employee')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ContractCreateSerializer
        return ContractSerializer
    
    def perform_create(self, serializer):
        contract = serializer.save()
        EmployeeHistory.objects.create(
            employee=contract.employee,
            action='contract_renewed' if contract.contract_type == 'renewed' else 'registered',
            description=f'Contract created: {contract.contract_type} from {contract.start_date} to {contract.end_date}',
            performed_by=self.request.user.username if self.request.user.is_authenticated else 'System'
        )
    
    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        contract = self.get_object()
        
        new_start_date = request.data.get('start_date', contract.end_date)
        new_end_date = request.data.get('end_date')
        new_salary = request.data.get('salary', contract.salary)
        
        if not new_end_date:
            return Response(
                {'error': 'end_date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contract.status = 'renewed'
        contract.save()
        
        new_contract = Contract.objects.create(
            employee=contract.employee,
            contract_type=contract.contract_type,
            start_date=new_start_date,
            end_date=new_end_date,
            salary=new_salary,
            currency=contract.currency,
            status='active'
        )
        
        EmployeeHistory.objects.create(
            employee=contract.employee,
            action='contract_renewed',
            description=f'Contract renewed from {new_start_date} to {new_end_date}',
            previous_value=str(contract.end_date),
            new_value=str(new_end_date),
            performed_by=request.user.username if request.user.is_authenticated else 'System'
        )
        
        return Response(ContractSerializer(new_contract).data)


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    queryset = EmployeeDocument.objects.select_related('employee')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeDocumentCreateSerializer
        return EmployeeDocumentSerializer
    
    def perform_create(self, serializer):
        document = serializer.save()
        EmployeeHistory.objects.create(
            employee=document.employee,
            action='document_uploaded',
            description=f'Document uploaded: {document.title}',
            performed_by=self.request.user.username if self.request.user.is_authenticated else 'System'
        )


class EmployeeAssignmentViewSet(viewsets.ModelViewSet):
    queryset = EmployeeAssignment.objects.select_related('employee')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeAssignmentCreateSerializer
        return EmployeeAssignmentSerializer
    
    def perform_create(self, serializer):
        assignment = serializer.save()
        EmployeeHistory.objects.create(
            employee=assignment.employee,
            action='assignment_added',
            description=f'Assignment added: {assignment.project_name} as {assignment.role}',
            performed_by=self.request.user.username if request.user.is_authenticated else 'System'
        )
    
    @action(detail=True, methods=['post'])
    def end_assignment(self, request, pk=None):
        assignment = self.get_object()
        end_date = request.data.get('end_date', timezone.now().date())
        
        assignment.end_date = end_date
        assignment.is_current = False
        assignment.save()
        
        EmployeeHistory.objects.create(
            employee=assignment.employee,
            action='assignment_ended',
            description=f'Assignment ended: {assignment.project_name}',
            performed_by=request.user.username if request.user.is_authenticated else 'System'
        )
        
        return Response(EmployeeAssignmentSerializer(assignment).data)


class EmployeeHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmployeeHistory.objects.select_related('employee')
    serializer_class = EmployeeHistorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee', '')
        if employee_id:
            queryset = queryset.filter(employee__employee_id=employee_id)
        return queryset


class ReportsViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def workforce_summary(self, request):
        total = Employee.objects.count()
        permanent = Employee.objects.filter(employment_type__name='Permanent').count()
        contract = Employee.objects.filter(employment_type__name='Contract').count()
        
        return Response({
            'total_employees': total,
            'permanent': permanent,
            'contract': contract
        })
    
    @action(detail=False, methods=['get'])
    def contract_report(self, request):
        now = timezone.now()
        thirty_days = now + timedelta(days=30)
        
        expiring_soon = Contract.objects.filter(
            status='active',
            end_date__gte=now,
            end_date__lte=thirty_days
        ).count()
        
        return Response({
            'expiring_within_30_days': expiring_soon,
            'employees_affected': expiring_soon
        })
    
    @action(detail=False, methods=['get'])
    def department_report(self, request):
        departments = Department.objects.annotate(
            employee_count=Count('employees')
        ).order_by('-employee_count')
        
        data = [
            {'department': dept.name, 'count': dept.employee_count}
            for dept in departments
        ]
        
        return Response(data)
