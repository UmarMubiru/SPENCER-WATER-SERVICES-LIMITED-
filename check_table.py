import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'inventory_supplier'
        ORDER BY ordinal_position
    """)
    columns = cursor.fetchall()
    print("inventory_supplier columns:")
    for col in columns:
        print(f"  {col[0]}: {col[1]}")
    
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'inventory_supplierquotation'
        ORDER BY ordinal_position
    """)
    columns = cursor.fetchall()
    print("\ninventory_supplierquotation columns:")
    for col in columns:
        print(f"  {col[0]}: {col[1]}")
    
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'inventory_purchaseorder'
        ORDER BY ordinal_position
    """)
    columns = cursor.fetchall()
    print("\ninventory_purchaseorder columns:")
    for col in columns:
        print(f"  {col[0]}: {col[1]}")
