from django.shortcuts import render
# backend/users/views.py
from django.utils.timezone import now
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import Business, UserProfile, Customer
from .serializers import (
    BusinessSerializer, UserSerializer, RegisterSerializer, 
    UserProfileSerializer, UserProfileUpdateSerializer,
    CustomerSerializer, CustomerCreateSerializer
)
from core.services.firecrawl import classify_business_from_website
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny


# Create your views here.
class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return getattr(obj, 'owner_id', None) == request.user.id

class BusinessViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            # Serve demo data for unauthenticated users if seed_user exists
            return Business.objects.filter(owner__username='seed_user').order_by('-created_at')
        return Business.objects.filter(owner=self.request.user).order_by('-created_at')
    
    def get_permissions(self):
        # Allow list access for unauthenticated users (demo mode)
        if self.action == 'list':
            return [AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def classify(self, request, pk=None):
        business = self.get_object()
        website = business.website or request.data.get('website')
        category, confidence, tags = classify_business_from_website(website)
        business.classified_category = category
        business.classified_confidence = confidence
        business.classified_tags = tags
        business.last_classified_at = now()
        business.save(update_fields=['classified_category', 'classified_confidence', 'classified_tags', 'last_classified_at'])
        return Response(self.get_serializer(business).data)

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow anonymous access
def me(request):
    """Get current user or return demo user if not authenticated"""
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
    else:
        # Return demo user data for unauthenticated requests
        return Response({
            'id': None,
            'username': 'demo_user',
            'email': 'demo@example.com',
            'first_name': 'Demo',
            'last_name': 'User',
            'full_name': 'Demo User',
            'is_authenticated': False
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Public registration - Note: In production, this should be disabled or require approval"""
    # For now, we'll keep this but document that admin registration is preferred
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create user profile automatically with default 'owner' role
        profile, created = UserProfile.objects.get_or_create(user=user)
        # Optional: return JWT tokens after registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_detail(request):
    """Get user profile details"""
    try:
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist
        profile = UserProfile.objects.create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def profile_update(request):
    """Update user profile (PUT for full update, PATCH for partial)"""
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    
    partial = request.method == 'PATCH'
    serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=partial)
    
    if serializer.is_valid():
        serializer.save()
        # Return updated profile data
        profile_serializer = UserProfileSerializer(profile)
        return Response(profile_serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def profile_create(request):
    """Create user profile (if it doesn't exist)"""
    try:
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        serializer = UserProfileUpdateSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save(user=request.user)
            profile_serializer = UserProfileSerializer(profile)
            return Response(profile_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsAdmin(permissions.BasePermission):
    """Permission check for admin users"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            profile = request.user.profile
            return profile.role == 'admin' or request.user.is_superuser
        except UserProfile.DoesNotExist:
            return request.user.is_superuser


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_users_list(request):
    """Get all users (admin only)"""
    users = User.objects.all()
    user_data = []
    for user in users:
        try:
            profile = user.profile
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'role': profile.role,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
                'businesses_count': user.businesses.count(),
                'last_login': user.last_login
            })
        except UserProfile.DoesNotExist:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'role': 'owner',
                'is_active': user.is_active,
                'date_joined': user.date_joined,
                'businesses_count': user.businesses.count(),
                'last_login': user.last_login
            })
    return Response(user_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard_stats(request):
    """Get admin dashboard statistics"""
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    total_businesses = Business.objects.count()
    admin_users = UserProfile.objects.filter(role='admin').count()
    data_entry_users = UserProfile.objects.filter(role='data_entry').count()
    owner_users = UserProfile.objects.filter(role='owner').count()
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': total_users - active_users,
        'total_businesses': total_businesses,
        'admin_users': admin_users,
        'data_entry_users': data_entry_users,
        'owner_users': owner_users,
        'recent_users': User.objects.order_by('-date_joined')[:10].values('id', 'username', 'email', 'date_joined')
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_register_user(request):
    """Register a new user (admin only) - Admin assigns username and password"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create user profile automatically
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Set role if provided (default is 'owner' from model)
        role = request.data.get('role', 'owner')
        if role in ['owner', 'data_entry', 'admin']:
            profile.role = role
            profile.save()
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': profile.role,
            'message': 'User registered successfully. Username and password assigned by admin.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'PUT'])
@permission_classes([IsAdmin])
def admin_update_user_role(request, user_id):
    """Update user role (admin only)"""
    try:
        user = User.objects.get(id=user_id)
        profile, created = UserProfile.objects.get_or_create(user=user)
        new_role = request.data.get('role')
        
        if new_role not in ['owner', 'data_entry', 'admin']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile.role = new_role
        profile.save()
        
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class IsCustomerOwner(permissions.BasePermission):
    """Permission to only allow owners to access their customers"""
    def has_object_permission(self, request, view, obj):
        return getattr(obj, 'owner_id', None) == request.user.id


class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for managing customers/clients"""
    permission_classes = [permissions.IsAuthenticated, IsCustomerOwner]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CustomerCreateSerializer
        return CustomerSerializer
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Customer.objects.none()
        return Customer.objects.filter(owner=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        # Get user's first business if available
        business = None
        try:
            business = Business.objects.filter(owner=self.request.user).first()
        except Business.DoesNotExist:
            pass
        
        serializer.save(
            owner=self.request.user,
            business=business,
            onboarded_by=self.request.user,
            status=self.request.data.get('status', 'active')
        )