// API client that uses Django backend
// This maintains compatibility with existing code while connecting to real backend
import apiClient from '../lib/apiClient';

// Helper function to convert API response to entity format
const toEntity = (data) => ({
  ...data,
  id: data.id?.toString()
});

// Helper function to convert array of entities
const toEntities = (data) => Array.isArray(data) ? data.map(toEntity) : [];

// Base entity class
class Entity {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async list(sort = '') {
    try {
      const params = {};
      if (sort) {
        const [field, order] = sort.startsWith('-') ? [sort.substring(1), 'desc'] : [sort, 'asc'];
        params.ordering = order === 'desc' ? `-${field}` : field;
      }
      const data = await apiClient.get(`/finance/${this.endpoint}/`, { params });
      return toEntities(data);
    } catch (error) {
      console.error(`Error listing ${this.endpoint}:`, error);
      return [];
    }
  }

  async get(id) {
    try {
      const data = await apiClient.get(`/finance/${this.endpoint}/${id}/`);
      return toEntity(data);
    } catch (error) {
      console.error(`Error getting ${this.endpoint}:`, error);
      return null;
    }
  }

  async create(data) {
    try {
      const response = await apiClient.post(`/finance/${this.endpoint}/`, data);
      return toEntity(response);
    } catch (error) {
      console.error(`Error creating ${this.endpoint}:`, error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await apiClient.put(`/finance/${this.endpoint}/${id}/`, data);
      return toEntity(response);
    } catch (error) {
      console.error(`Error updating ${this.endpoint}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await apiClient.delete(`/finance/${this.endpoint}/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}:`, error);
      return false;
    }
  }
}

// Define all entity types
const entities = {
  Business: new Entity('businesses'),
  Transaction: new Entity('transactions'),
  Invoice: new Entity('invoices'),
  LoanApplication: new Entity('loan-applications'),
  CreditScore: new Entity('credit-scores'),
  Supplier: new Entity('suppliers'),
  Customer: new Entity('customers'),
  CashFlowForecast: new Entity('cash-flow-forecasts')
};

// AI Integration
const ai = {
  async generateInsight(prompt) {
    try {
      const response = await apiClient.post('/ai/generate-insight/', { prompt });
      return response.data;
    } catch (error) {
      console.error('Error generating AI insight:', error);
      throw error;
    }
  },
  
  async analyzeDocument(document) {
    try {
      const formData = new FormData();
      formData.append('document', document);
      const response = await apiClient.post('/ai/analyze-document/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }
};

// Core integrations
const integrations = {
  Core: {
    InvokeLLM: async ({ prompt, response_json_schema }) => {
      try {
        const response = await apiClient.post('/ai/invoke-llm/', {
          prompt,
          response_json_schema
        });
        return response.data;
      } catch (error) {
        console.error('Error invoking LLM:', error);
        throw error;
      }
    }
  }
};

// Main export
const base44 = {
  entities,
  integrations,
  ai,
  
  // Helper methods
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me/');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Add any other necessary methods here
  createCustomer: async (data) => {
    try {
      const response = await apiClient.post('/finance/customers/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
};

export default base44;
