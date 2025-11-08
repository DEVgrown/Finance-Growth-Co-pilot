# Finance Growth Co-Pilot - Deployment Guide

## 🚀 Production Deployment Guide

This guide covers deploying the Finance Growth Co-Pilot application to production.

---

## 📋 Pre-Deployment Checklist

### Backend Requirements
- [ ] Python 3.10+ installed
- [ ] PostgreSQL database (Neon or local)
- [ ] Environment variables configured
- [ ] All migrations run
- [ ] Super admin user created
- [ ] Static files collected
- [ ] CORS settings configured

### Frontend Requirements
- [ ] Node.js 18+ installed
- [ ] Environment variables set
- [ ] API endpoints configured
- [ ] Build tested locally
- [ ] Assets optimized

### Security Checklist
- [ ] DEBUG = False in production
- [ ] Strong SECRET_KEY set
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Database credentials secure
- [ ] API keys in environment variables

---

## 🔧 Backend Deployment

### 1. Environment Setup

Create `.env` file in `backend/` directory:

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email Settings (Optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# JWT Settings
SIMPLE_JWT_SIGNING_KEY=your-jwt-signing-key
```

### 2. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Super Admin

```bash
python manage.py createsuperuser
```

### 5. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 6. Test Backend

```bash
python manage.py runserver
# Visit http://localhost:8000/api/
```

### 7. Deploy to Production

#### Option A: Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables in Railway dashboard

#### Option B: Render

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: finance-growth-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn FG_copilot.wsgi:application
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: finance-growth-db
          property: connectionString
```

2. Push to GitHub and connect to Render

#### Option C: Heroku

```bash
heroku create finance-growth-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

---

## 🎨 Frontend Deployment

### 1. Environment Setup

Create `.env` file in root directory:

```bash
# API Configuration
VITE_API_URL=https://your-backend-url.com/api

# Gemini AI (for KAVI)
VITE_GEMINI_API_KEY=your-gemini-api-key

# Optional: ElevenLabs
VITE_ELEVENLABS_API_KEY=your-elevenlabs-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build for Production

```bash
npm run build
```

This creates optimized files in `dist/` folder.

### 4. Test Build Locally

```bash
npm run preview
```

### 5. Deploy to Production

#### Option A: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Add environment variables in Vercel dashboard

#### Option B: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Configure environment variables

#### Option C: GitHub Pages

```bash
npm run build
# Push dist/ folder to gh-pages branch
```

---

## 🔐 Security Configuration

### 1. HTTPS Setup

**Using Cloudflare (Free):**
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

**Using Let's Encrypt:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. CORS Configuration

In `backend/FG_copilot/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

### 3. Database Security

- Use strong passwords
- Enable SSL connections
- Regular backups
- Limit database access by IP

### 4. API Keys

- Never commit API keys to Git
- Use environment variables
- Rotate keys regularly
- Use different keys for dev/prod

---

## 📊 Monitoring & Maintenance

### 1. Error Tracking

**Sentry Integration:**

```bash
pip install sentry-sdk
```

In `settings.py`:
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### 2. Performance Monitoring

- Use Django Debug Toolbar (dev only)
- Monitor database query performance
- Track API response times
- Monitor memory usage

### 3. Logging

Configure in `settings.py`:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': 'errors.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

### 4. Backups

**Database Backups:**
```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**Media Files:**
- Use cloud storage (AWS S3, Cloudinary)
- Regular automated backups

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm i -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          npm install
          npm run build
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📱 Mobile App (PWA)

### 1. Add PWA Support

Create `public/manifest.json`:

```json
{
  "name": "Finance Growth Co-Pilot",
  "short_name": "FinGrowth",
  "description": "SME Financial Management",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker

Create `public/sw.js`:

```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
      ]);
    })
  );
});
```

---

## 🧪 Testing Before Deployment

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
npm run test
npm run lint
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://your-api.com/api/users/me/
```

---

## 🚨 Troubleshooting

### Common Issues

**1. CORS Errors**
- Check CORS_ALLOWED_ORIGINS
- Verify frontend URL is correct
- Check browser console for details

**2. Database Connection Failed**
- Verify DATABASE_URL
- Check database is running
- Verify SSL settings

**3. Static Files Not Loading**
- Run `collectstatic`
- Check STATIC_ROOT setting
- Verify file permissions

**4. 500 Server Error**
- Check error logs
- Verify all migrations run
- Check environment variables

---

## 📞 Support

For deployment issues:
- Check logs first
- Review this guide
- Contact DevOps team
- Check platform documentation

---

**Last Updated: 2024**
**Version: 1.0**
