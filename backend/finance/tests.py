# backend/finance/tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import Business, UserProfile
from .models import Transaction, Invoice, InvoiceItem, Budget, CashFlow, FinancialForecast, CreditScore
from decimal import Decimal
import json


class TransactionAPITest(APITestCase):
    """Test Transaction API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.business = Business.objects.create(
            owner=self.user,
            legal_name='Test Business'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.transaction = Transaction.objects.create(
            business=self.business,
            user=self.user,
            amount=Decimal('1000.00'),
            currency='KES',
            transaction_type='income',
            payment_method='mpesa',
            description='Test transaction',
            transaction_date='2024-01-01T10:00:00Z'
        )
    
    def test_create_transaction_success(self):
        """Test creating a new transaction"""
        data = {
            'business': self.business.id,
            'amount': '500.00',
            'currency': 'KES',
            'transaction_type': 'expense',
            'payment_method': 'bank_transfer',
            'description': 'Office supplies',
            'category': 'Office',
            'transaction_date': '2024-01-02T10:00:00Z'
        }
        
        response = self.client.post('/api/finance/transactions/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['amount'], '500.00')
        self.assertEqual(response.data['transaction_type'], 'expense')
    
    def test_get_transaction_list(self):
        """Test getting transaction list"""
        response = self.client.get('/api/finance/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_transaction_analytics(self):
        """Test transaction analytics endpoint"""
        response = self.client.get('/api/finance/transactions/analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_transactions', response.data)
        self.assertIn('total_amount', response.data)
    
    def test_get_transaction_summary(self):
        """Test transaction summary endpoint"""
        response = self.client.get('/api/finance/transactions/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_income', response.data)
        self.assertIn('total_expenses', response.data)


class InvoiceAPITest(APITestCase):
    """Test Invoice API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.business = Business.objects.create(
            owner=self.user,
            legal_name='Test Business'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.invoice = Invoice.objects.create(
            business=self.business,
            user=self.user,
            invoice_number='INV-001',
            customer_name='Test Customer',
            customer_email='customer@example.com',
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('160.00'),
            total_amount=Decimal('1160.00'),
            currency='KES',
            issue_date='2024-01-01',
            due_date='2024-01-31'
        )
    
    def test_create_invoice_success(self):
        """Test creating a new invoice"""
        data = {
            'business': self.business.id,
            'invoice_number': 'INV-002',
            'customer_name': 'New Customer',
            'customer_email': 'new@example.com',
            'subtotal': '2000.00',
            'tax_amount': '320.00',
            'total_amount': '2320.00',
            'currency': 'KES',
            'issue_date': '2024-01-02',
            'due_date': '2024-02-01'
        }
        
        response = self.client.post('/api/finance/invoices/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['invoice_number'], 'INV-002')
    
    def test_get_invoice_list(self):
        """Test getting invoice list"""
        response = self.client.get('/api/finance/invoices/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_send_invoice(self):
        """Test sending invoice"""
        response = self.client.post(f'/api/finance/invoices/{self.invoice.id}/send_invoice/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.status, 'sent')
    
    def test_mark_invoice_paid(self):
        """Test marking invoice as paid"""
        response = self.client.post(f'/api/finance/invoices/{self.invoice.id}/mark_paid/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.status, 'paid')


class BudgetAPITest(APITestCase):
    """Test Budget API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.business = Business.objects.create(
            owner=self.user,
            legal_name='Test Business'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        self.budget = Budget.objects.create(
            business=self.business,
            user=self.user,
            name='Marketing Budget',
            description='Monthly marketing expenses',
            budget_type='monthly',
            category='Marketing',
            budgeted_amount=Decimal('5000.00'),
            currency='KES',
            start_date='2024-01-01',
            end_date='2024-01-31'
        )
    
    def test_create_budget_success(self):
        """Test creating a new budget"""
        data = {
            'business': self.business.id,
            'name': 'Operations Budget',
            'description': 'Monthly operations budget',
            'budget_type': 'monthly',
            'category': 'Operations',
            'budgeted_amount': '10000.00',
            'currency': 'KES',
            'start_date': '2024-01-01',
            'end_date': '2024-01-31'
        }
        
        response = self.client.post('/api/finance/budgets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Operations Budget')
    
    def test_get_budget_list(self):
        """Test getting budget list"""
        response = self.client.get('/api/finance/budgets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_get_budget_analytics(self):
        """Test budget analytics endpoint"""
        response = self.client.get('/api/finance/budgets/analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_budgets', response.data)
        self.assertIn('active_budgets', response.data)


class DashboardDataTest(APITestCase):
    """Test dashboard data endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.business = Business.objects.create(
            owner=self.user,
            legal_name='Test Business'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Create test data
        Transaction.objects.create(
            business=self.business,
            user=self.user,
            amount=Decimal('1000.00'),
            currency='KES',
            transaction_type='income',
            payment_method='mpesa',
            description='Sales revenue',
            transaction_date='2024-01-01T10:00:00Z'
        )
        
        Transaction.objects.create(
            business=self.business,
            user=self.user,
            amount=Decimal('500.00'),
            currency='KES',
            transaction_type='expense',
            payment_method='bank_transfer',
            description='Office rent',
            transaction_date='2024-01-01T10:00:00Z'
        )
    
    def test_dashboard_data(self):
        """Test dashboard data endpoint"""
        response = self.client.get('/api/finance/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('recent_transactions', response.data)
        self.assertIn('businesses', response.data)
        
        # Check summary data
        summary = response.data['summary']
        self.assertEqual(summary['total_income'], '1000.00')
        self.assertEqual(summary['total_expenses'], '500.00')
        self.assertEqual(summary['net_profit'], '500.00')


class CreditScoreAPITest(APITestCase):
    """Test Credit Score API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.business = Business.objects.create(
            owner=self.user,
            legal_name='Test Business'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_calculate_credit_score(self):
        """Test credit score calculation"""
        data = {
            'business_id': self.business.id
        }
        
        response = self.client.post('/api/finance/credit-scores/calculate_score/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('score', response.data)
        self.assertIn('score_category', response.data)
        self.assertIn('factors', response.data)
    
    def test_get_credit_score_list(self):
        """Test getting credit score list"""
        # Create a credit score first
        CreditScore.objects.create(
            business=self.business,
            user=self.user,
            score=750,
            payment_history=85.0,
            credit_utilization=70.0,
            business_age=80.0,
            revenue_stability=75.0,
            debt_to_income=65.0
        )
        
        response = self.client.get('/api/finance/credit-scores/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class FinancialForecastAPITest(APITestCase):
    """Test Financial Forecast API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.business = Business.objects.create(
            owner=self.user,
            legal_name='Test Business'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_generate_forecast(self):
        """Test AI forecast generation"""
        data = {
            'forecast_type': 'revenue',
            'business_id': self.business.id
        }
        
        response = self.client.post('/api/finance/forecasts/generate_forecast/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('forecast_type', response.data)
        self.assertIn('forecast_data', response.data)
        self.assertIn('confidence_score', response.data)
