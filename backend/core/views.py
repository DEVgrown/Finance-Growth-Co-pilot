from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ActivityLog, UserSession, FailedLoginAttempt, ModuleAssignment
from .serializers import (
    ActivityLogSerializer, UserSessionSerializer,
    FailedLoginAttemptSerializer, ModuleAssignmentSerializer
)
from users.models import Business

@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def test_cors(request):
    """Test endpoint for CORS"""
    if request.method == "OPTIONS":
        response = JsonResponse({"message": "CORS preflight"})
        response["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    
    return JsonResponse({"message": "CORS test successful", "method": request.method})


def root_view(request):
    """Root endpoint - API information"""
    return JsonResponse({
        "message": "Finance Growth Co-pilot API",
        "version": "1.0.0",
        "endpoints": {
            "admin": "/admin/",
            "api": {
                "users": "/api/users/",
                "finance": "/api/finance/",
                "auth": {
                    "token": "/api/auth/token/",
                    "refresh": "/api/auth/token/refresh/"
                }
            },
            "docs": "See API_DOCUMENTATION.md for details"
        },
        "frontend": "http://localhost:3000",
        "status": "running"
    })


# Helper function to check if user is super admin
def is_super_admin(user):
    return user.is_authenticated and user.is_superuser


# ==================== SECURITY & MONITORING ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def security_logs(request):
    """Get security-related activity logs"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get logs with warning or critical severity
    logs = ActivityLog.objects.filter(
        severity__in=['warning', 'critical']
    ).select_related('user')[:100]
    
    serializer = ActivityLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_sessions(request):
    """Get all active user sessions"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    sessions = UserSession.objects.filter(
        is_active=True
    ).select_related('user').order_by('-last_activity')
    
    serializer = UserSessionSerializer(sessions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def terminate_session(request, session_id):
    """Terminate a user session"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        session = UserSession.objects.get(id=session_id)
        session.is_active = False
        session.save()
        
        # Log the action
        ActivityLog.objects.create(
            user=request.user,
            action=f"Terminated session for {session.user.email}",
            resource_type="session",
            resource_id=session_id,
            details=f"Session from {session.ip_address}",
            ip_address=get_client_ip(request),
            severity='warning'
        )
        
        return Response({"message": "Session terminated successfully"})
    except UserSession.DoesNotExist:
        return Response(
            {"error": "Session not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def failed_logins(request):
    """Get failed login attempts from last 24 hours"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get failed logins from last 24 hours
    since = timezone.now() - timedelta(hours=24)
    attempts = FailedLoginAttempt.objects.filter(
        attempted_at__gte=since
    ).order_by('-attempted_at')
    
    serializer = FailedLoginAttemptSerializer(attempts, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lock_user_account(request, user_id):
    """Lock a user account"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from users.models import User
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()
        
        # Log the action
        ActivityLog.objects.create(
            user=request.user,
            action=f"Locked account for {user.email}",
            resource_type="user",
            resource_id=user_id,
            details="Account locked due to security concerns",
            ip_address=get_client_ip(request),
            severity='critical'
        )
        
        return Response({"message": "Account locked successfully"})
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# ==================== ACTIVITY LOGS ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_logs(request):
    """Get activity logs with filtering"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    logs = ActivityLog.objects.select_related('user').all()
    
    # Apply filters
    action_type = request.GET.get('type')
    user_id = request.GET.get('user')
    date_range = request.GET.get('range', 'today')
    
    # Filter by action type
    if action_type and action_type != 'all':
        logs = logs.filter(action__icontains=action_type)
    
    # Filter by user
    if user_id and user_id != 'all':
        logs = logs.filter(user_id=user_id)
    
    # Filter by date range
    now = timezone.now()
    if date_range == 'today':
        logs = logs.filter(timestamp__date=now.date())
    elif date_range == 'week':
        week_ago = now - timedelta(days=7)
        logs = logs.filter(timestamp__gte=week_ago)
    elif date_range == 'month':
        month_ago = now - timedelta(days=30)
        logs = logs.filter(timestamp__gte=month_ago)
    
    # Limit to last 100 logs
    logs = logs[:100]
    
    serializer = ActivityLogSerializer(logs, many=True)
    return Response(serializer.data)


# ==================== MODULE ASSIGNMENT ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_businesses(request):
    """List all businesses for module assignment"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    businesses = Business.objects.all().order_by('legal_name')
    
    data = [{
        'id': b.id,
        'legal_name': b.legal_name,
        'business_type': b.business_type,
        'created_at': b.created_at
    } for b in businesses]
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def business_modules(request, business_id):
    """Get module assignments for a business"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        business = Business.objects.get(id=business_id)
        assignments = ModuleAssignment.objects.filter(business=business)
        
        serializer = ModuleAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    except Business.DoesNotExist:
        return Response(
            {"error": "Business not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_module(request, business_id, module_id):
    """Enable or disable a module for a business"""
    if not is_super_admin(request.user):
        return Response(
            {"error": "Super admin access required"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        business = Business.objects.get(id=business_id)
        enabled = request.data.get('enabled', True)
        
        # Module names mapping
        module_names = {
            'transactions': 'Transactions',
            'invoices': 'Invoices',
            'reports': 'Reports & Analytics',
            'team': 'Team Management',
            'settings': 'Settings'
        }
        
        # Get or create module assignment
        assignment, created = ModuleAssignment.objects.get_or_create(
            business=business,
            module_id=module_id,
            defaults={
                'module_name': module_names.get(module_id, module_id.title()),
                'enabled': enabled,
                'assigned_by': request.user
            }
        )
        
        if not created:
            assignment.enabled = enabled
            assignment.save()
        
        # Log the action
        ActivityLog.objects.create(
            user=request.user,
            action=f"{'Enabled' if enabled else 'Disabled'} {module_id} module for {business.legal_name}",
            resource_type="module_assignment",
            resource_id=assignment.id,
            details=f"Module: {module_id}, Business: {business.legal_name}",
            ip_address=get_client_ip(request),
            severity='info'
        )
        
        serializer = ModuleAssignmentSerializer(assignment)
        return Response(serializer.data)
    except Business.DoesNotExist:
        return Response(
            {"error": "Business not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# ==================== HELPER FUNCTIONS ====================

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_activity(user, action, resource_type=None, resource_id=None, details=None, request=None, severity='info'):
    """Helper function to log activities"""
    ActivityLog.objects.create(
        user=user,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
        severity=severity
    )