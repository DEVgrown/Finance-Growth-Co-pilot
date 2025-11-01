export const createPageUrl = (pageName) => {
  const urlMap = {
    'Dashboard': '/dashboard',
    'Transactions': '/transactions',
    'Invoices': '/invoices',
    'CashFlow': '/cash-flow',
    'Suppliers': '/suppliers',
    'Credit': '/credit',
    'Insights': '/insights',
    'Settings': '/settings',
    'VoiceAssistant': '/voice-assistant',
    'ProactiveAlerts': '/proactive-alerts',
    'CustomerPortal': '/customer-portal',
    'Register': '/register',
    'ElevenLabs': '/elevenlabs'
  };
  
  return urlMap[pageName] || '/';
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};


