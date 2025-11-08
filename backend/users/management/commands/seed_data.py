from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Business, UserProfile, Membership, Customer
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with test data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')
        
        # Create test user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True,
                'is_staff': False,
                'is_superuser': False,
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created test user'))
        else:
            self.stdout.write(self.style.WARNING('Test user already exists'))
        
        # Create user profile
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'phone_number': '+1234567890',
                'date_of_birth': '1990-01-01',
                'bio': 'Test user profile',
            }
        )
        
        # Create test business
        business, created = Business.objects.get_or_create(
            owner=user,
            legal_name='Test Business Inc.',
            defaults={
                'dba_name': 'Test Business',
                'website': 'https://testbusiness.example.com',
                'year_founded': 2020,
                'employee_count': 10,
                'hq_country': 'US',
                'hq_city': 'San Francisco',
                'registration_number': 'TEST12345',
                'business_model': 'B2B',
                'sales_motion': 'self-serve',
                'revenue_band': '1M-5M',
                'funding_stage': 'seed',
                'classified_category': 'Technology',
                'classified_confidence': 0.95,
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created test business'))
        else:
            self.stdout.write(self.style.WARNING('Test business already exists'))
        
        # Add user to business as admin
        membership, created = Membership.objects.get_or_create(
            business=business,
            user=user,
            defaults={
                'role_in_business': 'business_admin',
                'is_active': True,
            }
        )
        
        # Create test customers
        customers = [
            {
                'customer_name': 'Acme Corp',
                'email': 'acme@example.com',
                'phone_number': '+1987654321',
                'customer_type': 'business',
                'company_name': 'Acme Corporation',
                'payment_terms': 'Net 30',
                'total_invoiced': 10000.00,
                'total_paid': 7500.00,
            },
            {
                'customer_name': 'John Doe',
                'email': 'john.doe@example.com',
                'phone_number': '+1122334455',
                'customer_type': 'individual',
                'payment_terms': 'Net 15',
                'total_invoiced': 5000.00,
                'total_paid': 5000.00,
            },
        ]
        
        for customer_data in customers:
            customer, created = Customer.objects.get_or_create(
                business=business,
                owner=user,
                email=customer_data['email'],
                defaults=customer_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created customer: {customer.customer_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Customer already exists: {customer.customer_name}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data!'))
