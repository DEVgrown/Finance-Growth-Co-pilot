from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

import uuid
import random

from users.models import Business

try:
    from finance.models import (
        Invoice, InvoiceItem, Transaction, FinancialForecast, CashFlow, CreditScore, Budget
    )
except Exception:
    # Some models may not exist in minimal setups; import what is available
    from django.apps import apps
    Invoice = apps.get_model('finance', 'Invoice') if apps.is_installed('finance') else None
    InvoiceItem = apps.get_model('finance', 'InvoiceItem') if apps.is_installed('finance') else None
    Transaction = apps.get_model('finance', 'Transaction') if apps.is_installed('finance') else None
    FinancialForecast = apps.get_model('finance', 'FinancialForecast') if apps.is_installed('finance') else None
    CashFlow = apps.get_model('finance', 'CashFlow') if apps.is_installed('finance') else None
    CreditScore = apps.get_model('finance', 'CreditScore') if apps.is_installed('finance') else None
    Budget = apps.get_model('finance', 'Budget') if apps.is_installed('finance') else None


class Command(BaseCommand):
    help = 'Seed the database with sample data for development and testing.'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Delete previous seed user and business before seeding')

    def handle(self, *args, **options):
        User = get_user_model()
        reset = options.get('reset', False)

        with transaction.atomic():
            # Create or get seed user
            user, created = User.objects.get_or_create(
                username='seed_user',
                defaults={
                    'email': 'seed@example.com',
                    'first_name': 'Seed',
                    'last_name': 'User',
                }
            )

            if created:
                try:
                    user.set_password('seedpass')
                    user.save()
                except Exception:
                    # Some custom user models may behave differently; ignore if not applicable
                    pass

            # Optionally reset existing seeded business and related data
            if reset:
                Business.objects.filter(legal_name__icontains='Seed Business').delete()

            business, _ = Business.objects.get_or_create(
                owner=user,
                legal_name='Seed Business Ltd',
                defaults={
                    'dba_name': 'SeedCo',
                    'website': 'https://example.com',
                }
            )

            now = timezone.now()

            created_counts = {
                'invoices': 0,
                'transactions': 0,
                'forecast': 0,
                'cashflows': 0,
                'credit_score': 0,
                'budgets': 0,
            }

            # Create a couple of invoices with items
            if Invoice and InvoiceItem:
                for i in range(1, 3):
                    invoice_number = f"S-{int(now.timestamp())}-{i}"
                    invoice, _ = Invoice.objects.get_or_create(
                        business=business,
                        user=user,
                        invoice_number=invoice_number,
                        defaults={
                            'customer_name': f'Test Customer {i}',
                            'subtotal': '1000.00',
                            'tax_amount': '50.00',
                            'total_amount': '1050.00',
                            'currency': 'KES',
                            'status': 'sent',
                            'issue_date': now.date(),
                            'due_date': (now + timezone.timedelta(days=30)).date(),
                        }
                    )

                    # Add items
                    InvoiceItem.objects.get_or_create(
                        invoice=invoice,
                        description='Product A',
                        defaults={'quantity': 1, 'unit_price': '1000.00'}
                    )
                    created_counts['invoices'] += 1

                    # Create a transaction for the invoice
                    if Transaction:
                        tx, _ = Transaction.objects.get_or_create(
                            business=business,
                            user=user,
                            amount=invoice.total_amount,
                            currency=invoice.currency,
                            transaction_type='income',
                            payment_method='mpesa',
                            status='completed',
                            description=f'Payment for {invoice.invoice_number}',
                            reference_number=str(uuid.uuid4())[:8],
                            invoice=invoice,
                            transaction_date=now,
                        )
                        created_counts['transactions'] += 1

            # Create a simple financial forecast
            if FinancialForecast:
                forecast_data = {
                    'periods': [
                        {'period': (now + timezone.timedelta(days=30 * m)).strftime('%Y-%m'), 'value': random.randint(5000, 15000)}
                        for m in range(1, 7)
                    ]
                }
                FinancialForecast.objects.get_or_create(
                    business=business,
                    user=user,
                    forecast_type='cash_flow',
                    name='Seed Cash Flow Forecast',
                    defaults={
                        'forecast_data': forecast_data,
                        'confidence_score': 75.0,
                        'forecast_start': now.date(),
                        'forecast_end': (now + timezone.timedelta(days=180)).date(),
                    }
                )
                created_counts['forecast'] += 1

            # Create cash flow sample entries
            if CashFlow:
                for m in range(1, 4):
                    CashFlow.objects.get_or_create(
                        business=business,
                        user=user,
                        flow_type='inflow' if m % 2 == 1 else 'outflow',
                        category='sales' if m % 2 == 1 else 'supplies',
                        amount=random.randint(1000, 5000),
                        currency='KES',
                        period_start=(now + timezone.timedelta(days=30 * m)).date(),
                        period_end=(now + timezone.timedelta(days=30 * m + 27)).date(),
                        is_forecast=False,
                    )
                    created_counts['cashflows'] += 1

            # Create credit score
            if CreditScore:
                CreditScore.objects.get_or_create(
                    business=business,
                    user=user,
                    defaults={
                        'score': random.randint(600, 780),
                        'payment_history': 90.0,
                        'credit_utilization': 30.0,
                        'business_age': 2,
                        'revenue_stability': 75.0,
                        'debt_to_income': 20.0,
                    }
                )
                created_counts['credit_score'] += 1

            # Create a simple budget
            if Budget:
                Budget.objects.get_or_create(
                    business=business,
                    user=user,
                    name='Seed Monthly Budget',
                    defaults={
                        'budget_type': 'monthly',
                        'category': 'operations',
                        'budgeted_amount': '10000.00',
                        'spent_amount': '2500.00',
                        'start_date': now.date(),
                        'end_date': (now + timezone.timedelta(days=30)).date(),
                    }
                )
                created_counts['budgets'] += 1

            # Summary output
            self.stdout.write(self.style.SUCCESS('Seeding complete. Summary:'))
            for k, v in created_counts.items():
                self.stdout.write(f'  {k}: {v}')

            self.stdout.write(self.style.SUCCESS('Seed user: %s (id=%s)' % (user.username, getattr(user, 'id', 'n/a'))))
            self.stdout.write(self.style.SUCCESS('Seed business: %s (id=%s)' % (business.legal_name, getattr(business, 'id', 'n/a'))))
