// src/api/base44Client.js
import apiClient from '../lib/apiClient';

/**
 * Converts a data object to an entity with proper type handling
 * @param {Object} data - The data to convert
 * @returns {Object} The converted entity
 */
const toEntity = (data) => {
  if (!data) return null;
  return {
    ...data,
    id: data.id?.toString(),
    createdAt: data.created_at ? new Date(data.created_at) : null,
    updatedAt: data.updated_at ? new Date(data.updated_at) : null
  };
};

/**
 * Converts an array of data objects to entities
 * @param {Array|Object} data - The data to convert
 * @returns {Array} Array of converted entities
 */
const toEntities = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map(item => toEntity(item));
  }
  return [toEntity(data)];
};

/**
 * Base entity class for API interactions
 */
class Entity {
  /**
   * @param {string} endpoint - The API endpoint for this entity
   */
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Fetches a list of entities
   * @param {string} sort - Sort field with optional - prefix for descending
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of entities
   */
  async list(sort = '', params = {}) {
    try {
      // Ensure params is an object, not a number
      if (typeof params !== 'object' || params === null || Array.isArray(params)) {
        params = {};
      }
      
      if (sort) {
        const [field, order] = sort.startsWith('-') 
          ? [sort.substring(1), 'desc'] 
          : [sort, 'asc'];
        params.ordering = order === 'desc' ? `-${field}` : field;
      }
      
      const data = await apiClient.get(`/finance/${this.endpoint}/`, { params });
      return toEntities(data);
    } catch (error) {
      console.error(`Error listing ${this.endpoint}:`, error);
      // Return empty array for 404 or no permissions
      if (error.status === 404 || error.status === 403) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Fetches a single entity by ID
   * @param {string|number} id - The ID of the entity to fetch
   * @returns {Promise<Object|null>} The entity or null if not found
   */
  async get(id) {
    if (!id) return null;
    
    try {
      const data = await apiClient.get(`/finance/${this.endpoint}/${id}/`);
      return toEntity(data);
    } catch (error) {
      console.error(`Error getting ${this.endpoint}:`, error);
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Creates a new entity
   * @param {Object} data - The data for the new entity
   * @returns {Promise<Object>} The created entity
   */
  async create(data) {
    try {
      const response = await apiClient.post(`/finance/${this.endpoint}/`, data);
      return toEntity(response);
    } catch (error) {
      console.error(`Error creating ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Updates an existing entity
   * @param {string|number} id - The ID of the entity to update
   * @param {Object} data - The data to update
   * @returns {Promise<Object>} The updated entity
   */
  async update(id, data) {
    if (!id) throw new Error('ID is required for update');
    
    try {
      const response = await apiClient.put(`/finance/${this.endpoint}/${id}/`, data);
      return toEntity(response);
    } catch (error) {
      console.error(`Error updating ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Deletes an entity
   * @param {string|number} id - The ID of the entity to delete
   * @returns {Promise<boolean>} True if successful
   */
  async delete(id) {
    if (!id) throw new Error('ID is required for delete');
    
    try {
      await apiClient.delete(`/finance/${this.endpoint}/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}:`, error);
      if (error.status === 404) {
        return true; // Already deleted
      }
      throw error;
    }
  }
}

// Create entities with custom endpoint prefixes
class UserEntity extends Entity {
  async list(sort = '', params = {}) {
    try {
      // Ensure params is an object, not a number
      if (typeof params !== 'object' || params === null || Array.isArray(params)) {
        params = {};
      }
      
      if (sort) {
        const [field, order] = sort.startsWith('-') 
          ? [sort.substring(1), 'desc'] 
          : [sort, 'asc'];
        params.ordering = order === 'desc' ? `-${field}` : field;
      }
      
      const data = await apiClient.get(`/users/${this.endpoint}/`, { params });
      return toEntities(data);
    } catch (error) {
      console.error(`Error listing ${this.endpoint}:`, error);
      // Return empty array for 404 or no permissions
      if (error.status === 404 || error.status === 403) {
        return [];
      }
      throw error;
    }
  }
  
  async get(id) {
    try {
      const data = await apiClient.get(`/users/${this.endpoint}/${id}/`);
      return toEntity(data);
    } catch (error) {
      console.error(`Error getting ${this.endpoint}:`, error);
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  async create(data) {
    try {
      const response = await apiClient.post(`/users/${this.endpoint}/`, data);
      return toEntity(response);
    } catch (error) {
      console.error(`Error creating ${this.endpoint}:`, error);
      throw error;
    }
  }
  
  async update(id, data) {
    try {
      if (!id) {
        throw new Error('ID is required for update');
      }
      const response = await apiClient.put(`/users/${this.endpoint}/${id}/`, data);
      return toEntity(response);
    } catch (error) {
      console.error(`Error updating ${this.endpoint}:`, error);
      throw error;
    }
  }
  
  async delete(id) {
    try {
      await apiClient.delete(`/users/${this.endpoint}/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}:`, error);
      throw error;
    }
  }
}

const entities = {
  Business: new UserEntity('businesses'),
  Transaction: new Entity('transactions'),
  Invoice: new Entity('invoices'),
  LoanApplication: new Entity('loan-applications'),
  CreditScore: new Entity('credit-scores'),
  Supplier: new Entity('suppliers'),
  Customer: new UserEntity('customers'),
  CashFlowForecast: new Entity('cash-flow-forecasts'),
  VoiceConversation: new Entity('voice-conversations'),
  AIInsight: new Entity('ai-insights')
};

const auth = {
  /**
   * Logs in a user with credentials
   * @param {Object} credentials - The login credentials
   * @returns {Promise<{user: Object, tokens: Object}>} User and token information
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/token/', credentials);
      apiClient.setToken(response.access, response.refresh);
      
      const user = await this.getCurrentUser();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { 
        user, 
        tokens: {
          access: response.access,
          refresh: response.refresh
        } 
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  },

  /**
   * Gets the currently authenticated user
   * @returns {Promise<Object|null>} The current user or null if not authenticated
   */
  async getCurrentUser() {
    // Try to get from localStorage first
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        console.warn('Failed to parse cached user', e);
      }
    }

    // If no token, don't even try
    if (!apiClient.token) {
      return null;
    }

    try {
      const user = await apiClient.get('/users/me/');
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user || null;
    } catch (error) {
      if (error.status === 401) {
        apiClient.clearAuth();
      }
      return null;
    }
  },

  /**
   * Logs out the current user
   */
  logout() {
    try {
      // Try to revoke the token on the server
      if (apiClient.refreshToken) {
        apiClient.post('/auth/token/revoke/', { 
          refresh: apiClient.refreshToken 
        }).catch(console.error);
      }
    } finally {
      // Clear auth state regardless of server response
      apiClient.clearAuth();
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  },

  /**
   * Checks if a user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!apiClient.token;
  }
};

const ai = {
  async generateInsight(prompt) {
    try {
      const response = await apiClient.post('/ai/generate-insight/', { prompt });
      return response;
    } catch (error) {
      console.error('Error generating AI insight:', error);
      throw error;
    }
  },

  async analyzeDocument(document) {
    try {
      const formData = new FormData();
      formData.append('document', document);
      
      const response = await fetch(`${apiClient.baseURL}/ai/analyze-document/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Document analysis failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }
};

const base44 = {
  entities,
  auth,
  ai,
  getCurrentUser: auth.getCurrentUser,
  login: auth.login,
  logout: auth.logout,
  isAuthenticated: auth.isAuthenticated,
  createCustomer: async (data) => {
    return entities.Customer.create(data);
  },
  // Add me() as alias for getCurrentUser for backward compatibility
  me: auth.getCurrentUser
};

// Add auth.me for backward compatibility
base44.auth.me = auth.getCurrentUser;

export default base44;