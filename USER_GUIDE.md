# Finance Growth Co-Pilot - Complete User Guide

## 🚀 Welcome to Your SME Financial Assistant!

Finance Growth Co-Pilot is a comprehensive financial management platform designed specifically for Small and Medium Enterprises (SMEs) in Kenya. This guide will help you get started and make the most of all features.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Registration Process](#registration-process)
3. [Login & Authentication](#login--authentication)
4. [Dashboard Overview](#dashboard-overview)
5. [KAVI - Your AI Assistant](#kavi---your-ai-assistant)
6. [Financial Management](#financial-management)
7. [Team Management](#team-management)
8. [Mobile Usage](#mobile-usage)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Getting Started

### System Requirements
- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet Connection**: Stable connection required
- **Mobile**: iOS 12+ or Android 8+ for mobile access
- **Screen Resolution**: 320px minimum width (mobile-first design)

### First Time Setup
1. Navigate to the registration page
2. Choose your registration type (Business or Individual)
3. Complete the registration form
4. Wait for admin approval (24-48 hours)
5. Check your email for login credentials
6. Log in and start managing your finances!

---

## 📝 Registration Process

### Business Registration

**Step 1: Business Information**
- Business Name (e.g., "Mama Njeri Supplies")
- Business Type (Retail, Wholesale, Service, etc.)
- Location (City/Town)
- Registration Number
- KRA PIN
- Estimated Monthly Revenue

**Step 2: Owner Information**
- Full Name
- Email Address (will be used for login)
- Phone Number (Kenyan format: +254...)

**Step 3: Required Documents**
Upload clear copies of:
- Business Registration Certificate (PDF, JPG, or PNG)
- KRA PIN Certificate
- National ID or Passport

**What Happens Next?**
- Your application is submitted for review
- Super Admin reviews within 24-48 hours
- You receive an email with:
  - Approval/Rejection status
  - Login credentials (if approved)
  - Rejection reason (if rejected)

### Individual Registration

Perfect for employees who want to join an existing business.

**Required Information:**
- Full Name
- Email Address
- Phone Number
- ID Number
- Date of Birth
- City & Country
- ID Document (optional)

**What Happens Next?**
- Super Admin reviews your application
- You're assigned to a business
- You receive login credentials
- You can start working immediately

### Check Registration Status

Visit `/registration-status` and enter your email to check:
- ✅ **Approved**: Ready to login
- ⏳ **Pending**: Under review
- ❌ **Rejected**: See reason and reapply

---

## 🔐 Login & Authentication

### Logging In
1. Go to `/login`
2. Enter your username (provided via email)
3. Enter your password
4. Click "Login"

### First Login
- You'll be redirected to your dashboard based on your role
- **Super Admin** → Super Admin Dashboard
- **Business Admin** → Business Dashboard
- **Staff/Viewer** → User Dashboard

### Forgot Password?
Contact your Business Admin or Super Admin for password reset.

### Security Features
- JWT token-based authentication
- Automatic session refresh
- Secure password storage
- Role-based access control

---

## 📊 Dashboard Overview

### Super Admin Dashboard
**Access**: `/super-admin`

**Features:**
- 📈 System-wide statistics
- 👥 User management
- 🏢 Business management
- ✅ Registration approvals
- 💰 Financial overview (all businesses)

**Key Actions:**
- Approve/reject registrations
- Create new businesses
- Manage user roles
- View system health

### Business Admin Dashboard
**Access**: `/business/{businessId}/dashboard`

**Features:**
- 💰 Financial metrics (income, expenses, profit)
- 📄 Invoice management
- 👥 Customer overview
- 📊 Budget tracking
- 🎤 KAVI AI assistant
- 👨‍💼 Team management

**Key Actions:**
- Invite team members
- Create invoices
- Track transactions
- Manage budgets
- Access KAVI for insights

### User Dashboard
**Access**: `/dashboard`

**Features:**
- 📋 Personal work statistics
- ⚡ Quick actions
- 📝 Recent transactions
- 🎤 KAVI assistant (limited access)

**Key Actions:**
- Create invoices (if staff)
- Add transactions
- View assigned customers
- Get AI assistance

---

## 🎤 KAVI - Your AI Assistant

### What is KAVI?
KAVI (Kenyan AI Voice Interface) is your intelligent financial assistant that understands your business context and provides personalized insights.

### Features
✅ **Voice Conversation**: Talk naturally with KAVI
✅ **Real-Time Data**: Access to your actual business numbers
✅ **Personalized Insights**: Advice based on YOUR data
✅ **Multi-Language**: English, Swahili, and Sheng
✅ **Context-Aware**: Knows your role and permissions

### How to Use KAVI

**1. Access KAVI**
- Navigate to `/voice-assistant`
- Click the microphone icon
- Grant microphone permissions (first time only)

**2. Start Talking**
- Click the mic button to start
- Speak naturally in English, Swahili, or Sheng
- KAVI responds with voice and text

**3. What You Can Ask**
```
💰 Financial Questions:
- "How much did I make this week?"
- "What are my expenses this month?"
- "Show me my cash flow"
- "Do I have any overdue invoices?"

📊 Insights:
- "Give me financial insights"
- "How is my business performing?"
- "What should I focus on?"

📝 Actions (Business Admin/Staff):
- "Create an invoice for John"
- "Add a transaction"
- "Show me my customers"

🗣️ Casual:
- "Sasa KAVI, vipi?"
- "Tell me a joke"
- "What's the weather?"
```

### KAVI Knows About You
KAVI has access to:
- ✅ Your name and role
- ✅ Your business name
- ✅ Last 7 days financial data
- ✅ Last 30 days financial data
- ✅ Invoice status (overdue, pending)
- ✅ Recent transactions
- ✅ Your work summary

### Settings
Configure KAVI in Settings:
- **Gemini API Key**: Required for voice conversation
- **ElevenLabs API Key**: Optional for better voice quality
- **TTS Provider**: Choose voice output (Auto/Gemini/ElevenLabs)
- **Voice Style**: Adjust stability and similarity

---

## 💼 Financial Management

### Transactions
**Create Transaction:**
1. Go to Transactions page
2. Click "Add Transaction"
3. Fill in details:
   - Type (Income/Expense)
   - Amount (KES)
   - Date
   - Description
   - Category
4. Save

**View Transactions:**
- Filter by date range
- Filter by type
- Search by description
- Export to CSV

### Invoices
**Create Invoice:**
1. Go to Invoices page
2. Click "Create Invoice"
3. Fill in:
   - Customer details
   - Line items
   - Due date
   - Payment terms
4. Send to customer

**Invoice Status:**
- 📝 **Draft**: Not sent yet
- 📤 **Sent**: Awaiting payment
- ✅ **Paid**: Payment received
- ⚠️ **Overdue**: Past due date

### Cash Flow
- View 30-day forecast
- Track incoming payments
- Monitor outgoing expenses
- Get AI predictions

### Credit Score
- Business credit score calculation
- Payment history tracking
- Recommendations for improvement

---

## 👥 Team Management

### For Business Admins

**Invite Team Members:**
1. Go to Team page
2. Click "Invite Member"
3. Enter email and role:
   - **Business Admin**: Full access
   - **Staff**: Create/manage own work
   - **Viewer**: Read-only access
4. Send invitation

**Manage Members:**
- View all team members
- Change roles
- Deactivate members
- Track member activity

### For Team Members

**Accept Invitation:**
1. Check your email for invitation link
2. Click the link
3. Register (if new user)
4. Accept invitation
5. Start working!

**Your Permissions:**
- **Business Admin**: Everything
- **Staff**: Own invoices, transactions, customers
- **Viewer**: View-only access

---

## 📱 Mobile Usage

### Mobile-Optimized Features
✅ Responsive design (works on all screen sizes)
✅ Touch-friendly buttons (44px minimum)
✅ Swipe gestures
✅ Mobile-first navigation
✅ Fast loading times
✅ Offline capability (coming soon)

### Best Practices
- Use portrait mode for forms
- Use landscape for dashboards
- Enable location services for better experience
- Keep app updated
- Use WiFi for large uploads

### Mobile Tips
- **Voice Assistant**: Works great on mobile!
- **Quick Actions**: Swipe for shortcuts
- **Notifications**: Enable for important updates
- **Data Saver**: Use "Low Data Mode" if needed

---

## 🔧 Troubleshooting

### Common Issues

**1. Can't Login**
- ✅ Check username and password
- ✅ Ensure account is approved
- ✅ Clear browser cache
- ✅ Try different browser

**2. KAVI Not Responding**
- ✅ Check microphone permissions
- ✅ Verify Gemini API key is set
- ✅ Check internet connection
- ✅ Refresh the page

**3. Registration Pending**
- ✅ Wait 24-48 hours for review
- ✅ Check spam folder for emails
- ✅ Verify email address is correct
- ✅ Check status at `/registration-status`

**4. Data Not Loading**
- ✅ Refresh the page
- ✅ Check internet connection
- ✅ Clear browser cache
- ✅ Try incognito mode

**5. Mobile Issues**
- ✅ Update browser to latest version
- ✅ Clear app cache
- ✅ Check mobile data/WiFi
- ✅ Restart device

### Error Messages

**"Access Denied"**
- Your role doesn't have permission
- Contact Business Admin

**"Session Expired"**
- Login again
- Tokens expire after 24 hours

**"Network Error"**
- Check internet connection
- Backend server may be down
- Try again in a few minutes

### Getting Help

**For Users:**
- Contact your Business Admin
- Check this guide
- Email support (if available)

**For Business Admins:**
- Contact Super Admin
- Check API documentation
- Review system logs

**For Super Admins:**
- Check backend logs
- Review database status
- Contact technical support

---

## 🎓 Best Practices

### Financial Management
1. **Record Daily**: Enter transactions daily
2. **Reconcile Weekly**: Check against bank statements
3. **Review Monthly**: Analyze financial reports
4. **Plan Quarterly**: Set budgets and goals

### Team Collaboration
1. **Clear Roles**: Assign appropriate permissions
2. **Regular Updates**: Keep team informed
3. **Use KAVI**: Let AI help with insights
4. **Track Progress**: Monitor team performance

### Security
1. **Strong Passwords**: Use unique, complex passwords
2. **Regular Logout**: Don't stay logged in on shared devices
3. **Verify Emails**: Check sender before clicking links
4. **Report Issues**: Immediately report suspicious activity

---

## 📞 Support & Contact

### Need Help?
- 📧 Email: support@financegrowth.co.ke (example)
- 📱 Phone: +254 XXX XXX XXX (example)
- 💬 In-App: Use KAVI for quick questions
- 📚 Documentation: Check this guide first

### Feature Requests
Have an idea? Contact your Business Admin or Super Admin with:
- Feature description
- Use case
- Expected benefit

### Report Bugs
Found a bug? Report with:
- What you were doing
- What happened
- What you expected
- Screenshots (if possible)

---

## 🎉 Success Tips

### For Business Owners
1. ✅ Set up your business profile completely
2. ✅ Invite your team early
3. ✅ Use KAVI daily for insights
4. ✅ Review financial reports weekly
5. ✅ Keep documents organized

### For Team Members
1. ✅ Complete your profile
2. ✅ Learn your role permissions
3. ✅ Record transactions promptly
4. ✅ Communicate with your team
5. ✅ Use KAVI for quick answers

### For Everyone
1. ✅ Keep data accurate
2. ✅ Use mobile app for on-the-go access
3. ✅ Enable notifications
4. ✅ Explore all features
5. ✅ Provide feedback

---

## 🔄 Updates & Changelog

### Version 1.0 (Current)
- ✅ Complete registration system
- ✅ Role-based dashboards
- ✅ KAVI AI assistant with user context
- ✅ Financial management
- ✅ Team management
- ✅ Mobile-responsive design
- ✅ Real-time data sync

### Coming Soon
- 🔜 Email notifications
- 🔜 SMS alerts
- 🔜 Offline mode
- 🔜 Advanced analytics
- 🔜 Multi-currency support
- 🔜 Bank integrations

---

## 📄 Legal & Privacy

### Data Privacy
- Your data is encrypted
- We don't share with third parties
- You control your data
- GDPR compliant (where applicable)

### Terms of Service
- Use responsibly
- Accurate data only
- Respect team members
- Follow Kenyan laws

---

## 🌟 Quick Reference

### Keyboard Shortcuts
- `Ctrl + K`: Open KAVI
- `Ctrl + N`: New transaction
- `Ctrl + I`: New invoice
- `Ctrl + /`: Search

### URLs
- Login: `/login`
- Register: `/register`
- Dashboard: `/dashboard`
- KAVI: `/voice-assistant`
- Settings: `/settings`
- Status: `/registration-status`

### Roles
- 👑 **Super Admin**: System-wide access
- 🏢 **Business Admin**: Full business access
- 👨‍💼 **Staff**: Create & manage own work
- 👁️ **Viewer**: Read-only access

---

**Made with ❤️ for Kenyan SMEs**

*Last Updated: 2024*
*Version: 1.0*

---

## 🙏 Thank You!

Thank you for choosing Finance Growth Co-Pilot. We're committed to helping your business grow and succeed. If you have any questions, don't hesitate to reach out!

**Karibu sana! Let's grow together! 🚀**
