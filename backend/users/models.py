# Create your models here.
# backend/users/models.py
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

class Business(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='businesses')
    legal_name = models.CharField(max_length=255)
    dba_name = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    year_founded = models.PositiveIntegerField(null=True, blank=True)
    employee_count = models.PositiveIntegerField(null=True, blank=True)
    hq_country = models.CharField(max_length=100, blank=True)
    hq_city = models.CharField(max_length=100, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    ownership_type = models.CharField(max_length=100, blank=True)
    business_model = models.CharField(max_length=50, blank=True)  # B2B/B2C/B2G
    sales_motion = models.CharField(max_length=50, blank=True)    # self-serve/inside/field
    naics = models.CharField(max_length=20, blank=True)
    sic = models.CharField(max_length=20, blank=True)
    industry_keywords = models.TextField(blank=True)
    revenue_band = models.CharField(max_length=50, blank=True)
    funding_stage = models.CharField(max_length=50, blank=True)
    regions = models.CharField(max_length=255, blank=True)
    channels = models.CharField(max_length=255, blank=True)
    regulated = models.BooleanField(default=False)

    # Classification outputs
    classified_category = models.CharField(max_length=255, blank=True)
    classified_confidence = models.FloatField(null=True, blank=True)
    classified_tags = models.JSONField(null=True, blank=True)
    last_classified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.legal_name


class UserProfile(models.Model):
    """Extended user profile with additional fields"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal Information
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Professional Information
    job_title = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=100, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    
    # Location
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Preferences
    language = models.CharField(max_length=10, default='en')
    currency = models.CharField(max_length=3, default='USD')
    notification_preferences = models.JSONField(default=dict, blank=True)
    
    # Financial Preferences
    risk_tolerance = models.CharField(
        max_length=20,
        choices=[
            ('conservative', 'Conservative'),
            ('moderate', 'Moderate'),
            ('aggressive', 'Aggressive'),
        ],
        default='moderate'
    )
    
    # User Role
    role = models.CharField(
        max_length=20,
        choices=[
            ('owner', 'Owner'),
            ('data_entry', 'Data Entry'),
            ('admin', 'Admin'),
        ],
        default='owner'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip()


class Customer(models.Model):
    """Customer/Client model for managing business clients"""
    
    CUSTOMER_TYPES = [
        ('individual', 'Individual'),
        ('business', 'Business'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='customers', null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customers')
    
    # Customer details
    customer_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPES, default='individual')
    company_name = models.CharField(max_length=255, blank=True)
    physical_address = models.TextField(blank=True)
    payment_terms = models.CharField(max_length=100, blank=True, default='Net 30')
    
    # Financial tracking
    total_invoiced = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    onboarded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='onboarded_customers')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = [['owner', 'email']]
    
    def __str__(self):
        return f"{self.customer_name} ({self.email})"
    
    @property
    def outstanding_balance(self):
        """Calculate outstanding balance"""
        return self.total_invoiced - self.total_paid