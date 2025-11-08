import React, { useState } from "react";
import base44 from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  PlusCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Receipt,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MetricCard from "../components/dashboard/MetricCard";
import { apiClient } from "@/lib/apiClient";

export default function DataEntryDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        return await apiClient.getUserProfile();
      } catch (error) {
        return null;
      }
    }
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date', 20),
    initialData: []
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 10),
    initialData: []
  });

  // Calculate stats for data entry user
  const stats = {
    totalTransactions: transactions.length,
    pendingTransactions: transactions.filter(t => !t.id).length,
    totalInvoices: invoices.length,
    pendingInvoices: invoices.filter(i => i.status === 'sent').length,
    todayEntries: transactions.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.transaction_date?.startsWith(today);
    }).length
  };

  // Handle loading states
  if (loadingTransactions || loadingInvoices) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            Data Entry Dashboard
            <FileText className="w-8 h-8 text-blue-500" />
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.full_name || 'User'}. Manage and input financial data
          </p>
        </div>
      </div>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Operation completed successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Entries"
          value={stats.todayEntries}
          icon={TrendingUp}
          color="blue"
          subtitle="Transactions added today"
        />
        <MetricCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={DollarSign}
          color="green"
          subtitle="All time entries"
        />
        <MetricCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon={Receipt}
          color="orange"
          subtitle="Awaiting processing"
        />
        <MetricCard
          title="Quick Actions"
          value="4"
          icon={PlusCircle}
          color="purple"
          subtitle="Available actions"
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/transactions?action=create')}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200"
            >
              <PlusCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">Add Transaction</span>
            </Button>
            <Button
              onClick={() => navigate('/invoices?action=create')}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200"
            >
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Create Invoice</span>
            </Button>
            <Button
              onClick={() => navigate('/invoices?action=import')}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200"
            >
              <Upload className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Import Invoices</span>
            </Button>
            <Button
              onClick={() => navigate('/clients?action=create')}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200"
            >
              <PlusCircle className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">Add Client</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description || 'No description'}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.party_name || 'N/A'} • {transaction.category || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}KES {transaction.amount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => navigate('/transactions')}
                variant="outline"
                className="w-full mt-4"
              >
                View All Transactions
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No transactions yet</p>
              <Button
                onClick={() => navigate('/transactions?action=create')}
                className="mt-4"
              >
                Create Your First Transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Items */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Pending Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.pendingInvoices > 0 || stats.pendingTransactions > 0 ? (
              <div className="space-y-3">
                {stats.pendingInvoices > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium text-orange-900">{stats.pendingInvoices} invoices pending</p>
                    <p className="text-sm text-orange-700">These need your attention</p>
                  </div>
                )}
                {stats.pendingTransactions > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900">{stats.pendingTransactions} transactions pending</p>
                    <p className="text-sm text-blue-700">Awaiting review</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <p>All items processed!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Data Entry Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Today's Entries</span>
                <span className="font-bold text-gray-900">{stats.todayEntries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Week</span>
                <span className="font-bold text-gray-900">
                  {transactions.filter(t => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return t.transaction_date && new Date(t.transaction_date) >= weekAgo;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="font-bold text-gray-900">
                  {transactions.filter(t => {
                    const now = new Date();
                    const month = now.getMonth();
                    const year = now.getFullYear();
                    return t.transaction_date && new Date(t.transaction_date).getMonth() === month && new Date(t.transaction_date).getFullYear() === year;
                  }).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
