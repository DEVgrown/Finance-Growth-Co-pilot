import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  Wallet
} from 'lucide-react';

const Dashboard = () => {
  const { user, getBusinesses, activeBusinessId } = useAuth();
  const businesses = getBusinesses();
  const businessId = activeBusinessId || businesses[0]?.id;
  
  // Fetch dashboard data from the actual API endpoint
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['user-dashboard', businessId],
    queryFn: async () => {
      try {
        const url = businessId 
          ? `/users/user/dashboard/${businessId}/`
          : '/users/user/dashboard/';
        return await apiClient.request(url);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        return null;
      }
    },
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch customers from the actual API
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers', businessId],
    queryFn: async () => {
      try {
        // Try the correct endpoint first
        const params = businessId ? { business: businessId } : {};
        const queryString = Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : '';
        return await apiClient.request(`/users/customers/${queryString}`);
      } catch (error) {
        // If 404, return empty array (endpoint doesn't exist yet)
        if (error.status === 404 || error.message?.includes('404')) {
          console.warn('Customers endpoint not available yet');
          return [];
        }
        console.error('Error fetching customers:', error);
        return [];
      }
    },
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Get data from dashboard response
  const business = dashboardData?.business;
  const myWork = dashboardData?.my_work || {};
  const summary = dashboardData?.summary || {};
  
  // Calculate stats from dashboard data or customers
  const totalRevenue = summary.total_income || customers.reduce((sum, c) => sum + (c.total_invoiced || 0), 0);
  const totalExpenses = summary.total_expenses || 0;
  const totalPaid = customers.reduce((sum, c) => sum + (c.total_paid || 0), 0);
  const outstandingBalance = totalRevenue - totalPaid;
  const totalCustomers = customers.length || myWork.customers_count || 0;
  const activeCustomers = customers.filter(c => (c.total_invoiced || 0) > 0).length;

  // Format currency in KSH
  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Stats cards data
  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: summary.total_income ? 'Active' : 'N/A',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Total income/revenue'
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(outstandingBalance),
      change: outstandingBalance > 0 ? 'Pending' : 'Cleared',
      trend: outstandingBalance > 0 ? 'down' : 'up',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Amount pending payment'
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      change: `${activeCustomers} active`,
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${activeCustomers} active customers`
    },
    {
      title: 'Businesses',
      value: businesses.length.toString(),
      change: businesses.length > 0 ? 'Active' : 'No businesses',
      trend: 'neutral',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Total businesses'
    }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.first_name || user.username}!</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs">
                  {stat.trend === 'up' && (
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      <span>{stat.change}</span>
                    </div>
                  )}
                  {stat.trend === 'down' && (
                    <div className="flex items-center text-red-600">
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                      <span>{stat.change}</span>
                    </div>
                  )}
                  {stat.trend === 'neutral' && (
                    <span className="text-gray-500">{stat.change}</span>
                  )}
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Business Info & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Information */}
        {business && (
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Business Name</p>
                    <p className="font-semibold text-gray-900">{business.legal_name || business.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">DBA Name</p>
                    <p className="font-semibold text-gray-900">{business.dba_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Website</p>
                    <p className="font-semibold text-gray-900">{business.website || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Employees</p>
                    <p className="font-semibold text-gray-900">{business.employee_count || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {business.hq_city ? `${business.hq_city}, ${business.hq_country || ''}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left border border-gray-200">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Create Invoice</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left border border-gray-200">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Add Customer</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left border border-gray-200">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Record Payment</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left border border-gray-200">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">View Reports</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Recent Customers
            </CardTitle>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCustomers || loadingDashboard ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-500">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No customers found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first customer to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Invoiced</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Paid</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.slice(0, 10).map((customer) => {
                    const balance = (customer.total_invoiced || 0) - (customer.total_paid || 0);
                    return (
                      <tr key={customer.id || customer.customer_name || `customer-${Math.random()}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{customer.customer_name || 'N/A'}</div>
                          {customer.company_name && (
                            <div className="text-sm text-gray-500">{customer.company_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{customer.email || 'N/A'}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.customer_type === 'business' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {customer.customer_type || 'individual'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(customer.total_invoiced || 0)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-gray-600">
                          {formatCurrency(customer.total_paid || 0)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`text-sm font-semibold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {formatCurrency(balance)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
