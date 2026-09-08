from django.db import models
import uuid
from django.core.validators import MinValueValidator
from django.utils import timezone


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=30, unique=True)
    quotation = models.ForeignKey('quotations.Quotation', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    project_reference = models.CharField(max_length=150, blank=True, help_text="Reference to the project if applicable")
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    customer_address = models.TextField(blank=True)
    
    invoice_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    vat_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    balance_due = models.DecimalField(max_digits=15, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True)
    
    sent_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['quotation']),
            models.Index(fields=['status']),
            models.Index(fields=['invoice_date']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.customer_name}"
    
    def save(self, *args, **kwargs):
        # Calculate balance due
        self.balance_due = self.total_amount - self.amount_paid
        
        # Update status based on payment
        if self.balance_due <= 0:
            self.status = 'paid'
            if not self.paid_at:
                self.paid_at = timezone.now()
        elif self.amount_paid > 0:
            self.status = 'partial'
        
        super().save(*args, **kwargs)


class InvoiceItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=300)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    vat_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    
    line_total = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['invoice', 'id']
    
    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.description}"
    
    def save(self, *args, **kwargs):
        # Calculate line total
        base_amount = self.quantity * self.unit_price
        discount_amount = base_amount * (self.discount_percentage / 100)
        subtotal = base_amount - discount_amount
        vat_amount = subtotal * (self.vat_percentage / 100)
        self.line_total = subtotal + vat_amount
        super().save(*args, **kwargs)


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money'),
        ('cheque', 'Cheque'),
        ('card', 'Card'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_number = models.CharField(max_length=30, unique=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    
    amount = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_date = models.DateField(default=timezone.now)
    
    reference_number = models.CharField(max_length=100, blank=True, help_text="Bank reference, transaction ID, etc.")
    notes = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    received_by = models.ForeignKey('users.UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='received_payments')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-payment_date', '-created_at']
        indexes = [
            models.Index(fields=['payment_number']),
            models.Index(fields=['invoice']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_date']),
        ]
    
    def __str__(self):
        return f"{self.payment_number} - {self.invoice.invoice_number} ({self.amount})"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update invoice payment status
        if self.status == 'completed':
            self.invoice.amount_paid += self.amount
            self.invoice.save()
