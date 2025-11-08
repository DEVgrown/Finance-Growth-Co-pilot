import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  invoiceApi, 
  transactionApi, 
  creditApi, 
  cashFlowApi, 
  contactApi, 
  aiApi, 
  alertApi,
  dashboardApi
} from '@/services/api';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    recentActivity: [],
    financialSummary: {},
  });
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [creditScores, setCreditScores] = useState([]);
  const [cashFlow, setCashFlow] = useState({
    forecasts: [],
    projections: {},
  });
  const [contacts, setContacts] = useState({
    suppliers: [],
    clients: [],
  });
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        overview, 
        recentActivity, 
        financialSummary
      ] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getRecentActivity(),
        dashboardApi.getFinancialSummary(),
      ]);

      setDashboardData({
        overview: overview || {},
        recentActivity: recentActivity || [],
        financialSummary: financialSummary || {},
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices
  const fetchInvoices = async (params = {}) => {
    try {
      const data = await invoiceApi.getAll(params);
      setInvoices(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
      return [];
    }
  };

  // Fetch transactions
  const fetchTransactions = async (params = {}) => {
    try {
      const data = await transactionApi.getAll(params);
      setTransactions(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
      return [];
    }
  };

  // Fetch credit scores
  const fetchCreditScores = async () => {
    try {
      const data = await creditApi.getScores();
      setCreditScores(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError('Failed to fetch credit scores');
      console.error('Error fetching credit scores:', err);
      return [];
    }
  };

  // Fetch cash flow data
  const fetchCashFlowData = async () => {
    try {
      const [forecasts, projections] = await Promise.all([
        cashFlowApi.getForecasts(),
        cashFlowApi.getProjections(),
      ]);
      
      setCashFlow({
        forecasts: Array.isArray(forecasts) ? forecasts : [],
        projections: projections || {},
      });
      
      return { forecasts, projections };
    } catch (err) {
      setError('Failed to fetch cash flow data');
      console.error('Error fetching cash flow data:', err);
      return { forecasts: [], projections: {} };
    }
  };

  // Fetch contacts
  const fetchContacts = async (type = '') => {
    try {
      const data = await contactApi.getAll(type);
      
      if (type === 'supplier') {
        setContacts(prev => ({ ...prev, suppliers: Array.isArray(data) ? data : [] }));
      } else if (type === 'client') {
        setContacts(prev => ({ ...prev, clients: Array.isArray(data) ? data : [] }));
      } else {
        // If no type is specified, assume we're fetching all contacts
        // and try to separate them into suppliers and clients
        const suppliers = (Array.isArray(data) ? data : []).filter(c => c.type === 'supplier');
        const clients = (Array.isArray(data) ? data : []).filter(c => c.type === 'client');
        
        setContacts({
          suppliers,
          clients,
        });
      }
      
      return data;
    } catch (err) {
      setError(`Failed to fetch ${type || 'contacts'}`);
      console.error(`Error fetching ${type || 'contacts'}:`, err);
      return [];
    }
  };

  // Fetch AI insights
  const fetchInsights = async () => {
    try {
      const data = await aiApi.getInsights();
      setInsights(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError('Failed to fetch insights');
      console.error('Error fetching insights:', err);
      return [];
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const data = await alertApi.getAll();
      setAlerts(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
      return [];
    }
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId) => {
    try {
      await alertApi.markAsRead(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      return true;
    } catch (err) {
      setError('Failed to mark alert as read');
      console.error('Error marking alert as read:', err);
      return false;
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchInvoices(),
          fetchTransactions(),
          fetchCreditScores(),
          fetchCashFlowData(),
          fetchContacts(),
          fetchInsights(),
          fetchAlerts(),
        ]);
      } catch (err) {
        setError('Failed to load initial data');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Create the context value
  const contextValue = {
    // State
    loading,
    error,
    dashboardData,
    invoices,
    transactions,
    creditScores,
    cashFlow,
    contacts,
    insights,
    alerts,
    
    // Actions
    fetchDashboardData,
    fetchInvoices,
    fetchTransactions,
    fetchCreditScores,
    fetchCashFlowData,
    fetchContacts,
    fetchInsights,
    fetchAlerts,
    markAlertAsRead,
    
    // API methods
    invoiceApi,
    transactionApi,
    creditApi,
    cashFlowApi,
    contactApi,
    aiApi,
    alertApi,
    dashboardApi,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;
