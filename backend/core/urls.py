from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Security & Monitoring
    path('admin/security-logs/', views.security_logs, name='security-logs'),
    path('admin/active-sessions/', views.active_sessions, name='active-sessions'),
    path('admin/sessions/<int:session_id>/terminate/', views.terminate_session, name='terminate-session'),
    path('admin/failed-logins/', views.failed_logins, name='failed-logins'),
    path('admin/users/<int:user_id>/lock/', views.lock_user_account, name='lock-user'),
    
    # Activity Logs
    path('admin/activity-logs/', views.activity_logs, name='activity-logs'),
    
    # Module Assignment
    path('admin/businesses/', views.list_businesses, name='list-businesses'),
    path('admin/businesses/<int:business_id>/modules/', views.business_modules, name='business-modules'),
    path('admin/businesses/<int:business_id>/modules/<str:module_id>/', views.toggle_module, name='toggle-module'),
]
