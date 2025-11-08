import os
import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Business, UserProfile, Membership, Customer
from finance.models import Transaction, Invoice, Budget, CashFlow
from decimal import Decimal
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with demo data for Finance Growth Co-pilot'

    def handle(self, *args, **options):
        self.stdout.write('Starting to seed demo data...')
        
        # Get or create Super Admin
        self.stdout.write('Creating super admin user...')
        super_admin, created = User.objects.get_or_create(
            username='Jackson',
            defaults={
                'email': 'jacksobnmilees@gmail.com',
                'first_name': 'Jackson',
                'last_name': 'Admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            super_admin.set_password('3r14F65gMv')
            super_admin.save()
        
        # Create or get Demo Business
        self.stdout.write('Creating demo business...')
        demo_business, created = Business.objects.get_or_create(
            legal_name='Demo SME Ltd',
            defaults={
                'owner': super_admin,
                'dba_name': 'Demo SME',
                'website': 'https://demo-sme.com',
                'year_founded': 2020,
                'employee_count': 25,
                'hq_city': 'Nairobi',
                'hq_country': 'Kenya',
                'revenue_band': '1M-5M',
                'business_model': 'B2B',
                'sales_motion': 'inside',
                'industry_keywords': 'technology, consulting, services'
            }
        )
        
        # Create business users with different roles
        self.stdout.write('Creating business users...')
        users_data = [
            {
                'username': 'jared_admin',
                'email': 'jared@demo-sme.com',
                'password': 'FG2025!Jared',
                'first_name': 'Jared',
                'last_name': 'Admin',
                'role': 'business_admin'
            },
            {
                'username': 'briton_staff',
                'email': 'briton@demo-sme.com',
                'password': 'FG2025!Briton',
                'first_name': 'Briton',
                'last_name': 'Staff',
                'role': 'staff'
            },
            {
                'username': 'alex_viewer',
                'email': 'alex@demo-sme.com',
                'password': 'FG2025!Alex',
                'first_name': 'Alex',
                'last_name': 'Viewer',
                'role': 'viewer'
            },
        ]
        
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_staff': user_data['role'] == 'business_admin',
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
            
            # Create membership
            Membership.objects.get_or_create(
                business=demo_business,
                user=user,
                role_in_business=user_data['role'],
                invited_by=super_admin,
                is_active=True
            )
        
        # Create sample customers
        self.stdout.write('Creating sample customers...')
        customers = [
            {'name': 'Acme Corp', 'email': 'acme@example.com', 'type': 'business'},
            {'name': 'Globex Inc', 'email': 'globex@example.com', 'type': 'business'},
            {'name': 'Initech', 'email': 'info@initech.com', 'type': 'business'},
            {'name': 'John Doe', 'email': 'john@example.com', 'type': 'individual'},
            {'name': 'Jane Smith', 'email': 'jane@example.com', 'type': 'individual'},
        ]
        
        for cust in customers:
            Customer.objects.get_or_create(
                business=demo_business,
                owner=super_admin,
                customer_name=cust['name'],
                email=cust['email'],
                customer_type=cust['type'],
                company_name=cust['name'] if cust['type'] == 'business' else '',
                payment_terms='Net 30',
                status='active'
            )
        
        # Create sample transactions
        self.stdout.write('Creating sample transactions...')
        transaction_categories = [
            'Office Supplies', 'Rent', 'Utilities', 'Salaries', 'Marketing',
            'Software Subscriptions', 'Consulting Fees', 'Travel', 'Meals', 'Equipment'
        ]
        
        for i in range(50):  # Create 50 sample transactions
            is_income = random.choice([True, False])
            Transaction.objects.create(
                business=demo_business,
                user=super_admin,
                amount=Decimal(random.uniform(100, 10000)).quantize(Decimal('0.01')),
                transaction_type='income' if is_income else 'expense',
                payment_method=random.choice(['mpesa', 'bank_transfer', 'cash', 'card']),
                status='completed',
                description=f"{'Income from ' if is_income else 'Payment for '} {random.choice(transaction_categories)}",
                reference_number=f"TXN-{str(uuid.uuid4())[:8].upper()}",
                transaction_date=datetime.now().date() - timedelta(days=random.randint(0, 90)),
                currency='KES'
            )
        
        # Create sample invoices
        self.stdout.write('Creating sample invoices...')
        for i in range(1, 11):
            invoice = Invoice.objects.create(
                business=demo_business,
                user=super_admin,
                invoice_number=f"INV-{datetime.now().year}-{str(i).zfill(4)}",
                customer_name=random.choice(customers)['name'],
                subtotal=Decimal(random.uniform(1000, 10000)).quantize(Decimal('0.01')),
                tax_amount=Decimal('0.00'),
                total_amount=Decimal(random.uniform(1000, 10000)).quantize(Decimal('0.01')),
                status=random.choice(['draft', 'sent', 'paid', 'overdue']),
                issue_date=datetime.now().date() - timedelta(days=random.randint(1, 30)),
                due_date=datetime.now().date() + timedelta(days=random.randint(10, 60)),
                currency='KES'
            )
            
            # Create invoice items
            for _ in range(random.randint(1, 5)):
                quantity = random.randint(1, 10)
                unit_price = Decimal(random.uniform(50, 1000)).quantize(Decimal('0.01'))
                invoice.items.create(
                    description=f"Service {_ + 1}",
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=quantity * unit_price
                )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded demo data!'))
