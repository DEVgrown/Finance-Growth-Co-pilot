# Finance Growth Co-pilot 🚀

> **A comprehensive SME financial management platform with AI-powered insights**

Finance Growth Co-pilot is a production-ready financial management system designed specifically for Small and Medium Enterprises (SMEs) in Kenya. It combines modern financial tools with KAVI, an intelligent AI voice assistant that provides personalized business insights based on YOUR actual data.

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py makemigrations users  # Create user profile migrations
python manage.py migrate
python manage.py test_db  # Test database connection
python manage.py runserver
```

### API Testing
```bash
# Run comprehensive test suite
python manage.py test core.tests

# Run specific test modules
python manage.py test core.tests.test_user_api
python manage.py test core.tests.test_business_api
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

##  API Endpoints

### Authentication
- `POST /api/users/register/` - User registration with profile creation
- `POST /api/auth/token/` - JWT token obtain
- `POST /api/auth/token/refresh/` - JWT token refresh

### User Profile Management
- `GET /api/users/profile/` - Get user profile (creates if missing)
- `PATCH /api/users/profile/update/` - Partial profile update
- `PUT /api/users/profile/update/` - Full profile update
- `POST /api/users/profile/create/` - Create profile with initial data
- `GET /api/users/me/` - Get basic user info

### Business Management
- `GET /api/users/businesses/` - List user's businesses
- `POST /api/users/businesses/` - Create new business
- `GET /api/users/businesses/{id}/` - Get business details
- `PUT /api/users/businesses/{id}/` - Update business
- `DELETE /api/users/businesses/{id}/` - Delete business
- `POST /api/users/businesses/{id}/classify/` - AI business classification

### User Profile Features
- **Personal Info**: Phone, bio, avatar, date of birth
- **Professional**: Job title, company, industry, experience
- **Location**: Country, city, timezone
- **Preferences**: Language, currency, notifications
- **Financial**: Risk tolerance (conservative/moderate/aggressive)

### Business Profile Features
- **Company Details**: Legal name, DBA, website, founding year
- **Operations**: Employee count, HQ location, business model
- **Classification**: Industry, NAICS/SIC codes, revenue band
- **AI Analysis**: Automated business categorization with confidence scores

## 🧪 Testing

The project includes comprehensive test coverage:
- **User Registration & Authentication**: JWT token flow testing
- **Profile Management**: CRUD operations with validation
- **Business Management**: Owner-only access and data integrity
- **API Security**: Authentication requirements and error handling
- **Edge Cases**: Missing profiles, invalid data, unauthorized access

Run tests with:
```bash
python manage.py test core.tests
```

##  Project Status

### Completed (100%)
- **Backend Foundation**: Django 5.2.6 + DRF + PostgreSQL
- **User Management**: Registration, auth, profiles
- **Business Management**: Multi-tenant support
- **Role-Based Access**: 3-tier permission system
- **API Testing**: 95%+ test coverage
- **Database Integration**: Neon PostgreSQL
- **Authentication**: JWT with auto-refresh
- **Registration System**: Business & individual flows
- **Admin Approval**: Complete workflow
- **KAVI Integration**: Full user context
- **Mobile Responsive**: All screen sizes
- **Error Handling**: Comprehensive boundaries
- **Documentation**: Complete user & dev guides

### 🚧 In Progress (80%)
- **Frontend Polish**: Final UI refinements
- **Financial Features**: Core features implemented
- **Analytics**: Advanced reporting
- **Notifications**: Email/SMS integration

###  Planned
- **Bank Integration**: M-Pesa, bank accounts
- **Advanced Analytics**: AI-powered forecasting
- **Mobile Apps**: Native iOS/Android
- **Offline Mode**: Progressive Web App
- **Multi-Currency**: International support

##  Documentation

- **[User Guide](./USER_GUIDE.md)** - Complete user manual
- **[API Documentation](./API_DOCUMENTATION.md)** - API reference
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Role-Based System Guide](./ROLE_BASED_SYSTEM_GUIDE.md)** - RBAC explained
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[Project Summary](./PROJECT_SUMMARY.md)** - Complete overview

##  Quick Start

### For Users
1. Visit the registration page
2. Choose Business or Individual registration
3. Complete the form and upload documents
4. Wait for admin approval (24-48 hours)
5. Check email for login credentials
6. Login and start managing your finances!

### For Developers
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend setup (new terminal)
npm install
npm run dev
```

##  Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_ELEVENLABS_API_KEY=your-elevenlabs-key  # Optional
```

### Backend (.env)
```bash
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:pass@host/db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```


##  Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
npm run test
npm run lint
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Frontend: ESLint + Prettier
- Backend: PEP 8 + Black
- Commits: Conventional Commits
- Tests: Required for new features

## 📞 Support

- 📧 Email: jacksonmilees@gmail.com
- 💬 KAVI: Ask in-app
- 📚 Docs: Check guides first
- 🐛 Issues: GitHub Issues

##  Acknowledgments

- **Jackson Alex** - Creator and Lead Developer
- **JKUAT** - Educational foundation
- **Google Gemini** - AI capabilities
- **ElevenLabs** - Voice synthesis
- **Kenyan SME Community** - Inspiration

## License

This project is proprietary software. All rights reserved.

---

**Made with  for Kenyan SMEs**

*Empowering businesses to grow, one insight at a time.*
