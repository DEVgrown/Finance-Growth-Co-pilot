from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'Make a user a superuser by username or email'

    def add_arguments(self, parser):
        parser.add_argument('identifier', type=str, help='Username or email of the user')

    def handle(self, *args, **options):
        identifier = options['identifier']
        
        try:
            # Try to find user by username or email
            user = User.objects.filter(username=identifier).first() or \
                   User.objects.filter(email=identifier).first()
            
            if not user:
                self.stdout.write(self.style.ERROR(f'User not found: {identifier}'))
                return
            
            # Make user a superuser
            user.is_superuser = True
            user.is_staff = True  # Also make them staff for Django admin access
            user.save()
            
            self.stdout.write(self.style.SUCCESS(
                f'✅ Successfully made {user.username} ({user.email}) a superuser!'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'   - is_superuser: {user.is_superuser}'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'   - is_staff: {user.is_staff}'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
