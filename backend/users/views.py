from django.shortcuts import render
# backend/users/views.py
from django.utils.timezone import now
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import Business, UserProfile
from .serializers import BusinessSerializer, UserSerializer, RegisterSerializer, UserProfileSerializer, UserProfileUpdateSerializer
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
            # Return empty list for demo mode
            return Business.objects.none()
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
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create user profile automatically
        UserProfile.objects.get_or_create(user=user)
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