from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Reset the database by dropping and recreating all tables'

    def handle(self, *args, **options):
        self.stdout.write('Resetting database...')
        
        # Get the database name from settings
        db_name = connection.settings_dict['NAME']
        
        # Close all connections to the database
        connection.close()
        
        # Drop the database
        self.stdout.write(f'Dropping database {db_name}...')
        with connection.cursor() as cursor:
            cursor.execute(f'DROP DATABASE IF EXISTS {db_name}')
        
        # Create a new database
        self.stdout.write(f'Creating database {db_name}...')
        with connection.cursor() as cursor:
            cursor.execute(f'CREATE DATABASE {db_name}')
        
        self.stdout.write(self.style.SUCCESS('Successfully reset the database!'))
