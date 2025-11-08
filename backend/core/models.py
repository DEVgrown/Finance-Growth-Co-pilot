from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ActivityLog(models.Model):
    """Track all system activities for audit trail"""
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs')
    action = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=50, null=True, blank=True)
    resource_id = models.IntegerField(null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action']),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.user.email if self.user else 'System'} at {self.timestamp}"


class UserSession(models.Model):
    """Track active user sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"{self.user.email} - {self.ip_address}"


class FailedLoginAttempt(models.Model):
    """Track failed login attempts for security monitoring"""
    username = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    reason = models.CharField(max_length=255)
    attempted_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='failed_logins')
    
    class Meta:
        ordering = ['-attempted_at']
        indexes = [
            models.Index(fields=['-attempted_at']),
            models.Index(fields=['ip_address']),
        ]
    
    def __str__(self):
        return f"Failed login: {self.username} from {self.ip_address}"


class ModuleAssignment(models.Model):
    """Assign modules/features to businesses"""
    business = models.ForeignKey('users.Business', on_delete=models.CASCADE, related_name='module_assignments')
    module_id = models.CharField(max_length=50)
    module_name = models.CharField(max_length=100)
    enabled = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['business', 'module_id']
        ordering = ['business', 'module_name']
    
    def __str__(self):
        return f"{self.business.legal_name} - {self.module_name} ({'Enabled' if self.enabled else 'Disabled'})"
