# backend/finance/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransactionViewSet, InvoiceViewSet, InvoiceItemViewSet,
    BudgetViewSet, CashFlowViewSet, FinancialForecastViewSet,
    CreditScoreViewSet, dashboard_data
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'invoice-items', InvoiceItemViewSet)
router.register(r'budgets', BudgetViewSet)
router.register(r'cash-flows', CashFlowViewSet)
router.register(r'forecasts', FinancialForecastViewSet)
router.register(r'credit-scores', CreditScoreViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_data, name='dashboard_data'),
]
