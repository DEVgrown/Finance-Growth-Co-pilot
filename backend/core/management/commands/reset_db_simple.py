from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Reset the database by dropping all tables and running migrations'

    def handle(self, *args, **options):
        self.stdout.write('Dropping all tables...')
        
        # Get the database cursor
        with connection.cursor() as cursor:
            # Disable foreign key checks
            cursor.execute('SET session_replication_role = \'replica\';')
            
            # Get all table names
            cursor.execute("""
                SELECT tablename FROM pg_tables 
                WHERE schemaname = 'public'
            """)
            tables = cursor.fetchall()
            
            # Drop all tables
            for table in tables:
                table_name = table[0]
                if table_name.startswith('django_'):
                    continue  # Skip Django's internal tables
                self.stdout.write(f'Dropping table {table_name}...')
                cursor.execute(f'DROP TABLE IF EXISTS \"{table_name}\" CASCADE')
            
            # Re-enable foreign key checks
            cursor.execute('SET session_replication_role = \'origin\';')
        
        self.stdout.write('Running migrations...')
        from django.core.management import call_command
        call_command('migrate')
        
        self.stdout.write(self.style.SUCCESS('Database reset successfully!'))
