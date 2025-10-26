# backend/finance/admin.py
from django.contrib import admin
from .models import (
    Transaction, Invoice, InvoiceItem, Budget, CashFlow,
    FinancialForecast, CreditScore
)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'business', 'user', 'amount', 'currency', 'transaction_type', 'status', 'transaction_date']
    list_filter = ['transaction_type', 'status', 'payment_method', 'currency', 'transaction_date']
    search_fields = ['description', 'reference_number', 'external_id', 'supplier', 'customer']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'transaction_date'
    ordering = ['-transaction_date']


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'business', 'customer_name', 'total_amount', 'currency', 'status', 'issue_date', 'due_date']
    list_filter = ['status', 'currency', 'issue_date', 'due_date']
    search_fields = ['invoice_number', 'customer_name', 'customer_email', 'etims_invoice_number']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [InvoiceItemInline]
    date_hierarchy = 'issue_date'
    ordering = ['-issue_date']


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'description', 'quantity', 'unit_price', 'total_price']
    list_filter = ['invoice__status', 'invoice__business']
    search_fields = ['description', 'invoice__customer_name']


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['name', 'business', 'category', 'budgeted_amount', 'spent_amount', 'remaining_amount', 'currency', 'is_active']
    list_filter = ['budget_type', 'category', 'is_active', 'currency']
    search_fields = ['name', 'description', 'category']
    readonly_fields = ['id', 'remaining_amount', 'created_at', 'updated_at']
    date_hierarchy = 'start_date'
    ordering = ['-start_date']


@admin.register(CashFlow)
class CashFlowAdmin(admin.ModelAdmin):
    list_display = ['business', 'flow_type', 'category', 'amount', 'currency', 'period_start', 'period_end', 'is_forecast']
    list_filter = ['flow_type', 'is_forecast', 'currency', 'period_start']
    search_fields = ['category', 'source']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'period_start'
    ordering = ['-period_start']


@admin.register(FinancialForecast)
class FinancialForecastAdmin(admin.ModelAdmin):
    list_display = ['name', 'business', 'forecast_type', 'confidence_score', 'forecast_start', 'forecast_end']
    list_filter = ['forecast_type', 'model_version', 'forecast_start']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'forecast_start'
    ordering = ['-created_at']


@admin.register(CreditScore)
class CreditScoreAdmin(admin.ModelAdmin):
    list_display = ['business', 'score', 'score_category', 'calculation_method', 'created_at']
    list_filter = ['score_category', 'calculation_method', 'created_at']
    search_fields = ['business__legal_name', 'calculation_method']
    readonly_fields = ['id', 'score_category', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
