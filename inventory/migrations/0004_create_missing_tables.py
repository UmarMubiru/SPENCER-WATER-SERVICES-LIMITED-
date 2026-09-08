# Generated migration to create missing inventory tables

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    dependencies = [
        ('inventory', '0003_add_product_image'),
    ]

    operations = [
        # Create MaterialRequest
        migrations.CreateModel(
            name='MaterialRequest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('request_number', models.CharField(max_length=64, unique=True)),
                ('project', models.CharField(max_length=255)),
                ('requested_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='material_requests', to=settings.AUTH_USER_MODEL)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected'), ('FULFILLED', 'Fulfilled')], default='PENDING', max_length=16)),
                ('notes', models.TextField(blank=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        # Create MaterialRequestItem
        migrations.CreateModel(
            name='MaterialRequestItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.IntegerField()),
                ('inventory_item', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='request_items', to='inventory.inventoryitem')),
                ('request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='inventory.materialrequest')),
            ],
        ),
        # Create SupplierQuotation
        migrations.CreateModel(
            name='SupplierQuotation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('DRAFT', 'Draft'), ('SENT', 'Sent'), ('ACCEPTED', 'Accepted'), ('REJECTED', 'Rejected')], default='DRAFT', max_length=16)),
                ('valid_until', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('supplier', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='quotations', to='inventory.supplier')),
                ('material_request', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='quotations', to='inventory.materialrequest')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        # Create SupplierQuotationItem
        migrations.CreateModel(
            name='SupplierQuotationItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.IntegerField()),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('inventory_item', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='supplier_quotation_items', to='inventory.inventoryitem')),
                ('product', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='supplier_quotation_items', to='inventory.product')),
                ('quotation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='inventory.supplierquotation')),
            ],
        ),
    ]
