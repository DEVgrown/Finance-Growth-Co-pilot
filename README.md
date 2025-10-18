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
- ✅ JWT authentication setup
- ✅ CORS headers configuration
- ✅ Core Django app structure

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
- **JWT Authentication** - Secure user authentication
- **Python 3.10+** - Programming language

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Modern JavaScript** - ES6+ features

## 🚧 Next Steps

### Immediate Priorities
1. **Database Models**: Create financial data models (transactions, budgets, forecasts)
2. **API Endpoints**: Build RESTful APIs for financial data management
3. **Frontend Components**: Develop Vue components for financial dashboards
4. **Authentication Flow**: Implement user registration and login
5. **Financial Calculations**: Add core financial analysis algorithms

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
python manage.py migrate
python manage.py test_db  # Test database connection
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📊 Project Status
- **Backend Foundation**: 80% Complete
- **Frontend Foundation**: 60% Complete
- **Database Integration**: 100% Complete
- **Authentication Setup**: 70% Complete
- **Core Features**: 0% Complete

## 🤝 Contributing
This project is in active development. More detailed contribution guidelines will be added as the project matures.