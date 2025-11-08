import os
import sys
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings

class Command(BaseCommand):
    help = 'Reset the database and seed with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Resetting database...')
        
        # Close all connections
        connection.close()
        
        # Drop and recreate the database
        db_name = settings.DATABASES['default']['NAME']
        db_user = settings.DATABASES['default']['USER']
        db_password = settings.DATABASES['default']['PASSWORD']
        db_host = settings.DATABASES['default']['HOST']
        db_port = settings.DATABASES['default']['PORT']
        
        self.stdout.write(f'Dropping and recreating database {db_name}...')
        
        # Connect to postgres database to drop and create the target database
        import psycopg2
        conn = psycopg2.connect(
            dbname='postgres',
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Drop all active connections
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{db_name}'
            AND pid <> pg_backend_pid();
        """)
        
        # Drop and recreate the database
        cursor.execute(f'DROP DATABASE IF EXISTS "{db_name}"')
        cursor.execute(f'CREATE DATABASE "{db_name}"')
        
        cursor.close()
        conn.close()
        
        self.stdout.write('Running migrations...')
        call_command('migrate')
        
        # Create superuser
        self.stdout.write('Creating superuser...')
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(username='Jackson').exists():
            User.objects.create_superuser(
                username='Jackson',
                email='jacksobnmilees@gmail.com',
                password='3r14F65gMv',
                first_name='Jackson',
                last_name='Admin'
            )
            self.stdout.write(self.style.SUCCESS('Superuser created successfully'))
        else:
            self.stdout.write('Superuser already exists')
        
        # Seed initial data
        self.stdout.write('Seeding initial data...')
        call_command('seed_demo_data')
        
        self.stdout.write(self.style.SUCCESS('Database reset and seeded successfully!'))
