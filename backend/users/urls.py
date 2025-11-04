# backend/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BusinessViewSet, CustomerViewSet, me, register, profile_detail, profile_update, profile_create,
    admin_users_list, admin_dashboard_stats, admin_update_user_role, admin_register_user
)

router = DefaultRouter()
router.register(r'businesses', BusinessViewSet, basename='business')
router.register(r'customers', CustomerViewSet, basename='customer')

urlpatterns = [
    path('me/', me, name='me'),
    path('register/', register, name='register'),
    path('profile/', profile_detail, name='profile_detail'),
    path('profile/update/', profile_update, name='profile_update'),
    path('profile/create/', profile_create, name='profile_create'),
    # Admin endpoints
    path('admin/users/', admin_users_list, name='admin_users_list'),
    path('admin/users/register/', admin_register_user, name='admin_register_user'),
    path('admin/stats/', admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/users/<int:user_id>/role/', admin_update_user_role, name='admin_update_user_role'),
    path('', include(router.urls)),
]