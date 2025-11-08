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


class Membership(models.Model):
    """Links a user to a business with a role within that business.

    This supports multi-tenant teams where a single user can belong to
    multiple businesses with different roles.
    """
    ROLE_CHOICES = [
        ('business_admin', 'Business Admin'),
        ('staff', 'Staff'),
        ('viewer', 'Viewer'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    role_in_business = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_business_invitations')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['business', 'user']]
        indexes = [
            models.Index(fields=['business', 'user']),
            models.Index(fields=['business', 'role_in_business']),
        ]

    def __str__(self):
        return f"{self.user.username} @ {self.business.legal_name} ({self.role_in_business})"


class BusinessInvitation(models.Model):
    """Invitation model for inviting users to join a business"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    ]
    
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    role_in_business = models.CharField(max_length=20, choices=Membership.ROLE_CHOICES, default='staff')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    token = models.CharField(max_length=64, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [['business', 'email', 'status']]
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['business', 'status']),
        ]
    
    def __str__(self):
        return f"Invitation for {self.email} to {self.business.legal_name} ({self.status})"


class BusinessRegistration(models.Model):
    """Business registration application model"""
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('needs_revision', 'Needs Revision'),
    ]
    
    # Business Information
    business_name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=100)
    registration_number = models.CharField(max_length=100)
    tax_pin = models.CharField(max_length=50)
    location = models.CharField(max_length=255)
    monthly_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Owner Information
    owner_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    
    # Documents
    registration_certificate_url = models.URLField(max_length=500, blank=True)
    kra_pin_certificate_url = models.URLField(max_length=500, blank=True)
    id_document_url = models.URLField(max_length=500, blank=True)
    
    # Status and Approval
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_registrations')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.business_name} - {self.status}"


class IndividualRegistration(models.Model):
    """Individual user registration application model"""
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    # Personal Information
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    id_number = models.CharField(max_length=50)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Location
    country = models.CharField(max_length=100, default='Kenya')
    city = models.CharField(max_length=100)
    
    # Business Selection (optional - can be assigned later by admin)
    preferred_business = models.ForeignKey(Business, on_delete=models.SET_NULL, null=True, blank=True, related_name='individual_registrations')
    
    # Documents
    id_document_url = models.URLField(max_length=500, blank=True)
    
    # Status and Approval
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_individual_registrations')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Assigned business and role (set by admin during approval)
    assigned_business = models.ForeignKey(Business, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_individuals')
    assigned_role = models.CharField(max_length=20, choices=Membership.ROLE_CHOICES, default='staff')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.full_name} - {self.status}"