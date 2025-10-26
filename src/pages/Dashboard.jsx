import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  UserPlus,
  Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Assuming Alert and AlertDescription are from shadcn/ui

import MetricCard from "../components/dashboard/MetricCard";
import CashFlowChart from "../components/dashboard/CashFlowChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import InvoiceStatus from "../components/dashboard/InvoiceStatus";
import QuickActions from "../components/dashboard/QuickActions";
import AIAlerts from "../components/dashboard/AIAlerts";
import ClientOnboarding from "../components/dashboard/ClientOnboarding";
import ImportInvoices from "../components/invoices/ImportInvoices";
import { api } from "../lib/api";

export default function Dashboard() {
  const [showClientOnboarding, setShowClientOnboarding] = useState(false);
  const [showImportInvoices, setShowImportInvoices] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-transaction_date', 50),
    initialData: []
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 20),
    initialData: []
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['insights'],
    queryFn: () => base44.entities.AIInsight.list('-created_date', 5),
    initialData: []
  });

  const { data: businessData, isLoading: loadingBusiness } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => api.business.list(),
    initialData: [] // Provide initial data to avoid undefined
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  // Set document title
  useEffect(() => {
    document.title = "Complete SME Finance System with Working AI Agent";
  }, []);

  React.useEffect(() => {
    const checkFirstLogin = async () => {
      if (user) {
        const isFirstLogin = localStorage.getItem(`welcomed_${user.email}`) !== 'true';
        if (isFirstLogin) {
          setShowWelcome(true);
          localStorage.setItem(`welcomed_${user.email}`, 'true');
          
          // Welcome voice message in Sheng
          const welcomeMessage = `Sasa ${user.full_name}! Karibu kwa FinanceGrowth Co-Pilot, manze! Si uko home kabisa. Tupo hapa kukusaidia na biashara yako, kutrack dough yako, na kufanya sure unaenda juu juu. Let's make that money moves, bro!`;
          
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(welcomeMessage);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            setTimeout(() => {
              window.speechSynthesis.speak(utterance);
            }, 1000);
          }
        }
      }
    };
    checkFirstLogin();
  }, [user]);

  const calculateMetrics = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const income = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = income - expenses;

    const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');

    return {
      income,
      expenses,
      netCashFlow,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      totalOutstanding: pendingInvoices.reduce((sum, i) => sum + i.total_amount, 0)
    };
  };

  // Handle loading states
  if (loadingBusiness || loadingTransactions || loadingInvoices) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  const metrics = calculateMetrics();
  
  // Initialize business data with fallback values
  const currentBusiness = businessData?.[0] || {
    name: 'Business Owner',
    revenue: 0,
    expenses: 0,
    profit: 0
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Welcome Alert */}
      {showWelcome && (
        <Alert className="bg-gradient-to-r from-green-500 to-teal-600 border-none text-white">
          <AlertDescription className="text-lg flex items-center gap-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <div>
              <strong>Karibu, {user?.full_name}!</strong> 
              <p className="text-sm text-white/90 mt-1">Welcome to your financial co-pilot. Let's grow your business together!</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showClientOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ClientOnboarding onClose={() => setShowClientOnboarding(false)} />
          </div>
        </div>
      )}

      {showImportInvoices && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ImportInvoices onClose={() => setShowImportInvoices(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            Welcome back, {currentBusiness.name}
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your business today</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowClientOnboarding(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Onboard Client
          </Button>
          <Button
            onClick={() => setShowImportInvoices(true)}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Invoices
          </Button>
          <QuickActions />
        </div>
      </div>

      {/* AI Alerts Section */}
      {insights.filter(i => !i.is_read && i.priority === 'critical').length > 0 && (
        <AIAlerts insights={insights.filter(i => !i.is_read && i.priority === 'critical')} />
      )}

      {/* Key Metrics - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Income"
          value={`KES ${metrics.income.toLocaleString()}`}
          icon={TrendingUp}
          trend="+12.5%"
          trendUp={true}
          color="green"
        />
        <MetricCard
          title="Monthly Expenses"
          value={`KES ${metrics.expenses.toLocaleString()}`}
          icon={TrendingDown}
          trend="+5.2%"
          trendUp={false}
          color="red"
        />
        <MetricCard
          title="Net Cash Flow"
          value={`KES ${metrics.netCashFlow.toLocaleString()}`}
          icon={DollarSign}
          trend={metrics.netCashFlow >= 0 ? "Positive" : "Negative"}
          trendUp={metrics.netCashFlow >= 0}
          color={metrics.netCashFlow >= 0 ? "blue" : "orange"}
        />
        <MetricCard
          title="Outstanding Invoices"
          value={`KES ${metrics.totalOutstanding.toLocaleString()}`}
          icon={Receipt}
          subtitle={`${metrics.pendingInvoices} pending`}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CashFlowChart transactions={transactions} />
          <RecentTransactions transactions={transactions.slice(0, 10)} />
        </div>

        <div className="space-y-6">
          <InvoiceStatus invoices={invoices} />
          
          {/* AI Insights Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 ${
                      insight.priority === 'critical' ? 'text-red-500' :
                      insight.priority === 'high' ? 'text-orange-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Link to={createPageUrl("Insights")}>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  View All Insights
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
