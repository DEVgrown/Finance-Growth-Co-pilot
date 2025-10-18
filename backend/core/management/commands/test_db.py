from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
import time


class Command(BaseCommand):
    help = 'Test database connection and display connection details'

    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed connection information',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🔍 Testing database connection...\n')
        )
        
        # Display database configuration
        db_config = settings.DATABASES['default']
        self.stdout.write(f"Database Engine: {db_config['ENGINE']}")
        self.stdout.write(f"Database Name: {db_config['NAME']}")
        self.stdout.write(f"Host: {db_config['HOST']}")
        self.stdout.write(f"Port: {db_config['PORT']}")
        self.stdout.write(f"User: {db_config['USER']}")
        
        if options['verbose']:
            self.stdout.write(f"SSL Mode: {db_config['OPTIONS'].get('sslmode', 'Not set')}")
        
        self.stdout.write('-' * 50)
        
        try:
            # Test connection
            start_time = time.time()
            with connection.cursor() as cursor:
                # Test basic query
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                
                # Get database version
                cursor.execute("SELECT version()")
                version = cursor.fetchone()[0]
                
                # Get current database name
                cursor.execute("SELECT current_database()")
                current_db = cursor.fetchone()[0]
                
                # Get current user
                cursor.execute("SELECT current_user")
                current_user = cursor.fetchone()[0]
                
            end_time = time.time()
            connection_time = round((end_time - start_time) * 1000, 2)
            
            # Success output
            self.stdout.write(
                self.style.SUCCESS('✅ Database connection successful!')
            )
            self.stdout.write(f"Connection time: {connection_time}ms")
            self.stdout.write(f"Test query result: {result[0]}")
            self.stdout.write(f"Database version: {version}")
            self.stdout.write(f"Current database: {current_db}")
            self.stdout.write(f"Current user: {current_user}")
            
            if options['verbose']:
                # Additional connection info
                self.stdout.write('\n📊 Additional Information:')
                self.stdout.write(f"Connection settings: {connection.settings_dict}")
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Database connection failed: {str(e)}')
            )
            self.stdout.write(
                self.style.WARNING('💡 Troubleshooting tips:')
            )
            self.stdout.write('1. Check your .env file exists and has correct values')
            self.stdout.write('2. Verify your Neon database is running')
            self.stdout.write('3. Check your network connection')
            self.stdout.write('4. Ensure your IP is whitelisted (if required)')
            return
        
        self.stdout.write(
            self.style.SUCCESS('\n🎉 Database test completed successfully!')
        )