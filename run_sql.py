import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

with open('create_inventory_tables.sql', 'r') as f:
    sql = f.read()

with connection.cursor() as cursor:
    cursor.execute(sql)
    connection.commit()

print("SQL executed successfully")
