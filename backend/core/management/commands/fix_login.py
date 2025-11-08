from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection

class Command(BaseCommand):
    help = 'Fix login issues by creating a superuser and resetting migrations'

    def handle(self, *args, **options):
        # Create superuser if it doesn't exist
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
        
        # Check if auth_user table exists
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'auth_user'
                );
            """)
            auth_user_exists = cursor.fetchone()[0]
            
            if not auth_user_exists:
                self.stdout.write('auth_user table is missing. Running migrations...')
                from django.core.management import call_command
                call_command('migrate', 'auth', interactive=False)
                call_command('migrate', 'admin', interactive=False)
                call_command('migrate', 'sessions', interactive=False)
                call_command('migrate', 'contenttypes', interactive=False)
                self.stdout.write(self.style.SUCCESS('Migrations applied successfully'))
            else:
                self.stdout.write('auth_user table exists')
        
        self.stdout.write(self.style.SUCCESS('Login issues should be fixed. Try logging in with username: Jackson, password: 3r14F65gMv'))
