from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Invoice, InvoiceItem, Payment
from .serializers import InvoiceSerializer, InvoiceItemSerializer, PaymentSerializer


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


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    
    def get_queryset(self):
        queryset = Invoice.objects.all()
        quotation = self.request.query_params.get('quotation')
        status_filter = self.request.query_params.get('status')
        
        if quotation:
            queryset = queryset.filter(quotation_id=quotation)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        # Generate invoice number if not provided
        if not serializer.validated_data.get('invoice_number'):
            year = timezone.now().year
            count = Invoice.objects.filter(invoice_number__startswith=f'INV-{year}').count()
            serializer.validated_data['invoice_number'] = f'INV-{year}-{str(count + 1).zfill(6)}'
        
        serializer.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='finance',
            action='create_invoice',
            description=f'Invoice created: {serializer.instance.invoice_number}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(serializer.instance.id),
            reference_type='Invoice',
            new_value={'invoice_number': serializer.instance.invoice_number, 'total': str(serializer.instance.total_amount)},
        )
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Mark invoice as sent"""
        invoice = self.get_object()
        invoice.status = 'sent'
        invoice.sent_at = timezone.now()
        invoice.save()
        
        log_system_activity(
            module='finance',
            action='send_invoice',
            description=f'Invoice sent: {invoice.invoice_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(invoice.id),
            reference_type='Invoice',
            old_value={'status': 'draft'},
            new_value={'status': 'sent'},
        )
        
        return Response({'status': 'sent'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel invoice"""
        invoice = self.get_object()
        invoice.status = 'cancelled'
        invoice.save()
        
        log_system_activity(
            module='finance',
            action='cancel_invoice',
            description=f'Invoice cancelled: {invoice.invoice_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(invoice.id),
            reference_type='Invoice',
            old_value={'status': invoice.status},
            new_value={'status': 'cancelled'},
        )
        
        return Response({'status': 'cancelled'})


class InvoiceItemViewSet(viewsets.ModelViewSet):
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer
    
    def get_queryset(self):
        queryset = InvoiceItem.objects.all()
        invoice = self.request.query_params.get('invoice')
        if invoice:
            queryset = queryset.filter(invoice_id=invoice)
        return queryset


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        queryset = Payment.objects.all()
        invoice = self.request.query_params.get('invoice')
        status_filter = self.request.query_params.get('status')
        
        if invoice:
            queryset = queryset.filter(invoice_id=invoice)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        # Generate payment number if not provided
        if not serializer.validated_data.get('payment_number'):
            year = timezone.now().year
            count = Payment.objects.filter(payment_number__startswith=f'PAY-{year}').count()
            serializer.validated_data['payment_number'] = f'PAY-{year}-{str(count + 1).zfill(6)}'
        
        serializer.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='finance',
            action='create_payment',
            description=f'Payment created: {serializer.instance.payment_number}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(serializer.instance.id),
            reference_type='Payment',
            new_value={'payment_number': serializer.instance.payment_number, 'amount': str(serializer.instance.amount)},
        )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark payment as completed"""
        payment = self.get_object()
        payment.status = 'completed'
        payment.received_by = request.user if request.user.is_authenticated else None
        payment.save()
        
        log_system_activity(
            module='finance',
            action='complete_payment',
            description=f'Payment completed: {payment.payment_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(payment.id),
            reference_type='Payment',
            old_value={'status': 'pending'},
            new_value={'status': 'completed'},
        )
        
        return Response({'status': 'completed'})
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Refund payment"""
        payment = self.get_object()
        payment.status = 'refunded'
        payment.save()
        
        # Update invoice
        payment.invoice.amount_paid -= payment.amount
        payment.invoice.save()
        
        log_system_activity(
            module='finance',
            action='refund_payment',
            description=f'Payment refunded: {payment.payment_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(payment.id),
            reference_type='Payment',
            old_value={'status': 'completed'},
            new_value={'status': 'refunded'},
        )
        
        return Response({'status': 'refunded'})
