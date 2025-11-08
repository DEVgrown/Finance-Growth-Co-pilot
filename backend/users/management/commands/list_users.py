from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'List all users in the system'

    def handle(self, *args, **options):
        users = User.objects.all()
        
        if not users:
            self.stdout.write(self.style.WARNING('No users found in the database'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'\n📋 Found {users.count()} user(s):\n'))
        
        for user in users:
            self.stdout.write('─' * 80)
            self.stdout.write(f'Username: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'First Name: {user.first_name}')
            self.stdout.write(f'Last Name: {user.last_name}')
            self.stdout.write(f'Is Superuser: {"✅ YES" if user.is_superuser else "❌ NO"}')
            self.stdout.write(f'Is Staff: {"✅ YES" if user.is_staff else "❌ NO"}')
            self.stdout.write(f'Is Active: {"✅ YES" if user.is_active else "❌ NO"}')
            self.stdout.write('')
        
        self.stdout.write('─' * 80)
