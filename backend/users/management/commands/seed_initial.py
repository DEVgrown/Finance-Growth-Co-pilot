from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
import random
from decimal import Decimal

from users.models import Business, Membership, UserProfile, Customer, BusinessRegistration
from finance.models import Invoice, InvoiceItem, Transaction, Budget
from datetime import timedelta


class Command(BaseCommand):
    help = 'Comprehensive seed data: Multiple businesses, users, admins, transactions, invoices, and customers.'

    def handle(self, *args, **options):
        User = get_user_model()

        with transaction.atomic():
            # Super Admin
            superadmin, created = User.objects.get_or_create(
                username='Jackson',
                defaults={
                    'email': 'jacksobnmilees@gmail.com',
                    'first_name': 'Jackson',
                    'last_name': 'Miles',
                    'is_staff': True,
                    'is_superuser': True,
                }
            )
            if created:
                superadmin.set_password('3r14F65gMv')
                superadmin.save()
                UserProfile.objects.get_or_create(
                    user=superadmin,
                    defaults={'role': 'super_admin', 'phone_number': '+254712345678'}
                )

            # Create multiple businesses with different owners/admins
            businesses_data = [
                {
                    'legal_name': 'Nairobi Tech Solutions Ltd',
                    'dba_name': 'Nairobi Tech',
                    'registration_number': 'P05123456789',
                    'hq_city': 'Nairobi',
                    'hq_country': 'Kenya',
                    'website': 'https://nairobitech.co.ke',
                    'business_admin': {
                        'username': 'Jared',
                        'email': 'jared@nairobitech.co.ke',
                        'first_name': 'Jared',
                        'last_name': 'Mwangi',
                        'phone': '+254712345679'
                    },
                    'staff': [
                        {'username': 'Sarah', 'email': 'sarah@nairobitech.co.ke', 'first_name': 'Sarah', 'last_name': 'Kimani', 'phone': '+254712345680'},
                        {'username': 'Mike', 'email': 'mike@nairobitech.co.ke', 'first_name': 'Mike', 'last_name': 'Ochieng', 'phone': '+254712345681'},
                    ],
                    'viewers': [
                        {'username': 'Alex', 'email': 'alex@nairobitech.co.ke', 'first_name': 'Alex', 'last_name': 'Omondi', 'phone': '+254712345682'},
                    ]
                },
                {
                    'legal_name': 'Mombasa Trading Co',
                    'dba_name': 'Mombasa Trading',
                    'registration_number': 'P05123456790',
                    'hq_city': 'Mombasa',
                    'hq_country': 'Kenya',
                    'website': 'https://mombasatrading.co.ke',
                    'business_admin': {
                        'username': 'Briton',
                        'email': 'briton@mombasatrading.co.ke',
                        'first_name': 'Briton',
                        'last_name': 'Kamau',
                        'phone': '+254712345683'
                    },
                    'staff': [
                        {'username': 'Grace', 'email': 'grace@mombasatrading.co.ke', 'first_name': 'Grace', 'last_name': 'Wanjiru', 'phone': '+254712345684'},
                    ],
                    'viewers': []
                },
                {
                    'legal_name': 'Kisumu Services Ltd',
                    'dba_name': 'Kisumu Services',
                    'registration_number': 'P05123456791',
                    'hq_city': 'Kisumu',
                    'hq_country': 'Kenya',
                    'website': 'https://kisumuservices.co.ke',
                    'business_admin': {
                        'username': 'David',
                        'email': 'david@kisumuservices.co.ke',
                        'first_name': 'David',
                        'last_name': 'Odhiambo',
                        'phone': '+254712345685'
                    },
                    'staff': [],
                    'viewers': []
                },
            ]

            now = timezone.now()
            created_businesses = []

            for biz_data in businesses_data:
                # Create business admin user
                admin_data = biz_data['business_admin']
                admin_user, created = User.objects.get_or_create(
                    username=admin_data['username'],
                    defaults={
                        'email': admin_data['email'],
                        'first_name': admin_data['first_name'],
                        'last_name': admin_data['last_name'],
                    }
                )
                if created or not admin_user.has_usable_password():
                    admin_user.set_password(f"FG2025!{admin_data['username']}")
                    admin_user.save()
                
                admin_profile, _ = UserProfile.objects.get_or_create(
                    user=admin_user,
                    defaults={'role': 'owner', 'phone_number': admin_data['phone']}
                )
                if not admin_profile.phone_number:
                    admin_profile.phone_number = admin_data['phone']
                    admin_profile.save()

                # Create business
                business, _ = Business.objects.get_or_create(
                    owner=admin_user,
                    legal_name=biz_data['legal_name'],
                    defaults={
                        'dba_name': biz_data['dba_name'],
                        'registration_number': biz_data['registration_number'],
                        'hq_city': biz_data['hq_city'],
                        'hq_country': biz_data['hq_country'],
                        'website': biz_data['website'],
                    }
                )
                created_businesses.append(business)

                # Create membership for admin
                Membership.objects.get_or_create(
                    business=business,
                    user=admin_user,
                    defaults={
                        'role_in_business': 'business_admin',
                        'invited_by': superadmin,
                        'is_active': True,
                    }
                )

                # Create staff users
                for staff_data in biz_data['staff']:
                    staff_user, created = User.objects.get_or_create(
                        username=staff_data['username'],
                        defaults={
                            'email': staff_data['email'],
                            'first_name': staff_data['first_name'],
                            'last_name': staff_data['last_name'],
                        }
                    )
                    if created or not staff_user.has_usable_password():
                        staff_user.set_password(f"FG2025!{staff_data['username']}")
                        staff_user.save()
                    
                    UserProfile.objects.get_or_create(
                        user=staff_user,
                        defaults={'role': 'staff', 'phone_number': staff_data['phone']}
                    )
                    
                    Membership.objects.get_or_create(
                        business=business,
                        user=staff_user,
                        defaults={
                            'role_in_business': 'staff',
                            'invited_by': admin_user,
                            'is_active': True,
                        }
                    )

                # Create viewer users
                for viewer_data in biz_data['viewers']:
                    viewer_user, created = User.objects.get_or_create(
                        username=viewer_data['username'],
                        defaults={
                            'email': viewer_data['email'],
                            'first_name': viewer_data['first_name'],
                            'last_name': viewer_data['last_name'],
                        }
                    )
                    if created or not viewer_user.has_usable_password():
                        viewer_user.set_password(f"FG2025!{viewer_data['username']}")
                        viewer_user.save()
                    
                    UserProfile.objects.get_or_create(
                        user=viewer_user,
                        defaults={'role': 'viewer', 'phone_number': viewer_data['phone']}
                    )
                    
                    Membership.objects.get_or_create(
                        business=business,
                        user=viewer_user,
                        defaults={
                            'role_in_business': 'viewer',
                            'invited_by': admin_user,
                            'is_active': True,
                        }
                    )

                # Create customers for this business
                customer_names = [
                    'ABC Corporation', 'XYZ Industries', 'Tech Innovations Ltd', 'Global Services Inc',
                    'Prime Solutions', 'Elite Trading', 'Premium Supplies', 'Quality Products Co'
                ]
                
                for i, customer_name in enumerate(customer_names[:6]):
                    Customer.objects.get_or_create(
                        business=business,
                        customer_name=customer_name,
                        defaults={
                            'owner': admin_user,
                            'email': f'contact@{customer_name.lower().replace(" ", "").replace(".", "")}.com',
                            'phone_number': f'+2547{100000000 + i}',
                            'physical_address': f'{random.choice(["Main Street", "Business Park", "Trade Center"])}, {biz_data["hq_city"]}',
                            'status': random.choice(['active', 'active', 'active', 'inactive']),
                            'onboarded_by': admin_user,
                        }
                    )

                # Create invoices and transactions for this business
                base_date = now - timedelta(days=60)
                for i in range(1, 15):  # Create 14 invoices
                    invoice_date = base_date + timedelta(days=i * 4)
                    due_date = invoice_date + timedelta(days=14)
                    
                    customer = Customer.objects.filter(business=business).order_by('?').first()
                    if not customer:
                        customer_name = f'Customer {i}'
                    else:
                        customer_name = customer.customer_name
                    
                    subtotal = Decimal(str(random.randint(1000, 50000)))
                    tax_amount = subtotal * Decimal('0.16')  # 16% VAT
                    total_amount = subtotal + tax_amount
                    
                    status_choices = ['draft', 'sent', 'paid', 'overdue', 'cancelled']
                    status_weights = [2, 4, 5, 2, 1]  # More paid and sent invoices
                    status = random.choices(status_choices, weights=status_weights)[0]
                    
                    invoice, created = Invoice.objects.get_or_create(
                        business=business,
                        invoice_number=f"INV-{business.id:03d}-{invoice_date.strftime('%Y%m%d')}-{i:03d}",
                        defaults={
                            'user': admin_user,
                            'customer_name': customer_name,
                            'customer_email': customer.email if customer else f'customer{i}@example.com',
                            'subtotal': subtotal,
                            'tax_amount': tax_amount,
                            'total_amount': total_amount,
                            'currency': 'KES',
                            'status': status,
                            'issue_date': invoice_date.date(),
                            'due_date': due_date.date(),
                        }
                    )
                    
                    # Only create invoice items if invoice was just created
                    if created:
                        item_qty = Decimal(str(random.randint(1, 10)))
                        item_unit_price = subtotal / item_qty
                        InvoiceItem.objects.create(
                            invoice=invoice,
                            description=f'Service/Product {i}',
                            quantity=item_qty,
                            unit_price=item_unit_price,
                        )
                        
                        # Create transaction if invoice is paid
                        if status == 'paid':
                            Transaction.objects.create(
                                business=business,
                                user=admin_user,
                                invoice=invoice,
                                amount=total_amount,
                                currency='KES',
                                transaction_type='income',
                                payment_method=random.choice(['mpesa', 'bank_transfer', 'cash', 'card']),
                                status='completed',
                                description=f'Payment for {invoice.invoice_number}',
                                transaction_date=invoice_date + timedelta(days=random.randint(0, 7)),
                            )

                # Create additional transactions (expenses and other income)
                for i in range(1, 20):
                    trans_date = base_date + timedelta(days=i * 3)
                    trans_type = random.choice(['income', 'expense'])
                    
                    if trans_type == 'expense':
                        amount = Decimal(str(random.randint(500, 15000)))
                        description = random.choice([
                            'Office Supplies', 'Rent Payment', 'Utilities', 'Marketing Expenses',
                            'Travel Expenses', 'Equipment Purchase', 'Professional Services'
                        ])
                        payment_method = random.choice(['mpesa', 'bank_transfer', 'cash'])
                    else:
                        amount = Decimal(str(random.randint(1000, 30000)))
                        description = f'Additional Income {i}'
                        payment_method = random.choice(['mpesa', 'bank_transfer'])
                    
                    Transaction.objects.create(
                        business=business,
                        user=admin_user,
                        amount=amount,
                        currency='KES',
                        transaction_type=trans_type,
                        payment_method=payment_method,
                        status=random.choice(['completed', 'completed', 'completed', 'pending']),
                        category=random.choice(['operations', 'sales', 'marketing', 'other']),
                        description=description,
                        transaction_date=trans_date,
                    )

                # Create budgets
                budget_categories = ['Operations', 'Marketing', 'Sales', 'IT Infrastructure']
                for category in budget_categories:
                    Budget.objects.create(
                        business=business,
                        user=admin_user,
                        name=f'{category} Budget',
                        budget_type='monthly',
                        category=category.lower().replace(' ', '_'),
                        budgeted_amount=Decimal(str(random.randint(50000, 200000))),
                        spent_amount=Decimal(str(random.randint(20000, 100000))),
                        start_date=(now - timedelta(days=15)).date(),
                        end_date=(now + timedelta(days=15)).date(),
                    )

            # Create pending business registrations for approval
            pending_registrations_data = [
                {
                    'business_name': 'Eldoret Food Services Ltd',
                    'business_type': 'Food & Beverage',
                    'registration_number': 'P05123456792',
                    'tax_pin': 'P051234567U',
                    'location': 'Eldoret, Kenya',
                    'monthly_revenue': Decimal('250000.00'),
                    'owner_name': 'Peter Kipchoge',
                    'email': 'peter@eldoretfood.co.ke',
                    'phone_number': '+254712345690',
                },
                {
                    'business_name': 'Nakuru Tech Hub',
                    'business_type': 'Technology Services',
                    'registration_number': 'P05123456793',
                    'tax_pin': 'P051234568V',
                    'location': 'Nakuru, Kenya',
                    'monthly_revenue': Decimal('500000.00'),
                    'owner_name': 'Jane Wanjala',
                    'email': 'jane@nakurutech.co.ke',
                    'phone_number': '+254712345691',
                },
                {
                    'business_name': 'Thika Manufacturing Co',
                    'business_type': 'Manufacturing',
                    'registration_number': 'P05123456794',
                    'tax_pin': 'P051234569W',
                    'location': 'Thika, Kenya',
                    'monthly_revenue': Decimal('750000.00'),
                    'owner_name': 'James Mutua',
                    'email': 'james@thikamanuf.co.ke',
                    'phone_number': '+254712345692',
                },
                {
                    'business_name': 'Malindi Tourism Agency',
                    'business_type': 'Tourism & Hospitality',
                    'registration_number': 'P05123456795',
                    'tax_pin': 'P051234570X',
                    'location': 'Malindi, Kenya',
                    'monthly_revenue': Decimal('300000.00'),
                    'owner_name': 'Fatuma Hassan',
                    'email': 'fatuma@malinditourism.co.ke',
                    'phone_number': '+254712345693',
                },
            ]

            for reg_data in pending_registrations_data:
                BusinessRegistration.objects.get_or_create(
                    email=reg_data['email'],
                    business_name=reg_data['business_name'],
                    defaults={
                        'business_type': reg_data['business_type'],
                        'registration_number': reg_data['registration_number'],
                        'tax_pin': reg_data['tax_pin'],
                        'location': reg_data['location'],
                        'monthly_revenue': reg_data['monthly_revenue'],
                        'owner_name': reg_data['owner_name'],
                        'phone_number': reg_data['phone_number'],
                        'status': 'pending',
                    }
                )

            self.stdout.write(self.style.SUCCESS('\n' + '='*60))
            self.stdout.write(self.style.SUCCESS('COMPREHENSIVE SEED DATA CREATED SUCCESSFULLY'))
            self.stdout.write(self.style.SUCCESS('='*60))
            self.stdout.write(self.style.SUCCESS(f'\nSuper Admin:'))
            self.stdout.write(self.style.SUCCESS(f'  Username: Jackson'))
            self.stdout.write(self.style.SUCCESS(f'  Email: jacksobnmilees@gmail.com'))
            self.stdout.write(self.style.SUCCESS(f'  Password: 3r14F65gMv'))
            
            self.stdout.write(self.style.SUCCESS(f'\nBusinesses Created: {len(created_businesses)}'))
            for biz in created_businesses:
                admin = biz.memberships.filter(role_in_business='business_admin').first()
                if admin:
                    self.stdout.write(self.style.SUCCESS(f'\n  {biz.legal_name}:'))
                    self.stdout.write(self.style.SUCCESS(f'    Admin: {admin.user.username} ({admin.user.email})'))
                    self.stdout.write(self.style.SUCCESS(f'    Password: FG2025!{admin.user.username}'))
                    self.stdout.write(self.style.SUCCESS(f'    Invoices: {Invoice.objects.filter(business=biz).count()}'))
                    self.stdout.write(self.style.SUCCESS(f'    Transactions: {Transaction.objects.filter(business=biz).count()}'))
                    self.stdout.write(self.style.SUCCESS(f'    Customers: {Customer.objects.filter(business=biz).count()}'))
                    self.stdout.write(self.style.SUCCESS(f'    Members: {biz.memberships.filter(is_active=True).count()}'))
            
            pending_count = BusinessRegistration.objects.filter(status='pending').count()
            self.stdout.write(self.style.SUCCESS(f'\nPending Business Registrations: {pending_count}'))
            for reg in BusinessRegistration.objects.filter(status='pending')[:5]:
                self.stdout.write(self.style.SUCCESS(f'  - {reg.business_name} ({reg.owner_name}) - KES {reg.monthly_revenue:,.2f}/month'))
            
            self.stdout.write(self.style.SUCCESS('\n' + '='*60))
