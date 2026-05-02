import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

def clear_jobs():
    with connection.cursor() as cursor:
        cursor.execute('TRUNCATE TABLE jobs CASCADE;')
    print("Jobs truncated")

if __name__ == '__main__':
    clear_jobs()
