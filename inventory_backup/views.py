from django.contrib import messages # type: ignore
from django.contrib.auth.decorators import login_required # type: ignore
from django.contrib.auth.mixins import LoginRequiredMixin # type: ignore
from django.db import transaction # type: ignore
from django.shortcuts import get_object_or_404, redirect, render # type: ignore
from django.urls import reverse_lazy # type: ignore
from django.views.generic import ( # type: ignore
    CreateView,
    ListView,
    DetailView,
)
from rest_framework import viewsets, status # type: ignore
from rest_framework.decorators import action # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore

from .forms import (
    CategoryForm,
    InventoryItemForm,
    MaterialRequestForm,
    MaterialRequestItemFormSet,
)

from .models import (
    Category,
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
    StockMovement,
    Supplier,
    SupplierQuotation,
    PurchaseOrder,
)

from .services import (
    MaterialRequestService,
    InventoryService,
    InventoryError,
)

from .serializers import (
    CategorySerializer,
    InventoryItemSerializer,
    MaterialRequestSerializer,
    MaterialRequestItemSerializer,
    StockMovementSerializer,
    SupplierSerializer,
    SupplierQuotationSerializer,
    PurchaseOrderSerializer,
)


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

class CategoryListView(LoginRequiredMixin, ListView):
    model = Category
    template_name = "inventory/category_list.html"
    context_object_name = "categories"


class CategoryCreateView(LoginRequiredMixin, CreateView):
    model = Category
    form_class = CategoryForm
    template_name = "inventory/category_form.html"
    success_url = reverse_lazy("category-list")


class InventoryListView(LoginRequiredMixin, ListView):
    model = InventoryItem
    template_name = "inventory/inventory_list.html"
    context_object_name = "items"


class InventoryCreateView(LoginRequiredMixin, CreateView):
    model = InventoryItem
    form_class = InventoryItemForm
    template_name = "inventory/inventory_form.html"
    success_url = reverse_lazy("inventory-list")


class MaterialRequestListView(LoginRequiredMixin, ListView):
    model = MaterialRequest
    template_name = "inventory/request_list.html"
    context_object_name = "requests"

class MaterialRequestDetailView(LoginRequiredMixin, DetailView):
    model = MaterialRequest
    template_name = "inventory/request_detail.html"
    context_object_name = "request"

@login_required
@transaction.atomic
def create_request(request):

    if request.method == "POST":

        form = MaterialRequestForm(request.POST)

        formset = MaterialRequestItemFormSet(request.POST)

        if form.is_valid() and formset.is_valid():

            material_request = form.save(commit=False)

            material_request.requested_by = request.user

            material_request.save()

            formset.instance = material_request

            formset.save()

            messages.success(
                request,
                "Material request submitted successfully."
            )

            return redirect("request-list")

    else:

        form = MaterialRequestForm()

        formset = MaterialRequestItemFormSet()

    return render(
        request,
        "inventory/request_form.html",
        {
            "form": form,
            "formset": formset,
        },
    )

@login_required
def approve_request(request, pk):

    req = get_object_or_404(
        MaterialRequest,
        pk=pk,
    )

    try:

        MaterialRequestService.approve_request(
            req,
            request.user,
        )

        messages.success(
            request,
            "Request approved."
        )

    except InventoryError as e:

        messages.error(
            request,
            str(e),
        )

    return redirect("request-list")


@login_required
def issue_request(request, pk):

    req = get_object_or_404(
        MaterialRequest,
        pk=pk,
    )

    try:

        MaterialRequestService.issue_request(
            req,
            request.user,
        )

        messages.success(
            request,
            "Materials issued successfully."
        )

    except InventoryError as e:

        messages.error(
            request,
            str(e),
        )

    return redirect("request-list")


# REST API ViewSets
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []  # Allow anonymous access for testing

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        category = self.get_object()
        if category.is_archived:
            return Response(
                {'error': 'Category is already archived'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category.is_archived = True
        category.archived_at = timezone.now()
        category.save()
        
        serializer = self.get_serializer(category)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        category = self.get_object()
        if not category.is_archived:
            return Response(
                {'error': 'Category is not archived'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category.is_archived = False
        category.archived_at = None
        category.save()
        
        serializer = self.get_serializer(category)
        return Response(serializer.data)


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.select_related('category').all()
    serializer_class = InventoryItemSerializer
    permission_classes = []  # Allow anonymous access for testing
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset
    
    def perform_create(self, serializer):
        item = serializer.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='create',
            description=f'Inventory item added: {item.name}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(item.id),
            reference_type='InventoryItem',
            new_value={'name': item.name, 'quantity': item.quantity, 'category': item.category.name if item.category else ''},
        )
    
    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = {
            'name': old_instance.name,
            'quantity': old_instance.quantity,
        }
        super().perform_update(serializer)
        new_instance = self.get_object()
        new_data = {
            'name': new_instance.name,
            'quantity': new_instance.quantity,
        }
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='update',
            description=f'Inventory item updated: {new_instance.name}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(new_instance.id),
            reference_type='InventoryItem',
            old_value=old_data,
            new_value=new_data,
        )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        item = self.get_object()
        if item.is_archived:
            return Response(
                {'error': 'Item is already archived'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item.is_archived = True
        item.archived_at = timezone.now()
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        item = self.get_object()
        if not item.is_archived:
            return Response(
                {'error': 'Item is not archived'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item.is_archived = False
        item.archived_at = None
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)


class MaterialRequestViewSet(viewsets.ModelViewSet):
    queryset = MaterialRequest.objects.select_related('requested_by', 'approved_by').prefetch_related('items__inventory_item').all()
    serializer_class = MaterialRequestSerializer
    permission_classes = []  # Allow anonymous access for testing
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        material_request = self.get_object()
        try:
            MaterialRequestService.approve_request(material_request, request.user)
            
            # Log to SystemActivity
            log_system_activity(
                module='inventory',
                action='approve',
                description=f'Material request approved: {material_request.request_number}',
                performed_by=request.user if request.user.is_authenticated else None,
                reference_id=str(material_request.id),
                reference_type='MaterialRequest',
                new_value={'status': 'approved'},
            )
            
            return Response({'status': 'approved'}, status=status.HTTP_200_OK)
        except InventoryError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def issue(self, request, pk=None):
        material_request = self.get_object()
        try:
            MaterialRequestService.issue_request(material_request, request.user)
            
            # Log to SystemActivity
            log_system_activity(
                module='inventory',
                action='issue',
                description=f'Materials issued for request: {material_request.request_number}',
                performed_by=request.user if request.user.is_authenticated else None,
                reference_id=str(material_request.id),
                reference_type='MaterialRequest',
                new_value={'status': 'issued'},
            )
            
            return Response({'status': 'issued'}, status=status.HTTP_200_OK)
        except InventoryError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.select_related('inventory_item', 'performed_by').all()
    serializer_class = StockMovementSerializer
    permission_classes = []  # Allow anonymous access for testing
    
    def get_queryset(self):
        queryset = super().get_queryset()
        inventory_item = self.request.query_params.get('inventory_item')
        if inventory_item:
            queryset = queryset.filter(inventory_item_id=inventory_item)
        return queryset


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = []  # Allow anonymous access for testing
    
    def perform_create(self, serializer):
        supplier = serializer.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='create',
            description=f'Supplier added: {supplier.name}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(supplier.id),
            reference_type='Supplier',
            new_value={'name': supplier.name, 'supplier_code': supplier.supplier_code},
        )


class SupplierQuotationViewSet(viewsets.ModelViewSet):
    queryset = SupplierQuotation.objects.select_related('material_request', 'supplier').all()
    serializer_class = SupplierQuotationSerializer
    permission_classes = []  # Allow anonymous access for testing
    
    def get_queryset(self):
        queryset = super().get_queryset()
        material_request = self.request.query_params.get('material_request')
        supplier = self.request.query_params.get('supplier')
        status = self.request.query_params.get('status')
        
        if material_request:
            queryset = queryset.filter(material_request_id=material_request)
        if supplier:
            queryset = queryset.filter(supplier_id=supplier)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
    
    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Mark supplier quotation as received"""
        from django.utils import timezone
        
        quotation = self.get_object()
        quotation.status = 'received'
        quotation.received_at = timezone.now()
        quotation.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='receive_quotation',
            description=f'Supplier quotation received: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='SupplierQuotation',
            new_value={'status': 'received'},
        )
        
        return Response({'status': 'received'})
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept supplier quotation"""
        quotation = self.get_object()
        quotation.status = 'accepted'
        quotation.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='accept_quotation',
            description=f'Supplier quotation accepted: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='SupplierQuotation',
            new_value={'status': 'accepted'},
        )
        
        return Response({'status': 'accepted'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject supplier quotation"""
        quotation = self.get_object()
        quotation.status = 'rejected'
        quotation.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='reject_quotation',
            description=f'Supplier quotation rejected: {quotation.quotation_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(quotation.id),
            reference_type='SupplierQuotation',
            new_value={'status': 'rejected'},
        )
        
        return Response({'status': 'rejected'})
    
    @action(detail=False, methods=['get'])
    def compare(self, request):
        """Compare supplier quotations for a material request"""
        material_request_id = request.query_params.get('material_request')
        
        if not material_request_id:
            return Response(
                {'error': 'material_request parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quotations = SupplierQuotation.objects.filter(
            material_request_id=material_request_id,
            status='received'
        ).order_by('total_amount')
        
        serializer = self.get_serializer(quotations, many=True)
        
        return Response({
            'material_request': material_request_id,
            'quotations': serializer.data,
            'best_price': serializer.data[0] if serializer.data else None,
            'count': len(serializer.data)
        })


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related('supplier', 'supplier_quotation', 'material_request').all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = []  # Allow anonymous access for testing
    
    def get_queryset(self):
        queryset = super().get_queryset()
        supplier = self.request.query_params.get('supplier')
        material_request = self.request.query_params.get('material_request')
        status = self.request.query_params.get('status')
        
        if supplier:
            queryset = queryset.filter(supplier_id=supplier)
        if material_request:
            queryset = queryset.filter(material_request_id=material_request)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
    
    def perform_create(self, serializer):
        from django.utils import timezone
        from .models import PurchaseOrder
        
        # Generate order number: PO-{year}-{6 digit count}
        year = timezone.now().year
        count = PurchaseOrder.objects.filter(
            created_at__year=year
        ).count() + 1
        order_number = f"PO-{year}-{count:06d}"
        
        purchase_order = serializer.save(order_number=order_number)
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='create',
            description=f'Purchase order created: {purchase_order.order_number}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            reference_id=str(purchase_order.id),
            reference_type='PurchaseOrder',
            new_value={'order_number': purchase_order.order_number, 'supplier': purchase_order.supplier.name},
        )
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Send purchase order to supplier"""
        from django.utils import timezone
        
        purchase_order = self.get_object()
        purchase_order.status = 'sent'
        purchase_order.sent_at = timezone.now()
        purchase_order.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='send_purchase_order',
            description=f'Purchase order sent: {purchase_order.order_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(purchase_order.id),
            reference_type='PurchaseOrder',
            new_value={'status': 'sent'},
        )
        
        return Response({'status': 'sent'})
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Mark purchase order as acknowledged by supplier"""
        from django.utils import timezone
        
        purchase_order = self.get_object()
        purchase_order.status = 'acknowledged'
        purchase_order.acknowledged_at = timezone.now()
        purchase_order.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='acknowledge_purchase_order',
            description=f'Purchase order acknowledged: {purchase_order.order_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(purchase_order.id),
            reference_type='PurchaseOrder',
            new_value={'status': 'acknowledged'},
        )
        
        return Response({'status': 'acknowledged'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark purchase order as completed"""
        from django.utils import timezone
        
        purchase_order = self.get_object()
        purchase_order.status = 'completed'
        purchase_order.completed_at = timezone.now()
        purchase_order.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='complete_purchase_order',
            description=f'Purchase order completed: {purchase_order.order_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(purchase_order.id),
            reference_type='PurchaseOrder',
            new_value={'status': 'completed'},
        )
        
        return Response({'status': 'completed'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel purchase order"""
        purchase_order = self.get_object()
        purchase_order.status = 'cancelled'
        purchase_order.save()
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='cancel_purchase_order',
            description=f'Purchase order cancelled: {purchase_order.order_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(purchase_order.id),
            reference_type='PurchaseOrder',
            new_value={'status': 'cancelled'},
        )
        
        return Response({'status': 'cancelled'})
    
    @action(detail=False, methods=['post'])
    def create_from_quotation(self, request):
        """Create purchase order from accepted supplier quotation"""
        from django.utils import timezone
        from .models import PurchaseOrder
        
        supplier_quotation_id = request.data.get('supplier_quotation_id')
        expected_delivery_date = request.data.get('expected_delivery_date')
        notes = request.data.get('notes', '')
        
        if not supplier_quotation_id:
            return Response(
                {'error': 'supplier_quotation_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            supplier_quotation = SupplierQuotation.objects.get(id=supplier_quotation_id)
        except SupplierQuotation.DoesNotExist:
            return Response(
                {'error': 'Supplier quotation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if supplier_quotation.status != 'accepted':
            return Response(
                {'error': 'Only accepted quotations can be used to create purchase orders'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate order number
        year = timezone.now().year
        count = PurchaseOrder.objects.filter(
            created_at__year=year
        ).count() + 1
        order_number = f"PO-{year}-{count:06d}"
        
        purchase_order = PurchaseOrder.objects.create(
            order_number=order_number,
            supplier_quotation=supplier_quotation,
            supplier=supplier_quotation.supplier,
            material_request=supplier_quotation.material_request,
            total_amount=supplier_quotation.total_amount,
            expected_delivery_date=expected_delivery_date,
            notes=notes,
            status='draft',
        )
        
        # Log to SystemActivity
        log_system_activity(
            module='inventory',
            action='create_from_quotation',
            description=f'Purchase order created from quotation: {order_number}',
            performed_by=request.user if request.user.is_authenticated else None,
            reference_id=str(purchase_order.id),
            reference_type='PurchaseOrder',
            new_value={'order_number': order_number, 'quotation': supplier_quotation.quotation_number},
        )
        
        serializer = self.get_serializer(purchase_order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
