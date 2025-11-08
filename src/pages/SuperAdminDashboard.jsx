import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Users, Building2, TrendingUp, Activity, 
  CheckCircle, Clock, AlertCircle, ArrowRight,
  LayoutDashboard, FileText, Shield, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CardSkeleton } from '../components/ui/skeleton';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['super-admin-dashboard'],
    queryFn: async () => {
      const response = await apiClient.request('/users/admin/dashboard/');
      return response;
    },
    enabled: isSuperAdmin(),
    staleTime: 60000 // 1 minute
  });

  const { data: pendingRegistrations = [] } = useQuery({
    queryKey: ['pending-registrations-count'],
    queryFn: async () => {
      return await apiClient.listPendingRegistrations();
    },
    enabled: isSuperAdmin(),
    staleTime: 30000 // 30 seconds
  });

  if (!isSuperAdmin()) {
    return (
      <div className="p-8">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
            <p className="text-red-600 font-medium">Access denied. Super Admin access required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">System-wide statistics and insights</p>
        </div>
        <Button 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['super-admin-dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['pending-registrations-count'] });
            toast.success('Dashboard refreshed');
          }}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.users?.active || 0} active users
            </p>
            <Link to="/super-admin/users" className="block mt-3">
              <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700 text-xs font-medium">
                Manage Users <ArrowRight className="w-3 h-3 ml-1 inline" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Businesses */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Businesses</CardTitle>
            <Building2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.businesses?.total || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.businesses?.active || 0} active businesses
            </p>
            <Link to="/super-admin/businesses" className="block mt-3">
              <Button variant="link" className="p-0 h-auto text-green-600 hover:text-green-700 text-xs font-medium">
                View All <ArrowRight className="w-3 h-3 ml-1 inline" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Approvals</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{pendingRegistrations.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Awaiting review
            </p>
            <Link to="/super-admin/approvals" className="block mt-3">
              <Button variant="link" className="p-0 h-auto text-yellow-600 hover:text-yellow-700 text-xs font-medium">
                Review Now <ArrowRight className="w-3 h-3 ml-1 inline" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Transactions</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.financial?.total_transactions || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.financial?.total_invoices || 0} invoices
            </p>
            <Link to="/super-admin/analytics" className="block mt-3">
              <Button variant="link" className="p-0 h-auto text-purple-600 hover:text-purple-700 text-xs font-medium">
                View Analytics <ArrowRight className="w-3 h-3 ml-1 inline" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/super-admin/users" className="block">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl hover:from-blue-100 hover:to-cyan-100 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">Manage all users and permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/approvals" className="block">
          <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-xl hover:from-yellow-100 hover:to-amber-100 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
                  <p className="text-sm text-gray-600">Review registration requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/businesses" className="block">
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl hover:from-green-100 hover:to-emerald-100 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Business Management</h3>
                  <p className="text-sm text-gray-600">Manage all businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Recent Users</CardTitle>
              <Link to="/super-admin/users">
                <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All <ArrowRight className="w-3 h-3 ml-1 inline" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent_users?.length > 0 ? (
                stats.recent_users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent users</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Businesses */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Recent Businesses</CardTitle>
              <Link to="/super-admin/businesses">
                <Button variant="link" className="p-0 h-auto text-green-600 hover:text-green-700 text-sm font-medium">
                  View All <ArrowRight className="w-3 h-3 ml-1 inline" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent_businesses?.length > 0 ? (
                stats.recent_businesses.slice(0, 5).map((business) => (
                  <div key={business.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {business.legal_name?.charAt(0).toUpperCase() || 'B'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{business.legal_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(business.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent businesses</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              User Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Super Admins</span>
                <span className="font-semibold text-gray-900">{stats?.users?.by_role?.admin || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Business Admins</span>
                <span className="font-semibold text-gray-900">{stats?.memberships?.business_admins || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Staff</span>
                <span className="font-semibold text-gray-900">{stats?.users?.by_role?.data_entry || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Viewers</span>
                <span className="font-semibold text-gray-900">{stats?.users?.by_role?.viewer || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Total Invoices</span>
                <span className="font-semibold text-gray-900">{stats?.financial?.total_invoices || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Paid Invoices</span>
                <span className="font-semibold text-green-600">{stats?.financial?.paid_invoices || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Overdue Invoices</span>
                <span className="font-semibold text-red-600">{stats?.financial?.overdue_invoices || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="font-semibold text-gray-900">{stats?.financial?.total_transactions || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-600">{stats?.users?.active || 0}</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Active Businesses</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-600">{stats?.businesses?.active || 0}</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">Pending Approvals</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-yellow-600">{pendingRegistrations.length}</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-600">System Status</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-600">Operational</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
