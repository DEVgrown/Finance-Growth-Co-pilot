# Finance Growth Co-pilot

A proactive assistant that keeps SMEs solvent and growing through intelligent financial management and growth strategies.

## 🚀 Project Overview

We are building a comprehensive SME Finance and Growth Co-pilot that provides:
- Real-time financial health monitoring
- Proactive growth recommendations
- Automated financial insights
- Strategic business guidance

## 📋 Current Progress

### ✅ Backend Infrastructure (Django)
- **Framework**: Django 5.2.6 with Django REST Framework
- **Database**: PostgreSQL with Neon cloud database integration
- **Authentication**: JWT-based authentication with SimpleJWT
- **CORS**: Configured for frontend-backend communication
- **Environment**: Secure environment variable management with python-dotenv
- **Database Testing**: Custom management command for database connection testing

#### Backend Features Implemented:
- ✅ PostgreSQL database connection to Neon
- ✅ Environment variable configuration
- ✅ Database connection testing command (`python manage.py test_db`)
- ✅ JWT authentication setup with SimpleJWT
- ✅ CORS headers configuration
- ✅ Core Django app structure
- ✅ User registration and authentication API
- ✅ Comprehensive user profile management system
- ✅ Business entity management with classification
- ✅ RESTful API endpoints for all features
- ✅ Comprehensive test suite with 95%+ coverage
- ✅ API documentation and Postman collection

### ✅ Frontend Foundation (Vue.js)
- **Framework**: Vue 3 with Vite build tool
- **Development**: Hot reload development server
- **Build**: Production-ready build system

#### Frontend Features Implemented:
- ✅ Vue 3 application setup
- ✅ Vite development environment
- ✅ Basic application structure

## 🛠️ Technology Stack

### Backend
- **Django 5.2.6** - Web framework
- **Django REST Framework 3.16.1** - API development
- **PostgreSQL** - Database (hosted on Neon)
- **JWT Authentication** - Secure user authentication with SimpleJWT
- **User Profiles** - Extended user data with financial preferences
- **Business Management** - Company profiles with AI classification
- **Python 3.10+** - Programming language

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Modern JavaScript** - ES6+ features

## 🚧 Next Steps

### Immediate Priorities
1. **Financial Data Models**: Create transaction, budget, and forecast models
2. **Financial APIs**: Build RESTful APIs for financial data management
3. **Frontend Components**: Develop Vue components for financial dashboards
4. **Dashboard Integration**: Connect frontend to user profile and business APIs
5. **Financial Calculations**: Add core financial analysis algorithms
6. **AI Integration**: Enhance business classification with more sophisticated models

### Future Features
- Real-time financial monitoring
- AI-powered growth recommendations
- Automated report generation
- Integration with banking APIs
- Mobile-responsive design

## 🏃‍♂️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 20.19.0+ or 22.12.0+
- PostgreSQL database (Neon account)

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

## 🔌 API Endpoints

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

## 📊 Project Status
- **Backend Foundation**: 100% Complete
- **User Management**: 100% Complete
- **Business Management**: 100% Complete
- **API Testing**: 100% Complete
- **Database Integration**: 100% Complete
- **Authentication Setup**: 100% Complete
- **Frontend Foundation**: 60% Complete
- **Financial Features**: 0% Complete

## 🤝 Contributing
This project is in active development. More detailed contribution guidelines will be added as the project matures.