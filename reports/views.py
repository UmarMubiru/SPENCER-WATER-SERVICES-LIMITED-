from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from .models import SystemActivity, Alert, MetricSnapshot, SavedReport, ScheduledReport
from .serializers import (
    SystemActivitySerializer, AlertSerializer, MetricSnapshotSerializer,
    SavedReportSerializer, ScheduledReportSerializer,
)
from .permissions import get_visible_modules


class SystemActivityView(generics.ListAPIView):
    """Read-only, ever. No create/update/delete action — writes only via log_activity()."""
    serializer_class = SystemActivitySerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    filterset_fields = ['module', 'action_type']

    def get_queryset(self):
        modules = get_visible_modules(self.request.user)
        qs = SystemActivity.objects.select_related('performed_by').all()
        if modules is not None:
            qs = qs.filter(module__in=modules)

        # Dashboard consumers request a small, current activity feed.  Keep the
        # default behaviour for the Activity Center, while protecting the API
        # from an unbounded client-supplied limit.
        try:
            limit = int(self.request.query_params.get('limit', 0))
        except (TypeError, ValueError):
            limit = 0
        return qs[:min(limit, 100)] if limit > 0 else qs


class SecurityStatsView(APIView):
    """Security-tab counters derived from the existing append-only activity log."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        security_events = SystemActivity.objects.filter(
            Q(module='security') | Q(action_type__in=['failed_login', 'successful_login'])
        )
        return Response({
            'successful_logins': security_events.filter(action_type='successful_login').count(),
            'failed_logins': security_events.filter(action_type='failed_login').count(),
            'password_resets': SystemActivity.objects.filter(action__icontains='password reset').count(),
            'locked_accounts': SystemActivity.objects.filter(action__icontains='account locked').count(),
        })


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects .all()
    serializer_class = AlertSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    http_method_names = ['get', 'post', 'patch']  # no manual delete — resolve, don't erase

    def get_queryset(self):
        modules = get_visible_modules(self.request.user)
        qs = Alert.objects.filter(status='open')
        return qs if modules is None else qs.filter(module__in=modules)


class ResolveAlertView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, alert_id):
        alert = Alert.objects.get(id=alert_id)
        alert.status = 'resolved'
        alert.resolved_by = request.user if request.user.is_authenticated else None
        alert.resolved_at = timezone.now()
        alert.save()
        return Response({'status': 'resolved'})


class ExecutiveOverviewView(APIView):
    """Powers the landing page — KPI cards + quick summary, no tables/exports."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        from employees.models import Employee
        from projects.models import Project
        from inventory.models import InventoryItem, MaterialRequest
        from django.contrib.auth import get_user_model
        from blog.models import BlogPost
        from content.models import WebsitePage
        from testimonials.models import Testimonial
        from quotations.models import Lead, Quotation

        User = get_user_model()
        today = timezone.now().date()
        employees_count = Employee.objects.count()
        contracts_expiring = Employee.objects.filter(
            contract_end_date__lte=today + timedelta(days=14),
            contract_end_date__gte=today,
        ).count()
        projects = Project.objects.exclude(status='completed')
        inventory_items = InventoryItem.objects.all()
        low_stock = inventory_items.filter(quantity__lte=F('reorder_level'))
        today_activity = SystemActivity.objects.filter(created_at__date=today).count()

        # This is the single live source used by the cards on the Admin
        # Dashboard. Keep the card labels aligned with frontend admin-data.
        dashboard_cards = {
            'Employee Management': {
                'value': employees_count,
                'subtitle': f'{contracts_expiring} contracts expiring soon',
            },
            'Customer Relations Management': {
                # CRM is operated through leads and quotations.  A customer
                # profile is optional, so it must not determine this card's
                # visible total.
                'value': Lead.objects.count() + Quotation.objects.count(),
                'subtitle': f'{Lead.objects.count()} leads · {Quotation.objects.count()} quotations',
            },
            'Project Management': {
                'value': projects.count(),
                'subtitle': f'{projects.filter(status="in_progress").count()} in progress',
            },
            'Inventory Management': {
                'value': inventory_items.count(),
                'subtitle': f'{low_stock.count()} low-stock item(s)',
            },
            'Content Management': {
                'value': WebsitePage.objects.count() + BlogPost.objects.count() + Testimonial.objects.count(),
                'subtitle': 'pages, posts and testimonials',
            },
            'User Management': {
                'value': User.objects.filter(is_active=True).count(),
                'subtitle': f'{User.objects.count()} accounts total',
            },
            'Reports & Analytics': {
                'value': SystemActivity.objects.count(),
                'subtitle': f'{today_activity} activities today',
            },
        }

        return Response({
            'kpis': {
                'employees': employees_count,
                'projects': projects.count(),
                'pending_quotations': Quotation.objects.filter(status='pending_approval').count(),
                'contracts_expiring': contracts_expiring,
                'low_stock': low_stock.count(),
                'pending_user_approvals': 0,  # account_status field not available on User model
            },
            'dashboard_cards': dashboard_cards,
            'recent_activity': SystemActivitySerializer(
                SystemActivity.objects.all()[:10], many=True
            ).data,
            'critical_alerts': AlertSerializer(
                Alert.objects.filter(status='open', priority='critical')[:5], many=True
            ).data,
        })


class AnalyticsView(APIView):
    """Single endpoint, module-selector pattern — frontend passes ?type=employees|projects|inventory|crm|content|tenders"""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        analytics_type = request.query_params.get('type', 'employees')
        handlers = {
            'employees': self._employees,
            'projects': self._projects,
            'inventory': self._inventory,
            'crm': self._crm,
            'users': self._users,
            'tenders': self._tenders,
        }
        handler = handlers.get(analytics_type)
        if not handler:
            return Response({'detail': 'Unknown analytics type'}, status=400)
        return Response(handler())

    def _employees(self):
        from employees.models import Employee
        return {
            'by_department': list(Employee.objects.values('job_title__department__name').annotate(count=Count('id'))),
            'by_job_title': list(Employee.objects.values('job_title__title').annotate(count=Count('id'))),
            'by_status': list(Employee.objects.values('status').annotate(count=Count('id'))),
            'by_employment_type': list(Employee.objects.values('employee_type').annotate(count=Count('id'))),
        }

    def _projects(self):
        from projects.models import Project
        from django.db.models import Sum, Avg, F, Q
        from datetime import date

        projects = Project.objects.filter(is_archived=False)

        return {
            'total_count': projects.count(),
            'by_status': list(projects.values('status').annotate(count=Count('id'))),
            'by_service_line': list(projects.values('service_line').annotate(count=Count('id'))),
            'total_contract_value': projects.aggregate(total=Sum('contract_value'))['total'] or 0,
            'avg_completion_percentage': projects.aggregate(avg=Avg('completion_percentage'))['avg'] or 0,
            'by_lead': list(projects.values('project_lead__user__username').annotate(count=Count('id'))),
            'overdue_count': projects.filter(
                planned_end_date__lt=date.today(),
                status__in=['not_started', 'in_progress']
            ).count(),
        }

    def _inventory(self):
        from inventory.models import InventoryItem, MaterialRequest, MaterialRequestItem
        from django.db.models import Sum, Count, F, Q
        from reports.tasks import generate_alerts

        # Keep the existing alerts/notifications in sync with the live stock
        # figure displayed on this analytics tab.
        generate_alerts()

        items = InventoryItem.objects.all()
        low_stock = items.filter(quantity__lte=F('reorder_level'))
        out_of_stock = items.filter(quantity=0)

        return {
            'total_items': items.count(),
            'low_stock_count': low_stock.count(),
            'out_of_stock_count': out_of_stock.count(),
            'total_quantity': items.aggregate(total=Sum('quantity'))['total'] or 0,
            'total_value': items.aggregate(total=Sum(F('quantity') * F('unit_cost')))['total'] or 0,
            'pending_request_count': MaterialRequest.objects.filter(status=MaterialRequest.Status.PENDING).count(),
            'approved_request_count': MaterialRequest.objects.filter(status=MaterialRequest.Status.APPROVED).count(),
            'issued_units': MaterialRequestItem.objects.aggregate(total=Sum('quantity_issued'))['total'] or 0,
            'by_category': list(items.values('category__name').annotate(count=Count('id'))),
            'low_stock_items': list(low_stock.values('name', 'quantity', 'reorder_level')[:20]),
        }

    def _crm(self):
        try:
            from crm.models import Lead, Quotation
            from django.db.models import Sum, Count, F
            from datetime import date, timedelta

            leads = Lead.objects.all()
            quotations = Quotation.objects.all()

            # Calculate lead conversion rate
            total_leads = leads.count()
            converted_leads = leads.filter(stage='won').count()
            conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0

            # Calculate quotation success rate
            total_quotes = quotations.count()
            accepted_quotes = quotations.filter(status='accepted').count()
            quote_success_rate = (accepted_quotes / total_quotes * 100) if total_quotes > 0 else 0

            # Calculate total potential revenue from leads
            potential_revenue = leads.aggregate(total=Sum('estimated_value'))['total'] or 0

            # Calculate total accepted quotation value
            accepted_value = quotations.filter(status='accepted').aggregate(total=Sum('total_amount'))['total'] or 0

            # New leads this month
            this_month = date.today().replace(day=1)
            new_leads_this_month = leads.filter(created_at__gte=this_month).count()

            return {
                'total_leads': total_leads,
                'conversion_rate': round(conversion_rate, 1),
                'total_quotations': total_quotes,
                'quote_success_rate': round(quote_success_rate, 1),
                'potential_revenue': potential_revenue,
                'accepted_value': accepted_value,
                'new_leads_this_month': new_leads_this_month,
                'lead_pipeline': list(leads.values('stage').annotate(count=Count('id'))),
                'quotation_status': list(quotations.values('status').annotate(count=Count('id'))),
            }
        except ImportError:
            return {
                'total_leads': 0,
                'conversion_rate': 0,
                'total_quotations': 0,
                'quote_success_rate': 0,
                'potential_revenue': 0,
                'accepted_value': 0,
                'new_leads_this_month': 0,
                'lead_pipeline': [],
                'quotation_status': [],
            }

    def _users(self):
        from django.contrib.auth.models import User
        from users.models import UserProfile

        profiles = UserProfile.objects.select_related('role')
        return {
            'total_users': User.objects.count(),
            'active_users': profiles.filter(account_status='active').count(),
            'staff_users': User.objects.filter(is_staff=True).count(),
            'by_account_status': list(profiles.values('account_status').annotate(count=Count('id'))),
            'by_role': list(profiles.values('role__name').annotate(count=Count('id'))),
        }

    def _tenders(self):
        # The frontend exposes a tenders tab, but this installation may not yet
        # include the Tender data model. Return a usable empty state in that case.
        try:
            from tenders.models import Tender
        except ImportError:
            return {
                'total_tenders': 0,
                'by_status': [],
                'detail': 'Tender analytics are not available until the Tender model is configured.',
            }

        tenders = Tender.objects.all()
        return {
            'total_tenders': tenders.count(),
            'by_status': list(tenders.values('status').annotate(count=Count('id'))),
        }


class SavedReportViewSet(viewsets.ModelViewSet):
    queryset = SavedReport.objects.all()
    serializer_class = SavedReportSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class ScheduledReportViewSet(viewsets.ModelViewSet):
    queryset = ScheduledReport.objects.all()
    serializer_class = ScheduledReportSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class GenerateReportView(APIView):
    """Ad-hoc report: choose module + fields + filters → return rows."""
    permission_classes = [AllowAny]
    authentication_classes = []

    MODULE_MODEL_MAP = {
        'employees': ('employees', 'Employee'),
        'projects': ('projects', 'Project'),
        'inventory': ('inventory', 'InventoryItem'),
    }
    MODULE_FIELDS = {
        'employees': {
            'full_name', 'department__name', 'job_title__title', 'status',
            'employee_type', 'gross_monthly_salary', 'contract_start_date',
            'contract_end_date',
        },
        'projects': {
            'name', 'status', 'service_line', 'project_lead__user__username',
            'contract_value', 'completion_percentage', 'planned_start_date',
            'planned_end_date',
        },
        'inventory': {
            'name', 'item_code', 'category__name', 'quantity', 'unit_cost',
            'reorder_level', 'unit', 'is_active',
        },
    }

    def post(self, request):
        from django.apps import apps
        from django.db import models
        module = request.data.get('module')
        fields = request.data.get('fields', [])
        filters = request.data.get('filters', {})

        if module not in self.MODULE_MODEL_MAP:
            return Response({'detail': 'Unsupported module'}, status=400)

        allowed_fields = self.MODULE_FIELDS[module]
        invalid_fields = set(fields) - allowed_fields
        if not fields:
            return Response({'detail': 'Select at least one field'}, status=400)
        if invalid_fields:
            return Response(
                {'detail': f'Unsupported fields: {", ".join(sorted(invalid_fields))}'},
                status=400,
            )

        filters = {key: value for key, value in filters.items() if key in allowed_fields and value not in ('', None)}

        app_name, model_name = self.MODULE_MODEL_MAP[module]
        Model = apps.get_model(app_name, model_name)
        qs = Model.objects.filter(**filters).values(*fields)
        return Response(list(qs[:1000]))  # cap rows returned per request


class InsightsView(APIView):
    """Reads pre-computed MetricSnapshot rows — never live-computes trend percentages."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)

        snapshots = MetricSnapshot.objects.filter(snapshot_date__gte=last_30)
        by_key = {}
        for s in snapshots:
            by_key.setdefault(s.metric_key, []).append({'date': s.snapshot_date, 'value': float(s.value)})

        return Response({'metrics': by_key})
