import os
import sys
from pathlib import Path
BASE = Path(r'c:\Users\ADMIN\Desktop\Spencer WaterServices\SPENCER-WATER-SERVICES-LIMITED-')
sys.path.insert(0, str(BASE))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.contrib.auth.models import User
from inventory.models import InventoryItem
from inventory.serializers import MaterialRequestSerializer
from django.contrib.auth.models import AnonymousUser

item = InventoryItem.objects.first()
print('inventory item', item)
if not item:
    raise SystemExit('No inventory items found in database')

payload = {
    'request_number': 'TEST-001',
    'project_reference': 'Test Project',
    'remarks': 'Test remarks',
    'items': [
        {
            'inventory_item': str(item.id),
            'requested_quantity': 1,
            'remarks': 'test'
        }
    ],
}
serializer = MaterialRequestSerializer(data=payload, context={'request': type('R', (), {'user': User.objects.first() or AnonymousUser()})()})
print('valid', serializer.is_valid())
print('errors', serializer.errors)
try:
    obj = serializer.save(requested_by=User.objects.first() or AnonymousUser())
    print('saved', obj, obj.id)
except Exception as e:
    import traceback
    traceback.print_exc()
