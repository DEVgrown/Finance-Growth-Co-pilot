# backend/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BusinessViewSet, me, register, profile_detail, profile_update, profile_create

router = DefaultRouter()
router.register(r'businesses', BusinessViewSet, basename='business')

urlpatterns = [
    path('me/', me, name='me'),
    path('register/', register, name='register'),
    path('profile/', profile_detail, name='profile_detail'),
    path('profile/update/', profile_update, name='profile_update'),
    path('profile/create/', profile_create, name='profile_create'),
    path('', include(router.urls)),
]