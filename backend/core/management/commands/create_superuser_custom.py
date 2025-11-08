from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates a superuser with custom credentials'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Create superuser if it doesn't exist
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
            
            # Try to update the password in case it was changed
            user = User.objects.get(username='Jackson')
            user.set_password('3r14F65gMv')
            user.save()
            self.stdout.write(self.style.SUCCESS('Superuser password reset to default'))
        
        self.stdout.write('\nYou can now login with:')
        self.stdout.write('Username: Jackson')
        self.stdout.write('Password: 3r14F65gMv')
