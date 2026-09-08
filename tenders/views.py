from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Tender, TenderDocument, TenderSubmission
from .serializers import TenderSerializer, TenderDocumentSerializer, TenderSubmissionSerializer


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


class TenderViewSet(viewsets.ModelViewSet):
    queryset = Tender.objects.all()
    serializer_class = TenderSerializer

    def perform_create(self, serializer):
        tender = serializer.save()

        # Log to SystemActivity
        log_system_activity(
            module='tenders',
            action='create',
            description=f'Tender created: {tender.title} ({tender.reference_number})',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(tender.id),
            reference_type='Tender',
            new_value={'title': tender.title, 'reference_number': tender.reference_number},
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = {'status': old_instance.status}
        super().perform_update(serializer)
        new_instance = self.get_object()
        new_data = {'status': new_instance.status}

        # Log to SystemActivity if status changed
        if old_data['status'] != new_data['status']:
            log_system_activity(
                module='tenders',
                action='status_change',
                description=f'Tender status changed: {new_instance.title} from {old_data["status"]} to {new_data["status"]}',
                performed_by=self.request.user if self.request.user.is_authenticated else None,
                reference_id=str(new_instance.id),
                reference_type='Tender',
                old_value={'status': old_data['status']},
                new_value={'status': new_data['status']},
            )
