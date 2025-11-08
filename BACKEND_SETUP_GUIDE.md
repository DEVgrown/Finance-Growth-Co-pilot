# Backend Setup Guide - Super Admin Features

## 🚀 **Quick Setup Steps**

### 1. **Run Migrations**

```bash
cd backend

# Create migrations for new models
python manage.py makemigrations core

# Apply migrations
python manage.py migrate

# Create superuser (if not already created)
python manage.py createsuperuser
```

### 2. **Register Models in Admin** (Optional)

Edit `backend/core/admin.py`:

```python
from django.contrib import admin
from .models import ActivityLog, UserSession, FailedLoginAttempt, ModuleAssignment

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'user', 'timestamp', 'severity', 'ip_address']
    list_filter = ['severity', 'timestamp', 'resource_type']
    search_fields = ['action', 'user__email', 'details']
    date_hierarchy = 'timestamp'

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'ip_address', 'is_active', 'created_at', 'last_activity']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__email', 'ip_address']

@admin.register(FailedLoginAttempt)
class FailedLoginAttemptAdmin(admin.ModelAdmin):
    list_display = ['username', 'ip_address', 'reason', 'attempted_at']
    list_filter = ['attempted_at']
    search_fields = ['username', 'email', 'ip_address']
    date_hierarchy = 'attempted_at'

@admin.register(ModuleAssignment)
class ModuleAssignmentAdmin(admin.ModelAdmin):
    list_display = ['business', 'module_name', 'enabled', 'assigned_at']
    list_filter = ['enabled', 'module_id']
    search_fields = ['business__legal_name', 'module_name']
```

### 3. **Test the Endpoints**

```bash
# Start the server
python manage.py runserver

# Test endpoints (in another terminal)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/core/admin/activity-logs/
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/core/admin/active-sessions/
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/core/admin/security-logs/
```

---

## 📋 **Created Files**

### Backend Files:
1. ✅ `backend/core/models.py` - 4 new models
2. ✅ `backend/core/serializers.py` - 4 new serializers
3. ✅ `backend/core/views.py` - 9 new endpoints
4. ✅ `backend/core/urls.py` - URL configuration
5. ✅ `backend/FG_copilot/urls.py` - Updated to include core URLs

### Frontend Files:
1. ✅ `src/pages/admin/SecurityModule.jsx` - Security monitoring
2. ✅ `src/pages/admin/ActivityLogs.jsx` - Activity tracking
3. ✅ `src/pages/admin/ModuleAssignment.jsx` - Feature control
4. ✅ `src/routes.jsx` - Updated with new routes

---

## 🔌 **API Endpoints Created**

### Security & Monitoring:
```
GET  /api/core/admin/security-logs/
GET  /api/core/admin/active-sessions/
POST /api/core/admin/sessions/{id}/terminate/
GET  /api/core/admin/failed-logins/
POST /api/core/admin/users/{id}/lock/
```

### Activity Logs:
```
GET  /api/core/admin/activity-logs/
     ?type=login|user|business|document|settings
     &user={user_id}
     &range=today|week|month|all
```

### Module Assignment:
```
GET  /api/core/admin/businesses/
GET  /api/core/admin/businesses/{id}/modules/
POST /api/core/admin/businesses/{id}/modules/{module_id}/
     data: { enabled: true|false }
```

---

## 🗄️ **Database Models**

### 1. ActivityLog
- Tracks all system activities
- Fields: user, action, resource_type, resource_id, details, ip_address, user_agent, timestamp, severity
- Indexed by timestamp, user, and action

### 2. UserSession
- Tracks active user sessions
- Fields: user, session_key, ip_address, user_agent, created_at, last_activity, is_active
- Indexed by last_activity

### 3. FailedLoginAttempt
- Tracks failed login attempts
- Fields: username, email, ip_address, reason, attempted_at, user
- Indexed by attempted_at and ip_address

### 4. ModuleAssignment
- Assigns modules to businesses
- Fields: business, module_id, module_name, enabled, assigned_at, assigned_by, updated_at
- Unique constraint on (business, module_id)

---

## 🔒 **Security Features**

### Authentication:
- All endpoints require authentication
- Super admin check on all endpoints
- Returns 403 if not super admin

### Activity Logging:
- All actions are logged automatically
- IP addresses tracked
- User agents recorded
- Severity levels (info, warning, critical)

### Session Management:
- Track active sessions
- Terminate sessions remotely
- Monitor session activity

---

## 🧪 **Testing Checklist**

### After Migration:
- [ ] Run `python manage.py makemigrations core`
- [ ] Run `python manage.py migrate`
- [ ] Verify tables created in database
- [ ] Create test data (optional)

### Test Endpoints:
- [ ] Login as super admin
- [ ] Test security logs endpoint
- [ ] Test active sessions endpoint
- [ ] Test activity logs endpoint
- [ ] Test module assignment endpoints
- [ ] Verify permissions (non-super admin should get 403)

### Test Frontend:
- [ ] Navigate to `/super-admin/security`
- [ ] Navigate to `/super-admin/logs`
- [ ] Navigate to `/super-admin/settings`
- [ ] Verify data loads
- [ ] Test real-time updates
- [ ] Test actions (terminate session, lock account, etc.)

---

## 🐛 **Troubleshooting**

### Issue: Migration errors
```bash
# Reset migrations (CAREFUL - only in development)
python manage.py migrate core zero
python manage.py makemigrations core
python manage.py migrate core
```

### Issue: 403 Forbidden
- Ensure user is superuser: `user.is_superuser = True`
- Check authentication token is valid
- Verify token is being sent in headers

### Issue: No data showing
- Check if models have data
- Run: `python manage.py shell`
```python
from core.models import ActivityLog
ActivityLog.objects.count()  # Should return number of logs
```

### Issue: CORS errors
- Verify CORS settings in `settings.py`
- Check `CORS_ALLOWED_ORIGINS` includes frontend URL

---

## 📝 **Sample Data (Optional)**

Create sample data for testing:

```python
# backend/core/management/commands/create_sample_data.py
from django.core.management.base import BaseCommand
from core.models import ActivityLog, UserSession, FailedLoginAttempt
from users.models import User
from django.utils import timezone

class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **kwargs):
        # Create sample activity logs
        user = User.objects.first()
        for i in range(20):
            ActivityLog.objects.create(
                user=user,
                action=f"Test action {i}",
                resource_type="test",
                details="Sample activity log",
                ip_address="127.0.0.1",
                severity='info'
            )
        
        self.stdout.write(self.style.SUCCESS('Sample data created!'))
```

Run with: `python manage.py create_sample_data`

---

## ✅ **Verification**

After setup, verify everything works:

1. **Check migrations:**
   ```bash
   python manage.py showmigrations core
   ```

2. **Check models:**
   ```bash
   python manage.py shell
   >>> from core.models import ActivityLog, UserSession, FailedLoginAttempt, ModuleAssignment
   >>> ActivityLog.objects.count()
   >>> UserSession.objects.count()
   ```

3. **Check endpoints:**
   - Visit: http://localhost:8000/api/core/admin/activity-logs/
   - Should return JSON (with authentication)

4. **Check frontend:**
   - Navigate to: http://localhost:5173/super-admin/security
   - Should load without errors

---

## 🎉 **Success!**

If all steps complete successfully, you now have:
- ✅ 4 new database models
- ✅ 9 new API endpoints
- ✅ 3 new frontend modules
- ✅ Real-time monitoring
- ✅ Security features
- ✅ Activity tracking
- ✅ Module assignment

**Your Super Admin Dashboard is now fully functional!** 🚀
