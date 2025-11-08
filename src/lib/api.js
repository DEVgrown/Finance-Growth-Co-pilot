const mockData = {
  businesses: [
    { 
      id: 1, 
      name: "Business 1",
      revenue: 150000,
      expenses: 80000,
      profit: 70000
    },
    { 
      id: 2, 
      name: "Business 2",
      revenue: 250000,
      expenses: 120000,
      profit: 130000
    }
  ],
  transactions: [],
  invoices: [],
  alerts: [
    { id: 1, message: "Alert 1" },
    { id: 2, message: "Alert 2" }
  ],
  insights: []
};

export const api = {
  business: {
    list: async () => Promise.resolve(mockData.businesses),
    get: async (id) => {
      const business = mockData.businesses.find(b => b.id === id);
      if (!business) throw new Error('Business not found');
      return Promise.resolve(business);
    }
  },
  transaction: {
    list: async () => Promise.resolve(mockData.transactions)
  },
  invoice: {
    list: async () => Promise.resolve(mockData.invoices)
  },
  alert: {
    list: async () => Promise.resolve(mockData.alerts)
  },
  insight: {
    list: async () => Promise.resolve(mockData.insights)
  }
};