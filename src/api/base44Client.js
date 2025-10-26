// Mock API client for development
// This will be replaced with actual Base44 API integration

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

export const base44 = {
  auth: {
    me: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData.user;
    },
    login: async (credentials) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, user: mockData.user };
    },
    logout: () => {
      console.log('Logged out');
    }
  },
  entities: {
    Business: {
      get: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockData.business;
      },
      update: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { ...mockData.business, ...data };
      }
    },
    Transaction: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockData.transactions;
      },
      create: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newTransaction = { id: Date.now(), ...data };
        mockData.transactions.push(newTransaction);
        return newTransaction;
      },
      update: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockData.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          mockData.transactions[index] = { ...mockData.transactions[index], ...data };
          return mockData.transactions[index];
        }
        throw new Error('Transaction not found');
      },
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        mockData.transactions = mockData.transactions.filter(t => t.id !== id);
        return { success: true };
      }
    },
    Invoice: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockData.invoices;
      },
      create: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newInvoice = { id: Date.now(), ...data };
        mockData.invoices.push(newInvoice);
        return newInvoice;
      },
      update: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockData.invoices.findIndex(i => i.id === id);
        if (index !== -1) {
          mockData.invoices[index] = { ...mockData.invoices[index], ...data };
          return mockData.invoices[index];
        }
        throw new Error('Invoice not found');
      },
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        mockData.invoices = mockData.invoices.filter(i => i.id !== id);
        return { success: true };
      },
      bulkCreate: async (invoices) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newInvoices = invoices.map((invoice, index) => ({ 
          id: Date.now() + index, 
          ...invoice 
        }));
        mockData.invoices.push(...newInvoices);
        return newInvoices;
      }
    },
    AIInsight: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockData.insights;
      },
      update: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockData.insights.findIndex(i => i.id === id);
        if (index !== -1) {
          mockData.insights[index] = { ...mockData.insights[index], ...data };
          return mockData.insights[index];
        }
        throw new Error('Insight not found');
      }
    },
    ProactiveAlert: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockData.alerts;
      },
      update: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockData.alerts.findIndex(a => a.id === id);
        if (index !== -1) {
          mockData.alerts[index] = { ...mockData.alerts[index], ...data };
          return mockData.alerts[index];
        }
        throw new Error('Alert not found');
      }
    },
    Customer: {
      create: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id: Date.now(), ...data };
      }
    },
    Supplier: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [];
      },
      create: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id: Date.now(), ...data };
      },
      update: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id, ...data };
      },
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
      }
    },
    LoanApplication: {
      list: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [];
      },
      create: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id: Date.now(), ...data };
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { file_url: 'https://example.com/uploaded-file.pdf' };
      },
      ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
          status: 'success',
          output: {
            invoices: [
              {
                invoice_number: 'INV-AI-001',
                customer_name: 'AI Extracted Customer',
                total_amount: 25000,
                items: [
                  { description: 'AI Extracted Item', quantity: 1, unit_price: 25000, total: 25000 }
                ]
              }
            ]
          }
        };
      }
    }
  }
};
