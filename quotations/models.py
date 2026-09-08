from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class Customer(models.Model):
    """Customer model for deduplication and customer portal access"""
    CUSTOMER_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('company', 'Company'),
        ('government', 'Government'),
        ('ngo', 'NGO'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_number = models.CharField(max_length=50, unique=True)
    customer_type = models.CharField(max_length=50, choices=CUSTOMER_TYPE_CHOICES, default='individual')

    # Contact Information
    name = models.CharField(max_length=255)  # Individual name or company name
    contact_person = models.CharField(max_length=255, blank=True, null=True)  # For companies
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    preferred_contact = models.CharField(max_length=50, blank=True, null=True)

    # Company Details (if applicable)
    company_registration = models.CharField(max_length=100, blank=True, null=True)
    tin_number = models.CharField(max_length=50, blank=True, null=True)

    # Address
    district = models.CharField(max_length=100, blank=True, null=True)
    subcounty = models.CharField(max_length=100, blank=True, null=True)
    village = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    gps = models.CharField(max_length=100, blank=True, null=True)

    # Portal Access
    portal_user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_profile')
    is_portal_active = models.BooleanField(default=False)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def __str__(self):
        return f"{self.customer_number} - {self.name}"

    @classmethod
    def get_or_create_from_lead(cls, lead):
        """Get or create customer from lead data with deduplication"""
        customer, created = cls.objects.get_or_create(
            email=lead.email,
            defaults={
                'customer_number': f'CST-{timezone.now().year}-{str(cls.objects.count() + 1).zfill(6)}',
                'name': lead.company if lead.company else lead.customer_name,
                'contact_person': lead.customer_name if lead.company else None,
                'phone': lead.phone,
                'preferred_contact': lead.preferred_contact,
                'district': lead.district,
                'subcounty': lead.subcounty,
                'village': lead.village,
                'address': lead.address,
                'gps': lead.gps,
                'customer_type': 'company' if lead.company else 'individual',
            }
        )
        return customer, created


class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualification', 'Qualification'),
        ('site_visit', 'Site Visit'),
        ('requirements_confirmed', 'Requirements Confirmed'),
        ('ready_for_quotation', 'Ready for Quotation'),
        ('quotation_draft', 'Quotation Draft'),
        ('internal_review', 'Internal Review'),
        ('quotation_sent', 'Quotation Sent'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    CUSTOMER_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('commercial', 'Commercial'),
        ('government', 'Government'),
        ('ngo', 'NGO'),
        ('institution', 'Institution'),
    ]

    REQUIREMENT_STATUS_CHOICES = [
        ('information_incomplete', 'Information Incomplete'),
        ('requirements_confirmed', 'Requirements Confirmed'),
    ]

    SERVICE_CHOICES = [
        ('borehole_drilling', 'Borehole Drilling'),
        ('solar_pump_installation', 'Solar Pump Installation'),
        ('water_treatment', 'Water Treatment'),
        ('pipeline_extension', 'Pipeline Extension'),
        ('plumbing', 'Plumbing'),
        ('water_storage', 'Water Storage'),
        ('maintenance', 'Maintenance'),
        ('water_taps_accessories', 'Water Taps & Accessories'),
        ('other', 'Other'),
    ]

    BUDGET_CHOICES = [
        ('under_10m', 'Under 10M'),
        ('10_50m', '10–50M'),
        ('50_100m', '50–100M'),
        ('100m_plus', '100M+'),
        ('not_sure', 'Not Sure'),
    ]

    TIMELINE_CHOICES = [
        ('urgent', 'Urgent'),
        ('1_month', '1 Month'),
        ('3_months', '3 Months'),
        ('flexible', 'Flexible'),
    ]

    SOURCE_CHOICES = [
        ('website', 'Website'),
        ('referral', 'Referral'),
        ('social_media', 'Social Media'),
        ('advertisement', 'Advertisement'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead_number = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    preferred_contact = models.CharField(max_length=50, blank=True, null=True)

    # Location
    district = models.CharField(max_length=100, blank=True, null=True)
    subcounty = models.CharField(max_length=100, blank=True, null=True)
    village = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    gps = models.CharField(max_length=100, blank=True, null=True)

    # Service Details (legacy - kept for backward compatibility)
    service = models.CharField(max_length=50, choices=SERVICE_CHOICES, blank=True, null=True, help_text="Legacy field - use LeadService for multi-service support")
    description = models.TextField()
    budget_range = models.CharField(max_length=50, choices=BUDGET_CHOICES, blank=True, null=True)
    timeline = models.CharField(max_length=50, choices=TIMELINE_CHOICES, blank=True, null=True)

    # Qualification Fields
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='medium')
    customer_type = models.CharField(max_length=50, choices=CUSTOMER_TYPE_CHOICES, default='individual')
    requirement_status = models.CharField(max_length=50, choices=REQUIREMENT_STATUS_CHOICES, default='information_incomplete')
    qualification_notes = models.TextField(blank=True, null=True)

    # Metadata
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='website')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='new')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.lead_number} - {self.customer_name}"

    def is_ready_for_quotation(self):
        """Check if lead is ready for quotation creation"""
        return (
            self.status == 'ready_for_quotation' and
            self.requirement_status == 'requirements_confirmed' and
            self.lead_services.exists()
        )


class LeadService(models.Model):
    """Multi-service support for leads - allows a lead to have multiple services"""
    SERVICE_CHOICES = [
        ('borehole_drilling', 'Borehole Drilling'),
        ('solar_pump_installation', 'Solar Pump Installation'),
        ('water_treatment', 'Water Treatment'),
        ('pipeline_extension', 'Pipeline Extension'),
        ('plumbing', 'Plumbing'),
        ('water_storage', 'Water Storage'),
        ('maintenance', 'Maintenance'),
        ('water_taps_accessories', 'Water Taps & Accessories'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='lead_services')
    service = models.CharField(max_length=50, choices=SERVICE_CHOICES)

    # Service-specific requirements (flexible JSON structure)
    service_requirements = models.JSONField(default=dict, blank=True, help_text="Service-specific technical requirements")

    # Snapshot of service name at time of lead creation (for historical accuracy)
    service_name_snapshot = models.CharField(max_length=255, blank=True, null=True)

    # Notes about this specific service for this lead
    notes = models.TextField(blank=True, null=True)

    # Order for display
    sort_order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'created_at']
        verbose_name = 'Lead Service'
        verbose_name_plural = 'Lead Services'

    def __str__(self):
        return f"{self.lead.lead_number} - {self.get_service_display()}"

    def save(self, *args, **kwargs):
        # Snapshot the service name for historical accuracy
        if not self.service_name_snapshot:
            self.service_name_snapshot = self.get_service_display()
        super().save(*args, **kwargs)


class LeadDetail(models.Model):
    """Store service-specific answers for leads"""
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name='details')
    question_key = models.CharField(max_length=100, help_text="Key identifying the question")
    question_text = models.CharField(max_length=255, help_text="The actual question asked")
    answer = models.TextField(help_text="Customer's answer")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['question_key']

    def __str__(self):
        return f"{self.lead.lead_number} - {self.question_key}"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('new_lead', 'New Lead'),
        ('lead_assigned', 'Lead Assigned'),
        ('quotation_submitted', 'Quotation Submitted'),
        ('quotation_approved', 'Quotation Approved'),
        ('quotation_sent', 'Quotation Sent'),
        ('quotation_accepted', 'Quotation Accepted'),
        ('quotation_rejected', 'Quotation Rejected'),
        ('task_assigned', 'Task Assigned'),
        ('task_due', 'Task Due'),
        ('site_visit_scheduled', 'Site Visit Scheduled'),
        ('site_visit_completed', 'Site Visit Completed'),
        ('project_created', 'Project Created'),
        ('project_updated', 'Project Updated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crm_notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()

    # Optional references
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='lead_notifications')
    quotation = models.ForeignKey('Quotation', on_delete=models.CASCADE, null=True, blank=True, related_name='quotation_notifications')
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True, related_name='task_notifications')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, null=True, blank=True, related_name='project_notifications')

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.username}"

    def mark_as_read(self):
        self.is_read = True
        self.read_at = timezone.now()
        self.save()


def create_notification(recipient, notification_type, title, message, lead_id=None, quotation_id=None, task_id=None, project_id=None):
    """Helper function to create notifications"""
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        lead_id=lead_id,
        quotation_id=quotation_id,
        task_id=task_id,
        project_id=project_id,
    )
    return notification


class LeadActivity(models.Model):
    ACTIVITY_TYPE_CHOICES = [
        ('call', 'Phone Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
        ('site_visit', 'Site Visit'),
        ('note', 'Note'),
        ('task', 'Task'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPE_CHOICES)
    description = models.TextField()
    outcome = models.TextField(blank=True, null=True)
    next_action = models.TextField(blank=True, null=True)
    next_action_date = models.DateTimeField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='lead_activities')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.activity_type} - {self.lead.lead_number}"


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    TASK_TYPE_CHOICES = [
        ('follow_up', 'Follow Up'),
        ('site_visit', 'Site Visit'),
        ('quotation', 'Quotation'),
        ('document', 'Document'),
        ('payment', 'Payment'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task_number = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    task_type = models.CharField(max_length=50, choices=TASK_TYPE_CHOICES, default='other')
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')

    # Relationships
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    quotation = models.ForeignKey('Quotation', on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')

    # Assignment
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')

    # Dates
    due_date = models.DateTimeField(blank=True, null=True)
    completed_date = models.DateTimeField(blank=True, null=True)

    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', 'due_date']

    def __str__(self):
        return f"{self.task_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.task_number:
            year = timezone.now().year
            count = Task.objects.filter(task_number__startswith=f'TSK-{year}').count()
            self.task_number = f'TSK-{year}-{str(count + 1).zfill(6)}'
        super().save(*args, **kwargs)


class LeadAttachment(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='lead_attachments/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.lead.lead_number} - {self.file.name}"


class LeadActivity(models.Model):
    ACTIVITY_TYPES = [
        ('note', 'Note'),
        ('call', 'Call'),
        ('email', 'Email'),
        ('site_visit', 'Site Visit'),
        ('status_change', 'Status Change'),
        ('assignment', 'Assignment'),
        ('quotation_sent', 'Quotation Sent'),
        ('other', 'Other'),
    ]

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    activity = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.lead.lead_number} - {self.activity}"


class SiteVisit(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='site_visits')
    scheduled_date = models.DateField()
    completed_date = models.DateField(blank=True, null=True)
    engineer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='site_visits')

    # GPS Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    gps_accuracy = models.CharField(max_length=50, blank=True, null=True)

    # Site Details
    ground_conditions = models.TextField(blank=True, null=True)
    water_source = models.TextField(blank=True, null=True)
    depth_estimate = models.CharField(max_length=100, blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)

    # Measurements
    site_area_size = models.CharField(max_length=100, blank=True, null=True, help_text="Size of the site area (e.g., 50x30 meters)")
    elevation = models.CharField(max_length=100, blank=True, null=True, help_text="Elevation above sea level")
    distance_to_road = models.CharField(max_length=100, blank=True, null=True, help_text="Distance from main road")
    accessibility_notes = models.TextField(blank=True, null=True, help_text="Notes about site accessibility for equipment")

    # Photos
    photo_1 = models.ImageField(upload_to='site_visit_photos/', blank=True, null=True)
    photo_2 = models.ImageField(upload_to='site_visit_photos/', blank=True, null=True)
    photo_3 = models.ImageField(upload_to='site_visit_photos/', blank=True, null=True)
    photo_4 = models.ImageField(upload_to='site_visit_photos/', blank=True, null=True)
    photo_5 = models.ImageField(upload_to='site_visit_photos/', blank=True, null=True)

    # Additional observations
    weather_conditions = models.CharField(max_length=100, blank=True, null=True)
    soil_type = models.CharField(max_length=100, blank=True, null=True)
    vegetation = models.TextField(blank=True, null=True)
    nearby_structures = models.TextField(blank=True, null=True, help_text="Nearby buildings, fences, etc.")
    utilities_present = models.TextField(blank=True, null=True, help_text="Water, electricity, sewer lines nearby")

    status = models.CharField(max_length=50, choices=[('scheduled', 'Scheduled'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date']

    def __str__(self):
        return f"{self.lead.lead_number} - {self.scheduled_date}"


class QuotationTemplate(models.Model):
    SERVICE_CHOICES = [
        ('borehole_drilling', 'Borehole Drilling'),
        ('solar_pump_installation', 'Solar Pump Installation'),
        ('water_treatment', 'Water Treatment'),
        ('pipeline_extension', 'Pipeline Extension'),
        ('plumbing', 'Plumbing'),
        ('water_storage', 'Water Storage'),
        ('maintenance', 'Maintenance'),
        ('tank_installation', 'Tank Installation'),
        ('water_taps_accessories', 'Water Taps & Accessories'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    service = models.CharField(max_length=50, choices=SERVICE_CHOICES)
    description = models.TextField(blank=True, null=True)

    # Template Content
    header = models.TextField(blank=True, null=True)
    terms = models.TextField(blank=True, null=True)
    footer = models.TextField(blank=True, null=True)
    validity_days = models.IntegerField(default=30)
    payment_terms = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class QuotationTemplateItem(models.Model):
    UNIT_CHOICES = [
        ('each', 'Each'),
        ('meter', 'Meter'),
        ('square_meter', 'Square Meter'),
        ('cubic_meter', 'Cubic Meter'),
        ('hour', 'Hour'),
        ('day', 'Day'),
        ('kg', 'Kilogram'),
        ('ton', 'Ton'),
        ('liter', 'Liter'),
        ('set', 'Set'),
    ]

    ITEM_CATEGORY_CHOICES = [
        ('material', 'Material'),
        ('labor', 'Labor'),
        ('equipment', 'Equipment'),
        ('transport', 'Transport'),
        ('overhead', 'Overhead'),
        ('other', 'Other'),
    ]

    template = models.ForeignKey(QuotationTemplate, on_delete=models.CASCADE, related_name='items')
    item_code = models.CharField(max_length=50, blank=True, null=True, help_text="Item code for inventory reference")
    description = models.CharField(max_length=500)
    category = models.CharField(max_length=50, choices=ITEM_CATEGORY_CHOICES, default='material')
    unit = models.CharField(max_length=50, choices=UNIT_CHOICES)
    default_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    default_rate = models.DecimalField(max_digits=12, decimal_places=2)
    vat_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_optional = models.BooleanField(default=False)
    is_required = models.BooleanField(default=True, help_text="Whether this item is required for the service")
    min_quantity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Minimum quantity allowed")
    max_quantity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="Maximum quantity allowed")
    notes = models.TextField(blank=True, null=True, help_text="Additional notes for this item")
    sort_order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.template.name} - {self.description}"


class Quotation(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('revision_required', 'Revision Required'),
        ('sent', 'Sent'),
        ('viewed', 'Viewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('revision_requested', 'Revision Requested'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation_number = models.CharField(max_length=50, unique=True)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='quotations', null=True, blank=True)
    template = models.ForeignKey(QuotationTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='quotations')

    # Quotation Details
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    version = models.IntegerField(default=1)
    valid_until = models.DateField(blank=True, null=True)
    parent_quotation = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='revisions', help_text="Parent quotation if this is a revision")

    # Financials (computed from items)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    vat_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    include_vat = models.BooleanField(default=True)

    # Customer snapshot (for historical accuracy)
    customer_name_snapshot = models.CharField(max_length=255, blank=True, null=True)
    company_snapshot = models.CharField(max_length=255, blank=True, null=True)
    email_snapshot = models.EmailField(blank=True, null=True)
    phone_snapshot = models.CharField(max_length=20, blank=True, null=True)
    address_snapshot = models.TextField(blank=True, null=True)

    # Template Content (copied from template)
    header = models.TextField(blank=True, null=True)
    terms = models.TextField(blank=True, null=True)
    footer = models.TextField(blank=True, null=True)
    payment_terms = models.TextField(blank=True, null=True)

    # Hero Images for admin pages
    hero_image_1 = models.ImageField(upload_to='quotation_hero/', blank=True, null=True)
    hero_image_url_1 = models.URLField(blank=True, help_text="External URL for hero image 1")
    hero_alt_text_1 = models.CharField(max_length=255, blank=True, null=True)
    hero_image_2 = models.ImageField(upload_to='quotation_hero/', blank=True, null=True)
    hero_image_url_2 = models.URLField(blank=True, help_text="External URL for hero image 2")
    hero_alt_text_2 = models.CharField(max_length=255, blank=True, null=True)
    hero_image_3 = models.ImageField(upload_to='quotation_hero/', blank=True, null=True)
    hero_image_url_3 = models.URLField(blank=True, help_text="External URL for hero image 3")
    hero_alt_text_3 = models.CharField(max_length=255, blank=True, null=True)

    # Notes
    internal_notes = models.TextField(blank=True, null=True)
    customer_notes = models.TextField(blank=True, null=True)

    # Approval
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_quotations')
    submitted_at = models.DateTimeField(blank=True, null=True)

    # Manager Approval
    manager_review_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='manager_reviewed_quotations')
    manager_review_at = models.DateTimeField(blank=True, null=True)
    manager_review_notes = models.TextField(blank=True, null=True)

    # Director Approval
    director_approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='director_approved_quotations')
    director_approved_at = models.DateTimeField(blank=True, null=True)
    director_approval_notes = models.TextField(blank=True, null=True)

    # Legacy field for backward compatibility
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_quotations')
    approved_at = models.DateTimeField(blank=True, null=True)
    approval_notes = models.TextField(blank=True, null=True)

    # Customer response tracking
    customer_response = models.TextField(blank=True, null=True)
    customer_response_at = models.DateTimeField(blank=True, null=True)

    # Sending and viewing tracking
    sent_at = models.DateTimeField(blank=True, null=True)
    viewed_at = models.DateTimeField(blank=True, null=True)

    # PDF generation
    generated_pdf = models.FileField(upload_to='quotations/pdfs/', blank=True, null=True)
    pdf_generated_at = models.DateTimeField(blank=True, null=True)

    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='archived_quotations')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quotation_number} - {self.lead.customer_name if self.lead else 'No Lead'}"

    def calculate_totals(self):
        """Calculate quotation totals from items"""
        items = self.items.all()
        subtotal = sum(item.line_total for item in items)

        # Only include VAT if include_vat is True
        if self.include_vat:
            vat_total = sum(item.vat_amount for item in items)
        else:
            vat_total = 0

        discount_total = sum(item.discount_amount for item in items)
        grand_total = subtotal + vat_total - discount_total

        self.subtotal = subtotal
        self.vat_total = vat_total
        self.discount_total = discount_total
        self.grand_total = grand_total
        self.save()


class QuotationItem(models.Model):
    UNIT_CHOICES = [
        ('each', 'Pieces'),
        ('meter', 'Meter'),
        ('square_meter', 'Square Meter'),
        ('cubic_meter', 'Cubic Meter'),
        ('hour', 'Hour'),
        ('day', 'Day'),
        ('kg', 'Kilogram'),
        ('ton', 'Ton'),
        ('liter', 'Liter'),
        ('set', 'Set'),
        ('none', 'N/A'),
    ]

    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    quotation_service = models.ForeignKey('QuotationService', on_delete=models.SET_NULL, null=True, blank=True, related_name='items', help_text="Link to quotation service for organization")
    inventory_item = models.ForeignKey('inventory.InventoryItem', on_delete=models.SET_NULL, null=True, blank=True, related_name='quotation_items', help_text="Link to inventory item for stock checking")
    item_code = models.CharField(max_length=50, blank=True, null=True, help_text="Item code for inventory reference")
    description = models.CharField(max_length=500)
    unit = models.CharField(max_length=50, choices=UNIT_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    vat_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_optional = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)

    # Computed fields
    line_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    vat_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    final_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.quotation.quotation_number} - {self.description}"

    def save(self, *args, **kwargs):
        # Calculate line totals
        from decimal import Decimal
        self.line_total = self.quantity * self.rate

        # Only include VAT if the quotation has include_vat enabled
        if self.quotation.include_vat:
            self.vat_amount = self.line_total * (self.vat_percentage / Decimal('100'))
        else:
            self.vat_amount = Decimal('0')

        self.discount_amount = self.line_total * (self.discount_percentage / Decimal('100'))
        self.final_total = self.line_total + self.vat_amount - self.discount_amount
        super().save(*args, **kwargs)


class QuotationService(models.Model):
    """Multi-service support for quotations - links services to quotations with their items"""
    SERVICE_CHOICES = [
        ('borehole_drilling', 'Borehole Drilling'),
        ('solar_pump_installation', 'Solar Pump Installation'),
        ('water_treatment', 'Water Treatment'),
        ('pipeline_extension', 'Pipeline Extension'),
        ('plumbing', 'Plumbing'),
        ('water_storage', 'Water Storage'),
        ('maintenance', 'Maintenance'),
        ('water_taps_accessories', 'Water Taps & Accessories'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='quotation_services')
    service = models.CharField(max_length=50, choices=SERVICE_CHOICES)

    # Snapshot of service name at time of quotation creation (for historical accuracy)
    service_name_snapshot = models.CharField(max_length=255, blank=True, null=True)

    # Service-specific requirements (copied from lead service)
    service_requirements = models.JSONField(default=dict, blank=True)

    # Notes about this specific service for this quotation
    notes = models.TextField(blank=True, null=True)

    # Order for display
    sort_order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'created_at']
        verbose_name = 'Quotation Service'
        verbose_name_plural = 'Quotation Services'

    def __str__(self):
        return f"{self.quotation.quotation_number} - {self.get_service_display()}"

    def save(self, *args, **kwargs):
        # Snapshot the service name for historical accuracy
        if not self.service_name_snapshot:
            self.service_name_snapshot = self.get_service_display()
        super().save(*args, **kwargs)
