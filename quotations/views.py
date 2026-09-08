from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.files.base import ContentFile
from django.http import HttpResponse, FileResponse
from django.db.models import Q, Max
from django.utils import timezone
from .models import Customer, Lead, LeadAttachment, LeadActivity, Task, Notification, SiteVisit, QuotationTemplate, QuotationTemplateItem, Quotation, QuotationItem, LeadService, QuotationService
from .serializers import (
    CustomerSerializer, LeadActivitySerializer, TaskSerializer, NotificationSerializer, LeadSerializer, LeadAttachmentSerializer,
    SiteVisitSerializer, PublicLeadSerializer,
    QuotationTemplateSerializer, QuotationTemplateItemSerializer,
    QuotationSerializer, QuotationItemSerializer
)
import uuid
import json
import datetime


def log_system_activity(module, action, description, performed_by, reference_id=None, reference_type=None, old_value=None, new_value=None, department=None):
    """Helper function to log to centralized SystemActivity"""
    from reports.models import SystemActivity

    performed_by_name = performed_by.get_full_name() if performed_by else 'System'

    SystemActivity.objects.create(
        module=module,
        action=action,
        description=description,
        performed_by=performed_by,
        performed_by_name=performed_by_name,
        department=department or (getattr(performed_by, 'department', '') if performed_by else ''),
        reference_id=reference_id or '',
        reference_type=reference_type or '',
        old_value=old_value or {},
        new_value=new_value or {},
    )


def create_notification(recipient, notification_type, title, message, lead_id=None, quotation_id=None, project_id=None, metadata=None):
    """Helper function to create notifications"""
    from notifications.models import Notification

    Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        lead_id=lead_id,
        quotation_id=quotation_id,
        project_id=project_id,
        metadata=metadata or {}
    )


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def get_queryset(self):
        queryset = Customer.objects.all()
        email = self.request.query_params.get('email')
        customer_number = self.request.query_params.get('customer_number')

        if email:
            queryset = queryset.filter(email=email)
        if customer_number:
            queryset = queryset.filter(customer_number=customer_number)

        return queryset

    def perform_create(self, serializer):
        # Generate customer number if not provided
        customer_number = serializer.validated_data.get('customer_number')
        if not customer_number:
            year = timezone.now().year
            count = Customer.objects.filter(customer_number__startswith=f'CST-{year}').count()
            customer_number = f'CST-{year}-{str(count + 1).zfill(6)}'
            serializer.validated_data['customer_number'] = customer_number
        serializer.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create',
            description=f'Customer created: {customer_number} - {serializer.validated_data.get("name")}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(serializer.instance.id),
            reference_type='Customer',
            new_value={'customer_number': customer_number, 'name': serializer.validated_data.get('name'), 'email': serializer.validated_data.get('email')},
        )

    @action(detail=True, methods=['post'])
    def activate_portal(self, request, pk=None):
        """Activate customer portal access"""
        customer = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            User = get_user_model()
            user = User.objects.get(id=user_id)
            customer.portal_user = user
            customer.is_portal_active = True
            customer.save()

            return Response({'status': 'activated', 'portal_user': user.username})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def deactivate_portal(self, request, pk=None):
        """Deactivate customer portal access"""
        customer = self.get_object()
        customer.is_portal_active = False
        customer.save()

        return Response({'status': 'deactivated'})


class LeadActivityViewSet(viewsets.ModelViewSet):
    queryset = LeadActivity.objects.all()
    serializer_class = LeadActivitySerializer

    def get_queryset(self):
        queryset = LeadActivity.objects.all()
        lead = self.request.query_params.get('lead')
        activity_type = self.request.query_params.get('activity_type')

        if lead:
            queryset = queryset.filter(lead_id=lead)
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create',
            description=f'Activity logged: {serializer.validated_data.get("activity_type")}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(serializer.instance.lead.id),
            reference_type='Lead',
            new_value={'activity_type': serializer.validated_data.get('activity_type'), 'description': serializer.validated_data.get('description')},
        )


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all()
        assigned_to = self.request.query_params.get('assigned_to')
        status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        lead = self.request.query_params.get('lead')
        quotation = self.request.query_params.get('quotation')
        project = self.request.query_params.get('project')

        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        if status:
            queryset = queryset.filter(status=status)
        if priority:
            queryset = queryset.filter(priority=priority)
        if lead:
            queryset = queryset.filter(lead_id=lead)
        if quotation:
            queryset = queryset.filter(quotation_id=quotation)
        if project:
            queryset = queryset.filter(project_id=project)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create',
            description=f'Task created: {serializer.validated_data.get("title")}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(serializer.instance.id),
            reference_type='Task',
            new_value={'task_number': serializer.instance.task_number, 'title': serializer.validated_data.get('title'), 'priority': serializer.validated_data.get('priority')},
        )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark task as completed"""
        task = self.get_object()
        task.status = 'completed'
        task.completed_date = timezone.now()
        task.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='complete',
            description=f'Task completed: {task.task_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(task.id),
            reference_type='Task',
            old_value={'status': 'pending'},
            new_value={'status': 'completed'},
        )

        return Response({'status': 'completed'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel task"""
        task = self.get_object()
        task.status = 'cancelled'
        task.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='cancel',
            description=f'Task cancelled: {task.task_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(task.id),
            reference_type='Task',
            old_value={'status': task.status},
            new_value={'status': 'cancelled'},
        )

        return Response({'status': 'cancelled'})


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.all()
        recipient = self.request.query_params.get('recipient')
        is_read = self.request.query_params.get('is_read')
        notification_type = self.request.query_params.get('notification_type')

        if recipient:
            queryset = queryset.filter(recipient_id=recipient)
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        return queryset

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'status': 'read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications for current user as read"""
        if request.user.is_authenticated:
            notifications = Notification.objects.filter(recipient=request.user, is_read=False)
            for notification in notifications:
                notification.mark_as_read()
            return Response({'status': 'all_read', 'count': notifications.count()})
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count for current user"""
        if request.user.is_authenticated:
            count = Notification.objects.filter(recipient=request.user, is_read=False).count()
            return Response({'unread_count': count})
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer

    def get_queryset(self):
        queryset = Lead.objects.all()
        status_filter = self.request.query_params.get('status')
        service_filter = self.request.query_params.get('service')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if service_filter:
            # Filter by service using LeadService relationship
            queryset = queryset.filter(lead_services__service=service_filter).distinct()

        return queryset

    def perform_create(self, serializer):
        # Generate lead number if not provided
        lead_number = serializer.validated_data.get('lead_number')
        if not lead_number:
            year = timezone.now().year
            count = Lead.objects.filter(lead_number__startswith=f'LD-{year}').count()
            lead_number = f'LD-{year}-{str(count + 1).zfill(6)}'
            serializer.validated_data['lead_number'] = lead_number
        lead = serializer.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create',
            description=f'Lead created: {lead.lead_number} - {lead.customer_name}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(lead.id),
            reference_type='Lead',
            new_value={'lead_number': lead.lead_number, 'customer_name': lead.customer_name, 'service': lead.service},
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        lead = self.get_object()
        old_status = lead.status
        new_status = request.data.get('status')
        lead.status = new_status
        lead.save()

        # Create activity
        LeadActivity.objects.create(
            lead=lead,
            activity='status_change',
            description=f'Status changed to {new_status}',
            user=request.user
        )

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='status_change',
            description=f'Lead status changed: {lead.lead_number} from {old_status} to {new_status}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(lead.id),
            reference_type='Lead',
            old_value={'status': old_status},
            new_value={'status': new_status},
        )

        return Response({'status': 'updated'})

    @action(detail=True, methods=['post'])
    def qualify(self, request, pk=None):
        """Qualify lead with priority, customer type, and requirement status"""
        lead = self.get_object()

        lead.priority = request.data.get('priority', lead.priority)
        lead.customer_type = request.data.get('customer_type', lead.customer_type)
        lead.requirement_status = request.data.get('requirement_status', lead.requirement_status)
        lead.qualification_notes = request.data.get('qualification_notes', lead.qualification_notes)

        lead.save()

        # Create activity
        LeadActivity.objects.create(
            lead=lead,
            activity='note',
            description=f'Lead qualified: Priority={lead.get_priority_display()}, Type={lead.get_customer_type_display()}',
            user=request.user
        )

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='qualify',
            description=f'Lead qualified: {lead.lead_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(lead.id),
            reference_type='Lead',
            new_value={'priority': lead.priority, 'customer_type': lead.customer_type, 'requirement_status': lead.requirement_status},
        )

        return Response({'status': 'qualified', 'lead': LeadSerializer(lead).data})

    @action(detail=True, methods=['post'])
    def ready_for_quotation(self, request, pk=None):
        """Mark lead as ready for quotation"""
        lead = self.get_object()

        # Validate lead is ready
        if lead.requirement_status != 'requirements_confirmed':
            return Response(
                {'error': 'Requirements must be confirmed before marking as ready for quotation'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not lead.lead_services.exists():
            return Response(
                {'error': 'Lead must have at least one service before marking as ready for quotation'},
                status=status.HTTP_400_BAD_REQUEST
            )

        lead.status = 'ready_for_quotation'
        lead.save()

        # Create activity
        LeadActivity.objects.create(
            lead=lead,
            activity='status_change',
            description='Lead marked as ready for quotation',
            user=request.user
        )

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='ready_for_quotation',
            description=f'Lead ready for quotation: {lead.lead_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(lead.id),
            reference_type='Lead',
            old_value={'status': 'qualification'},
            new_value={'status': 'ready_for_quotation'},
        )

        return Response({'status': 'ready_for_quotation', 'lead': LeadSerializer(lead).data})

    @action(detail=True, methods=['get', 'post', 'delete'])
    def services(self, request, pk=None):
        """Manage lead services"""
        lead = self.get_object()

        if request.method == 'GET':
            services = lead.lead_services.all()
            from .serializers import LeadServiceSerializer
            serializer = LeadServiceSerializer(services, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            service_id = request.data.get('service')
            service_requirements = request.data.get('service_requirements', {})
            notes = request.data.get('notes', '')

            if not service_id:
                return Response({'error': 'service is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Get current max sort order
            max_sort = lead.lead_services.aggregate(Max('sort_order'))['sort_order__max'] or 0

            lead_service = LeadService.objects.create(
                lead=lead,
                service=service_id,
                service_requirements=service_requirements,
                notes=notes,
                sort_order=max_sort + 1
            )

            # Create activity
            LeadActivity.objects.create(
                lead=lead,
                activity='note',
                description=f'Service added: {lead_service.get_service_display()}',
                user=request.user
            )

            from .serializers import LeadServiceSerializer
            serializer = LeadServiceSerializer(lead_service)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        elif request.method == 'DELETE':
            service_id = request.data.get('service_id')
            if not service_id:
                return Response({'error': 'service_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                lead_service = lead.lead_services.get(id=service_id)
                service_name = lead_service.get_service_display()
                lead_service.delete()

                # Create activity
                LeadActivity.objects.create(
                    lead=lead,
                    activity='note',
                    description=f'Service removed: {service_name}',
                    user=request.user
                )

                return Response({'status': 'deleted'})
            except LeadService.DoesNotExist:
                return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def create_quotation(self, request, pk=None):
        """Create quotation from lead using service-specific template"""
        lead = self.get_object()
        template_id = request.data.get('template_id')
        customizations = request.data.get('customizations', {})

        # Find template for lead's service if not specified
        if not template_id:
            from .models import QuotationTemplate
            template = QuotationTemplate.objects.filter(service=lead.service).first()
            if not template:
                return Response(
                    {'error': 'No template found for this service. Please specify a template_id.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            template_id = template.id

        try:
            from .models import QuotationTemplate, QuotationTemplateItem, Quotation, QuotationItem
            template = QuotationTemplate.objects.get(id=template_id)
        except QuotationTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        # Generate quotation number
        year = timezone.now().year
        count = Quotation.objects.filter(quotation_number__startswith=f'QTN-{year}').count()
        quotation_number = f'QTN-{year}-{str(count + 1).zfill(6)}'

        # Create quotation from lead and template
        quotation = Quotation.objects.create(
            quotation_number=quotation_number,
            lead=lead,
            template=template,
            header=template.header,
            terms=template.terms,
            footer=template.footer,
            validity_days=template.validity_days,
            payment_terms=template.payment_terms,
            status='draft',
            created_by=request.user if request.user.is_authenticated else None,
        )

        # Create quotation items from template items
        template_items = template.items.all()
        for template_item in template_items:
            # Apply customizations if provided
            quantity = customizations.get(str(template_item.id), {}).get('quantity', template_item.default_quantity)
            rate = customizations.get(str(template_item.id), {}).get('rate', template_item.default_rate)

            QuotationItem.objects.create(
                quotation=quotation,
                item_code=template_item.item_code,
                description=template_item.description,
                category=template_item.category,
                unit=template_item.unit,
                quantity=quantity,
                rate=rate,
                vat_percentage=template_item.vat_percentage,
                discount_percentage=template_item.discount_percentage,
                is_optional=template_item.is_optional,
                notes=template_item.notes,
            )

        # Calculate totals
        quotation.calculate_totals()

        # Update lead status
        lead.status = 'quotation'
        lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create_quotation_from_lead',
            description=f'Quotation created from lead: {quotation.quotation_number} from {lead.lead_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            new_value={'quotation_number': quotation.quotation_number, 'lead': lead.lead_number, 'template': template.name},
        )

        serializer = QuotationSerializer(quotation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LeadAttachmentViewSet(viewsets.ModelViewSet):
    queryset = LeadAttachment.objects.all()
    serializer_class = LeadAttachmentSerializer

    def get_queryset(self):
        queryset = LeadAttachment.objects.all()
        lead_id = self.request.query_params.get('lead')
        if lead_id:
            queryset = queryset.filter(lead_id=lead_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class LeadActivityViewSet(viewsets.ModelViewSet):
    queryset = LeadActivity.objects.all()
    serializer_class = LeadActivitySerializer

    def get_queryset(self):
        queryset = LeadActivity.objects.all()
        lead_id = self.request.query_params.get('lead')
        if lead_id:
            queryset = queryset.filter(lead_id=lead_id)
        return queryset

    def perform_create(self, serializer):
        # Only assign user if authenticated, otherwise set to None
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


class SiteVisitViewSet(viewsets.ModelViewSet):
    queryset = SiteVisit.objects.all()
    serializer_class = SiteVisitSerializer

    def get_queryset(self):
        queryset = SiteVisit.objects.all()
        lead_id = self.request.query_params.get('lead')
        if lead_id:
            queryset = queryset.filter(lead_id=lead_id)
        return queryset

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        site_visit = self.get_object()
        site_visit.status = 'completed'
        site_visit.completed_date = timezone.now().date()
        site_visit.save()

        # Update lead status
        lead = site_visit.lead
        lead.status = 'estimating'
        lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='complete',
            description=f'Site visit completed: {site_visit.lead.lead_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(site_visit.id),
            reference_type='SiteVisit',
            old_value={'status': 'scheduled'},
            new_value={'status': 'completed'},
        )

        return Response({'status': 'completed'})

    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        """Generate site visit report"""
        site_visit = self.get_object()

        report_data = {
            'lead_number': site_visit.lead.lead_number,
            'customer_name': site_visit.lead.customer_name,
            'scheduled_date': site_visit.scheduled_date,
            'completed_date': site_visit.completed_date,
            'engineer': site_visit.engineer.username if site_visit.engineer else None,

            # GPS Location
            'gps_location': {
                'latitude': float(site_visit.latitude) if site_visit.latitude else None,
                'longitude': float(site_visit.longitude) if site_visit.longitude else None,
                'accuracy': site_visit.gps_accuracy,
            },

            # Site Details
            'ground_conditions': site_visit.ground_conditions,
            'water_source': site_visit.water_source,
            'depth_estimate': site_visit.depth_estimate,
            'recommendations': site_visit.recommendations,

            # Measurements
            'measurements': {
                'site_area_size': site_visit.site_area_size,
                'elevation': site_visit.elevation,
                'distance_to_road': site_visit.distance_to_road,
                'accessibility_notes': site_visit.accessibility_notes,
            },

            # Photos
            'photos': {
                'photo_1': site_visit.photo_1.url if site_visit.photo_1 else None,
                'photo_2': site_visit.photo_2.url if site_visit.photo_2 else None,
                'photo_3': site_visit.photo_3.url if site_visit.photo_3 else None,
                'photo_4': site_visit.photo_4.url if site_visit.photo_4 else None,
                'photo_5': site_visit.photo_5.url if site_visit.photo_5 else None,
            },

            # Additional observations
            'observations': {
                'weather_conditions': site_visit.weather_conditions,
                'soil_type': site_visit.soil_type,
                'vegetation': site_visit.vegetation,
                'nearby_structures': site_visit.nearby_structures,
                'utilities_present': site_visit.utilities_present,
            },

            'status': site_visit.status,
            'created_at': site_visit.created_at,
            'updated_at': site_visit.updated_at,
        }

        return Response(report_data)


class PublicLeadViewSet(viewsets.ModelViewSet):
    """Public API for lead submission from website"""
    queryset = Lead.objects.all()
    serializer_class = PublicLeadSerializer

    def get_queryset(self):
        """Allow filtering by lead_number for tracking"""
        queryset = Lead.objects.all()
        lead_number = self.request.query_params.get('lead_number')
        if lead_number:
            queryset = queryset.filter(lead_number=lead_number)
        return queryset

    def perform_create(self, serializer):
        # Generate lead number
        year = timezone.now().year
        count = Lead.objects.filter(lead_number__startswith=f'LD-{year}').count()
        lead_number = f'LD-{year}-{str(count + 1).zfill(6)}'

        lead = serializer.save(
            lead_number=lead_number,
            source='website',
            status='new'
        )

        # Handle multi-service submission
        services_data = self.request.data.get('services')
        if services_data:
            try:
                services_list = json.loads(services_data) if isinstance(services_data, str) else services_data
                for index, service_id in enumerate(services_list):
                    LeadService.objects.create(
                        lead=lead,
                        service=service_id,
                        sort_order=index
                    )
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing services data: {e}")

        # Store service-specific answers in LeadDetail
        service_specific_answers = serializer.validated_data.get('service_specific_answers', {})
        if service_specific_answers:
            from .models import LeadDetail
            for key, answer in service_specific_answers.items():
                # Get question text from the service questions mapping
                question_text = self.get_question_text(lead.service, key)
                LeadDetail.objects.create(
                    lead=lead,
                    question_key=key,
                    question_text=question_text,
                    answer=answer
                )

        # Create initial activity
        LeadActivity.objects.create(
            lead=lead,
            activity='note',
            description='Lead submitted via website',
            user=None
        )

        # Send confirmation notifications
        try:
            from notifications.utils import send_lead_confirmation_email, send_lead_confirmation_whatsapp
            send_lead_confirmation_email(lead)
            send_lead_confirmation_whatsapp(lead)
        except Exception as e:
            print(f"Error sending lead notifications: {e}")

        return lead

    def get_question_text(self, service, key):
        """Get the question text for a service-specific question"""
        from .models import SERVICE_QUESTIONS
        if service in SERVICE_QUESTIONS:
            for question in SERVICE_QUESTIONS[service]:
                if question['key'] == key:
                    return question['question']
        return key


class QuotationTemplateViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplate.objects.all()
    serializer_class = QuotationTemplateSerializer

    def get_queryset(self):
        queryset = QuotationTemplate.objects.all()
        service = self.request.query_params.get('service')
        if service:
            queryset = queryset.filter(service=service)
        return queryset


class QuotationTemplateItemViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplateItem.objects.all()
    serializer_class = QuotationTemplateItemSerializer

    def get_queryset(self):
        queryset = QuotationTemplateItem.objects.all()
        template = self.request.query_params.get('template')
        if template:
            queryset = queryset.filter(template_id=template)
        return queryset


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

    def get_queryset(self):
        queryset = Quotation.objects.all()
        lead = self.request.query_params.get('lead')
        status = self.request.query_params.get('status')
        if lead:
            queryset = queryset.filter(lead_id=lead)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        # Generate quotation number
        year = timezone.now().year
        count = Quotation.objects.filter(quotation_number__startswith=f'QTN-{year}').count()
        quotation_number = f'QTN-{year}-{str(count + 1).zfill(6)}'

        quotation = serializer.save(quotation_number=quotation_number)

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create',
            description=f'Quotation created: {quotation.quotation_number}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            new_value={'quotation_number': quotation.quotation_number, 'lead': quotation.lead.lead_number if quotation.lead else ''},
        )

    @action(detail=False, methods=['post'])
    def create_from_template(self, request):
        """Create quotation from template"""
        from .models import QuotationTemplate, QuotationTemplateItem

        lead_id = request.data.get('lead_id')
        template_id = request.data.get('template_id')
        customizations = request.data.get('customizations', {})

        if not lead_id or not template_id:
            return Response({'error': 'lead_id and template_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lead = Lead.objects.get(id=lead_id)
            template = QuotationTemplate.objects.get(id=template_id)
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
        except QuotationTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        # Generate quotation number
        year = timezone.now().year
        count = Quotation.objects.filter(quotation_number__startswith=f'QTN-{year}').count()
        quotation_number = f'QTN-{year}-{str(count + 1).zfill(6)}'

        # Create quotation from template
        quotation = Quotation.objects.create(
            quotation_number=quotation_number,
            lead=lead,
            template=template,
            header=template.header,
            terms=template.terms,
            footer=template.footer,
            validity_days=template.validity_days,
            payment_terms=template.payment_terms,
            status='draft',
            created_by=request.user if request.user.is_authenticated else None,
        )

        # Create quotation items from template items
        template_items = template.items.all()
        for template_item in template_items:
            # Apply customizations if provided
            quantity = customizations.get(str(template_item.id), {}).get('quantity', template_item.default_quantity)
            rate = customizations.get(str(template_item.id), {}).get('rate', template_item.default_rate)

            QuotationItem.objects.create(
                quotation=quotation,
                item_code=template_item.item_code,
                description=template_item.description,
                category=template_item.category,
                unit=template_item.unit,
                quantity=quantity,
                rate=rate,
                vat_percentage=template_item.vat_percentage,
                discount_percentage=template_item.discount_percentage,
                is_optional=template_item.is_optional,
                notes=template_item.notes,
            )

        # Calculate totals
        quotation.calculate_totals()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create_from_template',
            description=f'Quotation created from template: {quotation.quotation_number} from {template.name}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            new_value={'quotation_number': quotation.quotation_number, 'template': template.name},
        )

        serializer = QuotationSerializer(quotation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def calculate_totals(self, request, pk=None):
        """Recalculate quotation totals from items"""
        quotation = self.get_object()
        items = quotation.items.all()

        subtotal = sum(item.line_total for item in items)

        # Only include VAT if include_vat is True
        if quotation.include_vat:
            vat_total = sum(item.vat_amount for item in items)
        else:
            vat_total = 0

        discount_total = sum(item.discount_amount for item in items)
        grand_total = subtotal + vat_total - discount_total

        quotation.subtotal = subtotal
        quotation.vat_total = vat_total
        quotation.discount_total = discount_total
        quotation.grand_total = grand_total
        quotation.save()

        return Response({
            'subtotal': subtotal,
            'vat_total': vat_total,
            'discount_total': discount_total,
            'grand_total': grand_total
        })

    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit quotation for approval"""
        quotation = self.get_object()

        # Snapshot customer data for historical accuracy
        if quotation.lead:
            quotation.customer_name_snapshot = quotation.lead.customer_name
            quotation.company_snapshot = quotation.lead.company
            quotation.email_snapshot = quotation.lead.email
            quotation.phone_snapshot = quotation.lead.phone
            quotation.address_snapshot = f"{quotation.lead.district}, {quotation.lead.subcounty}, {quotation.lead.village}"

        quotation.status = 'pending_approval'
        quotation.submitted_by = request.user
        quotation.submitted_at = timezone.now()
        quotation.save()

        # Update lead status
        if quotation.lead:
            quotation.lead.status = 'quotation_draft'
            quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='submit_for_approval',
            description=f'Quotation submitted for approval: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'draft'},
            new_value={'status': 'pending_approval'},
        )

        return Response({'status': 'pending_approval'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve quotation"""
        quotation = self.get_object()
        notes = request.data.get('notes', '')

        quotation.status = 'approved'
        quotation.approved_by = request.user
        quotation.approved_at = timezone.now()
        quotation.approval_notes = notes
        quotation.save()

        # Update lead status
        if quotation.lead:
            quotation.lead.status = 'quotation_sent'
            quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='approve',
            description=f'Quotation approved: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'pending_approval'},
            new_value={'status': 'approved'},
        )

        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def request_revision(self, request, pk=None):
        """Request revision for quotation"""
        quotation = self.get_object()
        notes = request.data.get('notes', '')

        if not notes:
            return Response({'error': 'notes are required for revision request'}, status=status.HTTP_400_BAD_REQUEST)

        quotation.status = 'revision_required'
        quotation.approval_notes = notes
        quotation.save()

        # Update lead status
        if quotation.lead:
            quotation.lead.status = 'quotation_draft'
            quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='request_revision',
            description=f'Quotation revision requested: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'pending_approval'},
            new_value={'status': 'revision_required'},
        )

        return Response({'status': 'revision_required'})

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Send quotation to customer"""
        quotation = self.get_object()

        if quotation.status != 'approved':
            return Response(
                {'error': 'Quotation must be approved before sending'},
                status=status.HTTP_400_BAD_REQUEST
            )

        quotation.status = 'sent'
        quotation.sent_at = timezone.now()
        quotation.save()

        # Update lead status
        if quotation.lead:
            quotation.lead.status = 'quotation_sent'
            quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='send',
            description=f'Quotation sent to customer: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'approved'},
            new_value={'status': 'sent'},
        )

        return Response({'status': 'sent'})

    @action(detail=True, methods=['post'])
    def mark_viewed(self, request, pk=None):
        """Mark quotation as viewed by customer"""
        quotation = self.get_object()

        quotation.status = 'viewed'
        quotation.viewed_at = timezone.now()
        quotation.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='mark_viewed',
            description=f'Quotation viewed by customer: {quotation.quotation_number}',
            performed_by=None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'sent'},
            new_value={'status': 'viewed'},
        )

        return Response({'status': 'viewed'})

    @action(detail=True, methods=['post'])
    def customer_accept(self, request, pk=None):
        """Customer accepts quotation"""
        quotation = self.get_object()
        notes = request.data.get('notes', '')

        quotation.status = 'accepted'
        quotation.customer_response = notes
        quotation.customer_response_at = timezone.now()
        quotation.save()

        # Update lead status
        if quotation.lead:
            quotation.lead.status = 'won'
            quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='customer_accept',
            description=f'Quotation accepted by customer: {quotation.quotation_number}',
            performed_by=None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'viewed'},
            new_value={'status': 'accepted'},
        )

        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def customer_reject(self, request, pk=None):
        """Customer rejects quotation"""
        quotation = self.get_object()
        notes = request.data.get('notes', '')

        if not notes:
            return Response({'error': 'notes are required for rejection'}, status=status.HTTP_400_BAD_REQUEST)

        quotation.status = 'rejected'
        quotation.customer_response = notes
        quotation.customer_response_at = timezone.now()
        quotation.save()

        # Update lead status
        if quotation.lead:
            quotation.lead.status = 'lost'
            quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='customer_reject',
            description=f'Quotation rejected by customer: {quotation.quotation_number}',
            performed_by=None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'viewed'},
            new_value={'status': 'rejected'},
        )

        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def customer_request_revision(self, request, pk=None):
        """Customer requests revision"""
        quotation = self.get_object()
        notes = request.data.get('notes', '')

        if not notes:
            return Response({'error': 'notes are required for revision request'}, status=status.HTTP_400_BAD_REQUEST)

        quotation.status = 'revision_requested'
        quotation.customer_response = notes
        quotation.customer_response_at = timezone.now()
        quotation.save()

        # Update lead status
        if quotation.lead:
            quotation.lead.status = 'negotiation'
            quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='customer_request_revision',
            description=f'Quotation revision requested by customer: {quotation.quotation_number}',
            performed_by=None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'viewed'},
            new_value={'status': 'revision_requested'},
        )

        return Response({'status': 'revision_requested'})

    @action(detail=True, methods=['post'])
    def create_revision(self, request, pk=None):
        """Create a new revision of this quotation"""
        quotation = self.get_object()

        # Increment version
        new_version = quotation.version + 1

        # Generate new quotation number
        year = timezone.now().year
        count = Quotation.objects.filter(quotation_number__startswith=f'QTN-{year}').count()
        new_quotation_number = f'QTN-{year}-{str(count + 1).zfill(6)}'

        # Copy quotation
        new_quotation = Quotation.objects.create(
            quotation_number=new_quotation_number,
            lead=quotation.lead,
            template=quotation.template,
            parent_quotation=quotation,
            version=new_version,
            status='draft',
            header=quotation.header,
            terms=quotation.terms,
            footer=quotation.footer,
            payment_terms=quotation.payment_terms,
            customer_name_snapshot=quotation.customer_name_snapshot,
            company_snapshot=quotation.company_snapshot,
            email_snapshot=quotation.email_snapshot,
            phone_snapshot=quotation.phone_snapshot,
            address_snapshot=quotation.address_snapshot,
            created_by=request.user if request.user.is_authenticated else None,
        )

        # Copy quotation services
        for qs in quotation.quotation_services.all():
            new_qs = QuotationService.objects.create(
                quotation=new_quotation,
                service=qs.service,
                service_name_snapshot=qs.service_name_snapshot,
                service_requirements=qs.service_requirements,
                notes=qs.notes,
                sort_order=qs.sort_order,
            )

            # Copy items for this service
            for item in qs.items.all():
                QuotationItem.objects.create(
                    quotation=new_quotation,
                    quotation_service=new_qs,
                    inventory_item=item.inventory_item,
                    item_code=item.item_code,
                    description=item.description,
                    unit=item.unit,
                    quantity=item.quantity,
                    rate=item.rate,
                    vat_percentage=item.vat_percentage,
                    discount_percentage=item.discount_percentage,
                    is_optional=item.is_optional,
                    sort_order=item.sort_order,
                )

        # Calculate totals
        new_quotation.calculate_totals()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create_revision',
            description=f'Quotation revision created: {new_quotation.quotation_number} from {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(new_quotation.id),
            reference_type='Quotation',
            new_value={'quotation_number': new_quotation.quotation_number, 'parent': quotation.quotation_number, 'version': new_version},
        )

        serializer = QuotationSerializer(new_quotation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post', 'delete'])
    def services(self, request, pk=None):
        """Manage quotation services"""
        quotation = self.get_object()

        if request.method == 'GET':
            services = quotation.quotation_services.all()
            from .serializers import QuotationServiceSerializer
            serializer = QuotationServiceSerializer(services, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            service_id = request.data.get('service')
            service_requirements = request.data.get('service_requirements', {})
            notes = request.data.get('notes', '')

            if not service_id:
                return Response({'error': 'service is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Get current max sort order
            max_sort = quotation.quotation_services.aggregate(Max('sort_order'))['sort_order__max'] or 0

            quotation_service = QuotationService.objects.create(
                quotation=quotation,
                service=service_id,
                service_requirements=service_requirements,
                notes=notes,
                sort_order=max_sort + 1
            )

            from .serializers import QuotationServiceSerializer
            serializer = QuotationServiceSerializer(quotation_service)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        elif request.method == 'DELETE':
            service_id = request.data.get('service_id')
            if not service_id:
                return Response({'error': 'service_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                quotation_service = quotation.quotation_services.get(id=service_id)
                quotation_service.delete()
                return Response({'status': 'deleted'})
            except QuotationService.DoesNotExist:
                return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def manager_review(self, request, pk=None):
        """Manager review of quotation"""
        quotation = self.get_object()
        notes = request.data.get('notes', '')

        quotation.status = 'review'
        quotation.manager_review_by = request.user
        quotation.manager_review_at = timezone.now()
        quotation.manager_review_notes = notes
        quotation.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='manager_review',
            description=f'Quotation manager review: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'submitted'},
            new_value={'status': 'review', 'notes': notes},
        )

        return Response({'status': 'review', 'notes': notes})

    @action(detail=True, methods=['post'], url_path='generate-pdf')
    def generate_pdf(self, request, pk=None):
        """Generate and attach PDF to quotation"""
        from .services.quotation_pdf import generate_quotation_pdf
        from django.core.files.base import ContentFile

        quotation = self.get_object()
        quotation.calculate_totals()
        
        # Generate PDF using the professional generator
        pdf_buffer = generate_quotation_pdf(quotation)
        pdf_bytes = pdf_buffer.read()
        
        # Save PDF to quotation
        filename = f"{quotation.quotation_number}.pdf"
        quotation.generated_pdf.save(filename, ContentFile(pdf_bytes), save=True)
        quotation.pdf_generated_at = timezone.now()
        quotation.save(update_fields=["generated_pdf", "pdf_generated_at"])
        
        return Response({'pdf_url': quotation.generated_pdf.url})

    @action(detail=True, methods=['get'], url_path='pdf')
    def pdf(self, request, pk=None):
        """Get quotation PDF"""
        from .services.quotation_pdf import generate_quotation_pdf

        quotation = self.get_object()

        # Generate PDF using the same generator as preview
        pdf_buffer = generate_quotation_pdf(quotation)
        pdf_bytes = pdf_buffer.read()

        return FileResponse(
            ContentFile(pdf_bytes),
            as_attachment=True,
            filename=f"{quotation.quotation_number}.pdf",
            content_type='application/pdf',
        )

    @action(detail=False, methods=['post'], url_path='generate-preview-pdf', permission_classes=[])
    def generate_preview_pdf(self, request):
        """Generate PDF or DOCX from lead data and items for preview/download"""
        print("DEBUG: generate_preview_pdf called")
        print(f"DEBUG: request.data: {request.data}")
        try:
            from .services.quotation_pdf import generate_quotation_pdf
            from .models import Lead, QuotationService, QuotationItem
            from decimal import Decimal
            import datetime

            lead_id = request.data.get('lead_id')
            quotation_id = request.data.get('quotation_id')
            items = request.data.get('items', [])
            manual_data = request.data.get('manual_data')
            include_vat = request.data.get('include_vat', True)
            format = request.data.get('format', 'pdf')  # 'pdf' or 'docx'

            print(f"DEBUG: lead_id={lead_id}, quotation_id={quotation_id}, items_count={len(items)}, manual_data={manual_data}, include_vat={include_vat}, format={format}")

            # Handle manual quotations (no lead)
            if manual_data and (lead_id == 'manual' or lead_id is None):
                print("DEBUG: Using manual data for quotation")
                # Create a temporary quotation for document generation using manual data
                import uuid
                quotation = self.queryset.create(
                    quotation_number=f"PREVIEW-{uuid.uuid4().hex[:8].upper()}",
                    lead=None,
                    customer_name_snapshot=manual_data.get('customer_name', 'N/A'),
                    company_snapshot=manual_data.get('company', ''),
                    email_snapshot=manual_data.get('email', ''),
                    phone_snapshot=manual_data.get('phone', ''),
                    address_snapshot=manual_data.get('address', ''),
                    valid_until=datetime.date.today() + datetime.timedelta(days=30),
                    discount_total=Decimal('0.00'),
                    status='draft',
                    include_vat=include_vat,
                )
                print(f"DEBUG: Created manual quotation: {quotation.quotation_number}, include_vat: {include_vat}")
            elif quotation_id:
                # Use existing quotation
                print(f"DEBUG: Using existing quotation: {quotation_id}")
                quotation = self.queryset.get(id=quotation_id)
                # Use include_vat from request if provided, otherwise use quotation's value
                if include_vat is not None:
                    print(f"DEBUG: Using include_vat from request: {include_vat}")
                else:
                    include_vat = quotation.include_vat
                    print(f"DEBUG: Using include_vat from quotation: {include_vat}")
                original_include_vat = None
            elif lead_id:
                # Original lead-based flow
                if not lead_id:
                    print("DEBUG: Missing lead_id")
                    return Response({'error': 'lead_id is required'}, status=status.HTTP_400_BAD_REQUEST)

                print(f"DEBUG: Fetching lead with id={lead_id}")
                lead = Lead.objects.get(id=lead_id)
                print(f"DEBUG: Found lead: {lead.customer_name}")

                # Create a temporary quotation for PDF generation
                print("DEBUG: Creating temporary quotation...")
                import uuid
                quotation = self.queryset.create(
                    quotation_number=f"PREVIEW-{uuid.uuid4().hex[:8].upper()}",
                    lead=lead,
                    customer_name_snapshot=lead.customer_name,
                    company_snapshot=lead.company,
                    email_snapshot=lead.email,
                    phone_snapshot=lead.phone,
                    address_snapshot=f"{lead.village}, {lead.subcounty}, {lead.district}" if lead.village else "",
                    valid_until=datetime.date.today() + datetime.timedelta(days=30),
                    discount_total=Decimal('0.00'),
                    status='draft',
                )
                print(f"DEBUG: Created quotation: {quotation.quotation_number}")
            else:
                return Response({'error': 'Either lead_id, quotation_id, or manual_data is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Add services and items
            if items:
                print(f"DEBUG: Creating service with {len(items)} items...")
                print(f"DEBUG: Items data: {items}")
                service = QuotationService.objects.create(
                    quotation=quotation,
                    service_name_snapshot='Quotation Items',
                    notes='Items from quotation preview',
                    sort_order=1,
                )
                for idx, item in enumerate(items):
                    print(f"DEBUG: Creating item {idx + 1}: {item}")
                    quotation_item = QuotationItem.objects.create(
                        quotation=quotation,
                        quotation_service=service,
                        description=item.get('item_name', ''),
                        quantity=Decimal(str(item.get('quantity', 1))),
                        rate=Decimal(str(item.get('unit_price', 0))),
                        unit='each',
                        sort_order=idx + 1,
                    )
                    print(f"DEBUG: Created item: {quotation_item.description}, qty: {quotation_item.quantity}, price: {quotation_item.rate}")
                print("DEBUG: Items added successfully")
            else:
                print("DEBUG: No items provided - quotation will be empty")

            # Calculate totals before generating document
            print("DEBUG: Calculating quotation totals...")
            quotation.calculate_totals()
            print(f"DEBUG: Totals calculated - subtotal: {quotation.subtotal}, vat_total: {quotation.vat_total}, grand_total: {quotation.grand_total}")

            # Generate document based on format
            if format == 'docx':
                print("DEBUG: Starting DOCX generation...")
                try:
                    from .services.quotation_docx import generate_quotation_docx
                    docx_buffer = generate_quotation_docx(quotation, include_vat=include_vat)
                    docx_bytes = docx_buffer.read()
                    print(f"DEBUG: DOCX generated successfully, size: {len(docx_bytes)} bytes")
                except Exception as docx_error:
                    print(f"DEBUG: DOCX generation error: {docx_error}")
                    import traceback
                    traceback.print_exc()
                    raise docx_error

                # Clean up temporary quotation
                print("DEBUG: Cleaning up temporary quotation...")
                quotation.delete()
                print("DEBUG: Temporary quotation deleted")

                # Return DOCX as downloadable file
                response = HttpResponse(docx_bytes, content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                response['Content-Disposition'] = f'attachment; filename="quotation_preview.docx"'
                print("DEBUG: Returning DOCX response")
                return response
            else:
                # Generate PDF (default)
                print("DEBUG: Starting PDF generation...")
                from .services.quotation_pdf import generate_quotation_pdf
                # Pass include_vat to PDF generator
                pdf_buffer = generate_quotation_pdf(quotation, include_vat=include_vat)
                pdf_bytes = pdf_buffer.read()
                print(f"DEBUG: PDF generated successfully, size: {len(pdf_bytes)} bytes")

                # Clean up temporary quotation
                print("DEBUG: Cleaning up temporary quotation...")
                quotation.delete()
                print("DEBUG: Temporary quotation deleted")

                # Return PDF as downloadable file
                response = HttpResponse(pdf_bytes, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="quotation_preview.pdf"'
                print("DEBUG: Returning PDF response")
                return response

        except Lead.DoesNotExist:
            print("DEBUG: Lead not found")
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"DEBUG: Exception occurred: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='generate-docx')
    def generate_docx(self, request, pk=None):
        """Generate Word document for quotation"""
        try:
            quotation = self.get_object()
            include_vat = request.data.get('include_vat')
            if include_vat is None:
                include_vat = quotation.include_vat if hasattr(quotation, 'include_vat') else True

            # Calculate totals before generating DOCX
            quotation.calculate_totals()

            # Generate DOCX
            from .services.quotation_docx import generate_quotation_docx
            docx_buffer = generate_quotation_docx(quotation, include_vat=include_vat)
            docx_bytes = docx_buffer.read()

            # Return DOCX as downloadable file
            response = HttpResponse(docx_bytes, content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            response['Content-Disposition'] = f'attachment; filename="{quotation.quotation_number}.docx"'
            return response

        except Exception as e:
            print(f"DEBUG: Exception occurred: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='convert-to-word')
    def convert_to_word(self, request, pk=None):
        """Generate Word document directly using python-docx with database template data"""
        try:
            quotation = self.get_object()
            include_vat = request.data.get('include_vat')
            if include_vat is None:
                include_vat = quotation.include_vat if hasattr(quotation, 'include_vat') else True

            # Calculate totals before generating DOCX
            quotation.calculate_totals()

            # Generate DOCX directly using the service
            from .services.quotation_docx import generate_quotation_docx
            docx_buffer = generate_quotation_docx(quotation, include_vat=include_vat)
            docx_bytes = docx_buffer.read()

            # Return DOCX as downloadable file
            response = HttpResponse(docx_bytes, content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            response['Content-Disposition'] = f'attachment; filename="{quotation.quotation_number}.docx"'
            return response

        except Exception as e:
            print(f"DEBUG: Exception occurred: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='send-quotation-email')
    def send_quotation_email(self, request):
        """Send quotation email with PDF attachment to customer using Mailgun API"""
        print("DEBUG: send_quotation_email called")
        try:
            from .services.mailgun_service import MailgunService
            from .models import Lead, QuotationService, QuotationItem
            from decimal import Decimal
            from django.core.files.base import ContentFile
            import io

            lead_id = request.data.get('lead_id')
            message = request.data.get('message', '')
            items = request.data.get('items', [])

            print(f"DEBUG: lead_id={lead_id}, message_length={len(message)}, items_count={len(items)}")

            if not lead_id:
                print("DEBUG: Missing lead_id")
                return Response({'error': 'lead_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            print(f"DEBUG: Fetching lead with id={lead_id}")
            lead = Lead.objects.get(id=lead_id)
            print(f"DEBUG: Found lead: {lead.customer_name}, email: {lead.email}")

            # Create a temporary quotation for PDF generation
            print("DEBUG: Creating temporary quotation...")
            quotation = self.queryset.create(
                lead=lead,
                customer_name_snapshot=lead.customer_name,
                company_snapshot=lead.company,
                email_snapshot=lead.email,
                phone_snapshot=lead.phone,
                address_snapshot=f"{lead.village}, {lead.subcounty}, {lead.district}" if lead.village else "",
                valid_until=timezone.now().date() + timezone.timedelta(days=30),
                discount_total=Decimal('0.00'),
                status='draft',
            )
            print(f"DEBUG: Created quotation: {quotation.quotation_number}")

            # Add services and items
            print(f"DEBUG: Processing items: {len(items)} items")
            if items:
                print("DEBUG: Creating service...")
                service = QuotationService.objects.create(
                    quotation=quotation,
                    service_name_snapshot='Quotation Items',
                    notes='Items from quotation request',
                    sort_order=1,
                )
                print(f"DEBUG: Created service, adding {len(items)} items...")
                for item in items:
                    QuotationItem.objects.create(
                        quotation=quotation,
                        quotation_service=service,
                        description=item.get('item_name', ''),
                        quantity=Decimal(str(item.get('quantity', 1))),
                        rate=Decimal(str(item.get('unit_price', 0))),
                        unit='each',
                        sort_order=len(service.items.all()) + 1,
                    )
                print("DEBUG: Items added successfully")

            # Generate PDF using the new quotation_pdf generator
            pdf_bytes = None
            try:
                print("DEBUG: Starting PDF generation...")
                from .services.quotation_pdf import generate_quotation_pdf
                pdf_buffer = generate_quotation_pdf(quotation)
                pdf_bytes = pdf_buffer.read()
                print(f"DEBUG: PDF generated successfully, size: {len(pdf_bytes)} bytes")
            except Exception as pdf_error:
                print(f"DEBUG: PDF generation failed: {pdf_error}")
                pdf_bytes = None

            # Send email using Mailgun API
            print("DEBUG: Initializing Mailgun service...")
            mailgun = MailgunService()
            print("DEBUG: Sending email via Mailgun API...")

            # Prepare email data
            email_data = {
                'to': lead.email,
                'subject': 'Quotation from Spencer Water Services Ltd',
                'text': message,
            }

            # Add PDF attachment if generated
            attachments = []
            if pdf_bytes:
                class PDFAttachment:
                    def __init__(self, filename, content):
                        self.name = filename
                        self.content = content
                attachments.append(PDFAttachment(f'quotation_{quotation.quotation_number}.pdf', pdf_bytes))

            try:
                if attachments:
                    result = mailgun.send_email(
                        to=email_data['to'],
                        subject=email_data['subject'],
                        text=email_data['text'],
                        attachments=attachments,
                    )
                else:
                    result = mailgun.send_email(
                        to=email_data['to'],
                        subject=email_data['subject'],
                        text=email_data['text'],
                    )
                print(f"DEBUG: Email sent successfully: {result}")
                email_status = 'sent'
                email_message = 'Quotation email sent successfully' + (' with PDF attachment' if pdf_bytes else ' (PDF not attached)')
            except Exception as email_error:
                print(f"DEBUG: Email sending failed: {email_error}")
                email_status = 'email_failed'
                email_message = f'Email failed to send due to Mailgun API issue: {str(email_error)}'

            # Clean up temporary quotation
            quotation.delete()
            print("DEBUG: Temporary quotation deleted")

            return Response({
                'status': email_status,
                'message': email_message,
                'lead_id': str(lead.id),
                'customer_name': lead.customer_name,
                'customer_email': lead.email,
                'pdf_attached': pdf_bytes is not None
            })

        except Lead.DoesNotExist:
            print("DEBUG: Lead not found")
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as ve:
            print(f"DEBUG: Configuration error: {ve}")
            return Response({'error': f'Mailgun configuration error: {str(ve)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"DEBUG: Exception occurred: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def director_approve(self, request, pk=None):
        """Director approval of quotation"""
        quotation = self.get_object()
        notes = request.data.get('notes', '')

        quotation.status = 'approved'
        quotation.director_approved_by = request.user
        quotation.director_approved_at = timezone.now()
        quotation.director_approval_notes = notes
        # Also set legacy fields for backward compatibility
        quotation.approved_by = request.user
        quotation.approved_at = timezone.now()
        quotation.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='director_approve',
            description=f'Quotation director approved: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'review'},
            new_value={'status': 'approved', 'notes': notes},
        )

        return Response({'status': 'approved', 'notes': notes})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve quotation (legacy - uses director approval)"""
        return self.director_approve(request, pk)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Send quotation to customer"""
        quotation = self.get_object()
        quotation.status = 'sent'
        quotation.sent_at = timezone.now()
        quotation.save()

        # Update lead status
        quotation.lead.status = 'negotiation'
        quotation.lead.save()

        # Send quotation ready notifications
        try:
            from notifications.utils import send_quotation_ready_email, send_quotation_ready_whatsapp
            send_quotation_ready_email(quotation)
            send_quotation_ready_whatsapp(quotation)
        except Exception as e:
            print(f"Error sending quotation notifications: {e}")

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='send',
            description=f'Quotation sent to customer: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'approved'},
            new_value={'status': 'sent'},
        )

        return Response({'status': 'sent'})

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Customer accepts quotation"""
        quotation = self.get_object()
        quotation.status = 'accepted'
        quotation.accepted_at = timezone.now()
        quotation.save()

        # Update lead status
        quotation.lead.status = 'won'
        quotation.lead.save()

        # Auto-create project with pending approval status
        from projects.models import Project
        import uuid

        # Generate project reference
        year = timezone.now().year
        project_count = Project.objects.filter(project_reference__startswith=f'PRJ-{year}').count()
        project_reference = f'PRJ-{year}-{str(project_count + 1).zfill(6)}'

        # Create project from quotation data
        project = Project.objects.create(
            id=uuid.uuid4(),
            project_reference=project_reference,
            name=f"{quotation.lead.customer_name} - {quotation.lead.service or 'Project'}",
            quotation=quotation,
            service_line=quotation.lead.service or 'other',
            scope_description=quotation.lead.description,
            site_location=f"{quotation.lead.district}, {quotation.lead.subcounty}" if quotation.lead.district else '',
            contract_value=quotation.grand_total,
            status='pending_approval',
            completion_percentage=0,
            is_portfolio_candidate=False,
            is_published=False,
            # Copy location data if available
            latitude=quotation.lead.latitude if hasattr(quotation.lead, 'latitude') else None,
            longitude=quotation.lead.longitude if hasattr(quotation.lead, 'longitude') else None,
        )

        # Send quotation accepted notifications
        try:
            from notifications.utils import send_quotation_accepted_email, send_quotation_accepted_whatsapp
            send_quotation_accepted_email(quotation)
            send_quotation_accepted_whatsapp(quotation)
        except Exception as e:
            print(f"Error sending quotation accepted notifications: {e}")

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='accept',
            description=f'Quotation accepted by customer: {quotation.quotation_number}. Project {project_reference} created pending approval.',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'sent'},
            new_value={'status': 'accepted', 'project_created': project_reference},
        )

        return Response({'status': 'accepted', 'project_reference': project_reference, 'project_id': str(project.id)})

    @action(detail=True, methods=['post'])
    def check_stock(self, request, pk=None):
        """Check stock availability for quotation items"""
        quotation = self.get_object()
        items = quotation.items.filter(inventory_item__isnull=False)

        stock_status = []
        has_shortages = False

        for item in items:
            if item.inventory_item:
                available = item.inventory_item.quantity
                required = item.quantity
                status = 'available' if available >= required else 'shortage'
                shortage = max(0, required - available)

                if status == 'shortage':
                    has_shortages = True

                stock_status.append({
                    'item_description': item.description,
                    'item_code': item.inventory_item.item_code,
                    'available': available,
                    'required': required,
                    'shortage': shortage,
                    'status': status
                })

        return Response({
            'quotation_number': quotation.quotation_number,
            'has_shortages': has_shortages,
            'stock_status': stock_status
        })

    @action(detail=True, methods=['post'])
    def reserve_stock(self, request, pk=None):
        """Reserve stock for quotation items (on approval)"""
        quotation = self.get_object()

        if quotation.status != 'approved':
            return Response(
                {'error': 'Quotation must be approved before reserving stock'},
                status=status.HTTP_400_BAD_REQUEST
            )

        items = quotation.items.filter(inventory_item__isnull=False)
        reserved_items = []
        failed_items = []

        for item in items:
            if item.inventory_item:
                available = item.inventory_item.quantity
                required = item.quantity

                if available >= required:
                    # Reserve stock by creating a material request or marking as reserved
                    # For now, we'll just check availability
                    reserved_items.append({
                        'item_code': item.inventory_item.item_code,
                        'quantity': required
                    })
                else:
                    failed_items.append({
                        'item_code': item.inventory_item.item_code,
                        'available': available,
                        'required': required,
                        'shortage': required - available
                    })

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='reserve_stock',
            description=f'Stock reservation check for quotation: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            new_value={'reserved': len(reserved_items), 'failed': len(failed_items)},
        )

        return Response({
            'quotation_number': quotation.quotation_number,
            'reserved_items': reserved_items,
            'failed_items': failed_items,
            'can_fulfill': len(failed_items) == 0
        })

    @action(detail=True, methods=['post'])
    def generate_procurement_requests(self, request, pk=None):
        """Auto-generate procurement requests for stock shortages"""
        from inventory.models import MaterialRequest, MaterialRequestItem

        quotation = self.get_object()

        if quotation.status != 'approved':
            return Response(
                {'error': 'Quotation must be approved before generating procurement requests'},
                status=status.HTTP_400_BAD_REQUEST
            )

        items = quotation.items.filter(inventory_item__isnull=False)
        shortage_items = []

        for item in items:
            if item.inventory_item:
                available = item.inventory_item.quantity
                required = item.quantity

                if available < required:
                    shortage_items.append({
                        'item': item,
                        'inventory_item': item.inventory_item,
                        'shortage': required - available
                    })

        if not shortage_items:
            return Response({
                'message': 'No stock shortages found',
                'procurement_requests_created': 0
            })

        # Create material request for shortages
        year = timezone.now().year
        count = MaterialRequest.objects.filter(request_number__startswith=f'MR-{year}').count()
        request_number = f'MR-{year}-{str(count + 1).zfill(6)}'

        material_request = MaterialRequest.objects.create(
            request_number=request_number,
            requested_by=request.user if request.user.is_authenticated else None,
            status='PENDING',
            notes=f'Auto-generated from quotation {quotation.quotation_number}'
        )

        # Add items to material request
        for shortage in shortage_items:
            MaterialRequestItem.objects.create(
                material_request=material_request,
                inventory_item=shortage['inventory_item'],
                quantity=shortage['shortage'],
                notes=f'For quotation {quotation.quotation_number}'
            )

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='generate_procurement_requests',
            description=f'Procurement request generated for quotation: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(material_request.id),
            reference_type='MaterialRequest',
            new_value={'request_number': request_number, 'items_count': len(shortage_items)},
        )

        return Response({
            'request_number': request_number,
            'material_request_id': str(material_request.id),
            'items_requested': len(shortage_items),
            'shortage_items': [
                {
                    'item_code': s['inventory_item'].item_code,
                    'item_name': s['inventory_item'].name,
                    'shortage': s['shortage']
                } for s in shortage_items
            ]
        })

    @action(detail=True, methods=['post'])
    def create_project(self, request, pk=None):
        """Create project from accepted quotation"""
        from projects.models import Project

        quotation = self.get_object()

        if quotation.status != 'accepted':
            return Response(
                {'error': 'Quotation must be accepted before creating a project'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if project already exists for this quotation
        if quotation.projects.exists():
            return Response(
                {'error': 'Project already exists for this quotation'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate project reference
        year = timezone.now().year
        count = Project.objects.filter(project_reference__startswith=f'PRJ-{year}').count()
        project_reference = f'PRJ-{year}-{str(count + 1).zfill(6)}'

        # Map service from quotation template to project service line
        service_mapping = {
            'borehole_drilling': 'borehole_drilling',
            'solar_pump_installation': 'solar_pump_installation',
            'water_treatment': 'water_treatment',
            'pipeline_extension': 'water_pipe_laying',
            'plumbing': 'plumbing',
            'water_storage': 'maintenance',
            'maintenance': 'maintenance',
            'tank_installation': 'maintenance',
            'other': 'maintenance',
        }

        service_line = 'maintenance'
        if quotation.template:
            service_line = service_mapping.get(quotation.template.service, 'maintenance')

        # Create project
        project = Project.objects.create(
            project_reference=project_reference,
            name=f"{quotation.lead.customer_name} - {quotation.template.name if quotation.template else 'Project'}",
            quotation=quotation,
            service_line=service_line,
            scope_description=quotation.lead.description or f"{quotation.lead.service} project",
            site_location=quotation.lead.address or quotation.lead.district,
            contract_value=quotation.grand_total,
            status='not_started',
            completion_percentage=0,
        )

        # Update lead status
        quotation.lead.status = 'project'
        quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='create_project',
            description=f'Project created from quotation: {project.project_reference} from {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(project.id),
            reference_type='Project',
            new_value={'project_reference': project.project_reference, 'quotation': quotation.quotation_number},
        )

        return Response({
            'project_reference': project.project_reference,
            'project_id': str(project.id),
            'status': 'created'
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Customer rejects quotation"""
        quotation = self.get_object()
        quotation.status = 'rejected'
        quotation.rejection_reason = request.data.get('rejection_reason', '')
        quotation.rejected_at = timezone.now()
        quotation.save()

        # Update lead status
        quotation.lead.status = 'negotiation'
        quotation.lead.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='reject',
            description=f'Quotation rejected by customer: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'sent'},
            new_value={'status': 'rejected', 'reason': quotation.rejection_reason},
        )

        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def request_revision(self, request, pk=None):
        """Customer requests quotation revision"""
        quotation = self.get_object()
        quotation.status = 'revision'
        quotation.revision_notes = request.data.get('revision_notes', '')
        quotation.revision_requested_at = timezone.now()
        quotation.save()

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='request_revision',
            description=f'Quotation revision requested: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
            old_value={'status': 'sent'},
            new_value={'status': 'revision', 'notes': quotation.revision_notes},
        )

        return Response({'status': 'revision'})

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate professional PDF for quotation"""
        from django.http import HttpResponse
        from .services.quotation_pdf import generate_quotation_pdf

        quotation = self.get_object()

        # Generate PDF using the professional generator
        pdf_buffer = generate_quotation_pdf(quotation)
        pdf_bytes = pdf_buffer.read()

        # Create HTTP response with PDF
        response = HttpResponse(
            pdf_bytes,
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="{quotation.quotation_number}.pdf"'

        # Log to SystemActivity
        log_system_activity(
            module='crm',
            action='generate_pdf',
            description=f'PDF generated for quotation: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='Quotation',
        )

        return response


class QuotationItemViewSet(viewsets.ModelViewSet):
    queryset = QuotationItem.objects.all()
    serializer_class = QuotationItemSerializer

    def get_queryset(self):
        queryset = QuotationItem.objects.all()
        quotation = self.request.query_params.get('quotation')
        if quotation:
            queryset = queryset.filter(quotation_id=quotation)
        return queryset
