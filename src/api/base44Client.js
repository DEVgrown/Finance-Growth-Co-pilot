// API client that uses Django backend
// This maintains compatibility with existing code while connecting to real backend
import apiClient from '../lib/apiClient';

const mockData = {
  user: {
    id: 1,
    email: 'demo@financegrowth.com',
    full_name: 'Demo User',
    business_name: 'Demo Business'
  },
  business: {
    id: 1,
    business_name: 'Demo Business',
    business_type: 'retail',
    monthly_revenue: 500000,
    credit_score: 75,
    onboarding_completed: true
  },
  transactions: [
    {
      id: 1,
      type: 'income',
      amount: 50000,
      category: 'sales',
      description: 'Product sales',
      transaction_date: '2024-01-15',
      source: 'mpesa',
      party_name: 'Customer A'
    },
    {
      id: 2,
      type: 'expense',
      amount: 15000,
      category: 'rent',
      description: 'Office rent',
      transaction_date: '2024-01-10',
      source: 'bank',
      party_name: 'Landlord'
    }
  ],
  invoices: [
    {
      id: 1,
      invoice_number: 'INV-001',
      customer_name: 'Customer A',
      total_amount: 50000,
      status: 'paid',
      issue_date: '2024-01-01',
      due_date: '2024-01-31'
    }
  ],
  insights: [
    {
      id: 1,
      insight_type: 'cash_flow',
      title: 'Cash Flow Optimization',
      description: 'Consider implementing better payment terms',
      priority: 'high',
      is_read: false
    }
  ],
  alerts: [
    {
      id: 1,
      alert_type: 'overdue_invoice',
      priority: 'critical',
      title: 'Overdue Invoice',
      message: 'Invoice INV-002 is 30 days overdue',
      status: 'active'
    }
  ]
};

const makeFallback = () => {
  return {
    entities: {
      Business: {
        list: async (...args) => {
          try {
            return await apiClient.getBusinesses();
          } catch (error) {
            console.error('Error fetching businesses:', error);
            return [];
          }
        },
        create: async (data) => {
          return await apiClient.createBusiness(data);
        },
        get: async (id) => {
          return await apiClient.getBusiness(id);
        }
      },
      Transaction: {
        list: async (orderBy, limit) => {
          try {
            const params = {};
            if (orderBy) params.ordering = orderBy;
            if (limit) params.limit = limit;
            return await apiClient.getTransactions(params);
          } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
          }
        },
        create: async (data) => {
          return await apiClient.createTransaction(data);
        },
        get: async (id) => {
          return await apiClient.getTransaction(id);
        }
      },
      Invoice: {
        list: async (orderBy, limit) => {
          try {
            const params = {};
            if (orderBy) params.ordering = orderBy;
            if (limit) params.limit = limit;
            return await apiClient.getInvoices(params);
          } catch (error) {
            console.error('Error fetching invoices:', error);
            return [];
          }
        },
        create: async (data) => {
          return await apiClient.createInvoice(data);
        },
        get: async (id) => {
          return await apiClient.getInvoice(id);
        }
      },
      Supplier: {
        list: async (...args) => {
          // TODO: Implement supplier API endpoint
          try {
            // Placeholder - will need to add supplier endpoint to backend
            return [];
          } catch (error) {
            console.error('Error fetching suppliers:', error);
            return [];
          }
        }
      },
      CashFlowForecast: {
        list: async (orderBy, limit) => {
          try {
            return await apiClient.getCashFlowForecasts();
          } catch (error) {
            console.error('Error fetching cash flow forecasts:', error);
            return [];
          }
        }
      },
      VoiceConversation: {
        list: async (...args) => {
          // Voice conversations might be stored locally for now
          try {
            const stored = localStorage.getItem('voice_conversations');
            return stored ? JSON.parse(stored) : [];
          } catch (error) {
            return [];
          }
        },
        create: async (data) => {
          try {
            const stored = localStorage.getItem('voice_conversations') || '[]';
            const conversations = JSON.parse(stored);
            const newConversation = { id: Date.now(), ...data };
            conversations.push(newConversation);
            localStorage.setItem('voice_conversations', JSON.stringify(conversations));
            return newConversation;
          } catch (error) {
            console.error('Error saving voice conversation:', error);
            return { id: Date.now(), ...data };
          }
        }
      },
      ProactiveAlert: {
        list: async (...args) => {
          // TODO: Implement proactive alerts API endpoint
          return [];
        }
      },
      AIInsight: {
        list: async (...args) => {
          // TODO: Implement AI insights API endpoint
          return [];
        }
      }
    },
    auth: {
      me: async () => {
        try {
          const user = await apiClient.me();
          // Return demo user if not authenticated
          if (!user) {
            return { full_name: 'Demo User', email: 'demo@example.com' };
          }
          return user;
        } catch (error) {
          // Silently handle auth errors - return demo user
          if (error.message === 'Unauthorized') {
            return { full_name: 'Demo User', email: 'demo@example.com' };
          }
          console.error('Error fetching user:', error);
          return { full_name: 'Demo User', email: 'demo@example.com' };
        }
      },
      login: async (email, password) => {
        return await apiClient.login(email, password);
      },
      logout: () => {
        apiClient.setToken(null);
        localStorage.removeItem('refresh_token');
      }
    },
    integrations: {
      Core: {
        InvokeLLM: async (payload = {}) => {
          // This would typically call a backend LLM endpoint
          // For now, we'll use a mock but prepare for real integration
          // TODO: Create backend endpoint for LLM calls
          return {
            intent: 'unknown',
            text: `Mock response generated for: ${String(payload.prompt || '').slice(0, 120)}`,
            action: null,
            should_trigger_workflow: false
          };
        }
      }
    }
  };
};

export const base44 = makeFallback();
export default base44;


