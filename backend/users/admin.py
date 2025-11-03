from django.contrib import admin
from .models import Business, UserProfile, Customer

# Register your models here.
@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ['legal_name', 'owner', 'business_model', 'revenue_band', 'created_at']
    search_fields = ['legal_name', 'owner__username', 'owner__email']
    list_filter = ['business_model', 'revenue_band', 'created_at']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'phone_number', 'country', 'city', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone_number']
    list_filter = ['role', 'country', 'created_at']

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'email', 'customer_type', 'status', 'owner', 'total_invoiced', 'total_paid', 'created_at']
    search_fields = ['customer_name', 'email', 'phone_number', 'company_name']
    list_filter = ['customer_type', 'status', 'created_at']
    readonly_fields = ['total_invoiced', 'total_paid', 'created_at', 'updated_at']
